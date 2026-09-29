from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from django.db.models import Count

from marketplace.models import Review

from rest_framework.authtoken.models import Token

from .models import Profile, User, Conversation, Message
from .serializers import RegisterSerializer, ProfileSerializer, PublicProfileSerializer, PublicReviewSerializer, ConversationSerializer, MessageSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "Account created successfully.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": user.role,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(
            request,
            username=email,
            password=password
        )

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, created = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Login successful.",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK,
        )

class ProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(profile)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class PublicProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(
            User.objects.select_related("profile"),
            id=user_id,
        )

        profile, created = Profile.objects.get_or_create(
            user=user
        )

        reviews = (
            Review.objects
            .filter(artist=user)
            .select_related("buyer", "artwork")
            .order_by("-created_at")
        )

        average_rating = reviews.aggregate(
            average=Avg("rating")
        )["average"]

        profile_data = PublicProfileSerializer(profile).data

        profile_data["rating"] = (
            round(float(average_rating), 1)
            if average_rating is not None
            else None
        )

        profile_data["review_count"] = reviews.count()

        profile_data["reviews"] = PublicReviewSerializer(
            reviews[:5],
            many=True,
        ).data

        return Response(
            profile_data,
            status=status.HTTP_200_OK,
        )

class VerificationRequestView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        if profile.verification_status == "approved":
            return Response(
                {"error": "Your profile is already verified."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if profile.verification_status == "pending":
            return Response(
                {"error": "Your verification request is already pending."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile.verification_status = "pending"
        profile.save(update_fields=["verification_status"])

        return Response(
            {
                "message": "Your verification request has been submitted.",
                "verification_status": profile.verification_status,
            },
            status=status.HTTP_200_OK
        )

class ConversationListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = (
            Conversation.objects
            .filter(participants=request.user)
            .order_by("-updated_at")
        )

        serializer = ConversationSerializer(
            conversations,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        participant_id = request.data.get("participant_id")

        if not participant_id:
            return Response(
                {"error": "participant_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        other_user = get_object_or_404(
            User,
            id=participant_id
        )

        if other_user == request.user:
            return Response(
                {"error": "You cannot start a conversation with yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        conversation = (
            Conversation.objects
            .filter(participants=request.user)
            .filter(participants=other_user)
            .annotate(participant_count=Count("participants"))
            .filter(participant_count=2)
            .first()
        )

        if conversation is None:
            conversation = Conversation.objects.create()

            conversation.participants.add(
                request.user,
                other_user
            )

        serializer = ConversationSerializer(conversation)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class MessageListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, conversation_id):
        return get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=request.user,
        )

    def get(self, request, conversation_id):
        conversation = self.get_conversation(
            request,
            conversation_id
        )

        messages = conversation.messages.all()

        serializer = MessageSerializer(
            messages,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, conversation_id):
        conversation = self.get_conversation(
            request,
            conversation_id
        )

        body = request.data.get("body", "").strip()

        if not body:
            return Response(
                {"error": "Message body is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            body=body,
        )

        conversation.save()

        serializer = MessageSerializer(message)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )