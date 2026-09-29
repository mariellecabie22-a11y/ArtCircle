from rest_framework import serializers
from .models import User, Profile, Conversation, Message
from marketplace.models import Review
from django.db.models import Avg


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "password2",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        Profile.objects.create(user=user)

        return user

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        source="user.email"
    )

    first_name = serializers.CharField(
        source="user.first_name"
    )

    last_name = serializers.CharField(
        source="user.last_name",
        allow_blank=True,
        required=False
    )

    role = serializers.CharField(
        source="user.role",
        read_only=True
    )

    class Meta:
        model = Profile
        fields = [
            "email",
            "first_name",
            "last_name",
            "role",
            "profile_photo",
            "bio",
            "verification_status",
        ]

        read_only_fields = [
            "role",
            "verification_status",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        user = instance.user

        if "email" in user_data:
            user.email = user_data["email"]

        if "first_name" in user_data:
            user.first_name = user_data["first_name"]

        if "last_name" in user_data:
            user.last_name = user_data["last_name"]

        user.save()

        return super().update(instance, validated_data)

class PublicReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "rating",
            "comment",
            "created_at",
            "reviewer_name",
        ]

        read_only_fields = fields

    def get_reviewer_name(self, obj):
        name = f"{obj.buyer.first_name} {obj.buyer.last_name}".strip()
        return name or obj.buyer.email


class PublicProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    class Meta:
        model = Profile
        fields = [
            "first_name",
            "last_name",
            "profile_photo",
            "bio",
            "verification_status",
        ]

        read_only_fields = fields

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
        ]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "body",
            "is_read",
            "created_at",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSummarySerializer(
        many=True,
        read_only=True
    )

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participants",
            "last_message",
            "created_at",
            "updated_at",
        ]

    def get_last_message(self, conversation):
        message = conversation.messages.order_by("-created_at").first()

        if not message:
            return None

        return MessageSerializer(message).data