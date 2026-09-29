from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser

from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.shortcuts import get_object_or_404
from config.brevo import send_brevo_email
from .models import Artwork, PurchaseRequest, CustomArtworkRequest
from .serializers import (
    ArtworkSerializer, 
    PurchaseRequestSerializer,
    CustomArtworkRequestSerializer,
)


class ArtworkListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAuthenticated()]

    def get(self, request):
        artworks = Artwork.objects.select_related(
            "artist",
            "artist__profile"
        ).all()

        serializer = ArtworkSerializer(
            artworks,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = ArtworkSerializer(
            data=request.data
        )

        if serializer.is_valid():
            artwork = serializer.save(
                artist=request.user
            )

            return Response(
                ArtworkSerializer(artwork).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class ArtworkDetailView(APIView):

    def get(self, request, artwork_id):
        artwork = get_object_or_404(
            Artwork.objects.select_related("artist"),
            id=artwork_id,
        )

        serializer = ArtworkSerializer(artwork)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class PurchaseRequestListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = (
            PurchaseRequest.objects
            .filter(buyer=request.user)
            .select_related("artwork", "artwork__artist")
            .order_by("-created_at")
        )

        serializer = PurchaseRequestSerializer(
            requests,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        artwork_id = request.data.get("artwork")
        request_type = request.data.get("request_type")
        offered_price = request.data.get("offered_price")

        artwork = get_object_or_404(
            Artwork,
            id=artwork_id,
        )

        if artwork.status != "available":
            return Response(
                {
                    "error": "This artwork is no longer available."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if artwork.artist == request.user:
            return Response(
                {
                    "error": "You cannot request to buy your own artwork."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request_type not in ["buy", "offer"]:
            return Response(
                {
                    "error": "Invalid request type."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request_type == "buy":
            offered_price = artwork.price

        if offered_price is None:
            return Response(
                {
                    "error": "An offered price is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            offered_price = Decimal(str(offered_price))
        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {
                    "error": "Invalid offered price."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if offered_price <= 0:
            return Response(
                {
                    "error": "Offered price must be greater than zero."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        purchase_request = PurchaseRequest.objects.create(
            artwork=artwork,
            buyer=request.user,
            request_type=request_type,
            offered_price=offered_price,
        )

        request_label = (
            "Request to Buy"
            if purchase_request.request_type == "buy"
            else "Make an Offer"
        )

        send_brevo_email(
            to_email=request.user.email,
            to_name=request.user.first_name,
            subject=f"ArtCircle — {request_label} Submitted",
            html_content=f"""
                <h2>ArtCircle — {request_label}</h2>

                <p>
                    Hi {request.user.first_name},
                </p>

                <p>
                    Your <strong>{request_label.lower()}</strong> for
                    <strong>{purchase_request.artwork.title}</strong>
                    has been submitted to the artist.
                </p>

                <p>
                    <strong>Amount:</strong>
                    €{purchase_request.offered_price}
                </p>

                <p>
                    <strong>Status:</strong>
                    Pending
                </p>

                <p>
                    The artist will review your request through ArtCircle.
                </p>

                <p>
                    Thank you for being part of ArtCircle.
                </p>
            """,
            text_content=(
                f"ArtCircle — {request_label} Submitted\n\n"
                f"Your {request_label.lower()} for "
                f"{purchase_request.artwork.title} has been submitted "
                f"to the artist.\n\n"
                f"Amount: €{purchase_request.offered_price}\n"
                f"Status: Pending\n"
            ),
            tag="purchase-request",
        )

        serializer = PurchaseRequestSerializer(
            purchase_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class CustomArtworkRequestListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        artwork_id = request.data.get("artwork")
        description = request.data.get("description", "").strip()
        budget = request.data.get("budget")

        artwork = get_object_or_404(
            Artwork.objects.select_related("artist"),
            id=artwork_id,
        )

        if artwork.artist == request.user:
            return Response(
                {
                    "error": "You cannot request custom artwork from yourself."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not description:
            return Response(
                {
                    "error": "Please describe what you would like."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        custom_request = CustomArtworkRequest.objects.create(
            artwork=artwork,
            artist=artwork.artist,
            requester=request.user,
            description=description,
            budget=budget if budget else None,
        )

        serializer = CustomArtworkRequestSerializer(
            custom_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class ArtistPurchaseRequestListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = (
            PurchaseRequest.objects
            .filter(artwork__artist=request.user)
            .select_related("artwork", "buyer")
            .order_by("-created_at")
        )

        serializer = PurchaseRequestSerializer(
            requests,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class ArtistPurchaseRequestStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, request_id):
        purchase_request = get_object_or_404(
            PurchaseRequest.objects.select_related(
                "artwork",
                "buyer",
            ),
            id=request_id,
        )

        if purchase_request.artwork.artist != request.user:
            return Response(
                {
                    "error": "You can only manage requests for your own artwork."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")

        if new_status not in ["accepted", "declined"]:
            return Response(
                {
                    "error": "Status must be accepted or declined."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if purchase_request.status != "pending":
            return Response(
                {
                    "error": "This request has already been processed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            new_status == "accepted"
            and purchase_request.artwork.status != "available"
        ):
            return Response(
                {
                    "error": "This artwork is no longer available."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            purchase_request.status = new_status
            purchase_request.save()

            if new_status == "accepted":
                purchase_request.artwork.status = "sold"
                purchase_request.artwork.save()

        serializer = PurchaseRequestSerializer(
            purchase_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class BuyerPurchaseRequestCancelView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, request_id):
        purchase_request = get_object_or_404(
            PurchaseRequest.objects.select_related("artwork"),
            id=request_id,
        )

        # Only the person who made the request can cancel it.
        if purchase_request.buyer != request.user:
            return Response(
                {"error": "You can only cancel your own requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only pending requests can be cancelled.
        if purchase_request.status != "pending":
            return Response(
                {"error": "Only pending requests can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        purchase_request.status = "cancelled"
        purchase_request.save()

        serializer = PurchaseRequestSerializer(purchase_request)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )