from rest_framework import serializers
from django.db.models import Avg
from .models import Artwork, PurchaseRequest, CustomArtworkRequest


class ArtworkSerializer(serializers.ModelSerializer):
    artist_name = serializers.SerializerMethodField()
    artist_verified = serializers.SerializerMethodField()
    artist_rating = serializers.SerializerMethodField()
    artist_review_count = serializers.SerializerMethodField()

    class Meta:
        model = Artwork
        fields = "__all__"
        read_only_fields = ["artist"]

    def get_artist_name(self, obj):
        return f"{obj.artist.first_name} {obj.artist.last_name}"

    def get_artist_verified(self, obj):
        return (
            hasattr(obj.artist, "profile")
            and obj.artist.profile.verification_status == "approved"
        )

    def get_artist_rating(self, obj):
        rating = obj.artist.received_reviews.aggregate(
            average=Avg("rating")
        )["average"]

        return round(float(rating), 1) if rating is not None else None
    
    def get_artist_review_count(self, obj):
        return obj.artist.received_reviews.count()

class PurchaseRequestSerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    artwork_title = serializers.CharField(
        source="artwork.title",
        read_only=True,
    )

    class Meta:
        model = PurchaseRequest
        fields = [
            "id",
            "artwork",
            "artwork_title",
            "buyer",
            "buyer_name",
            "request_type",
            "offered_price",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "buyer",
            "buyer_name",
            "artwork_title",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_buyer_name(self, obj):
        name = f"{obj.buyer.first_name} {obj.buyer.last_name}".strip()
        return name or obj.buyer.email

class CustomArtworkRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    artist_name = serializers.SerializerMethodField()
    artwork_title = serializers.CharField(
        source="artwork.title",
        read_only=True,
    )

    class Meta:
        model = CustomArtworkRequest
        fields = [
            "id",
            "artwork",
            "artwork_title",
            "artist",
            "artist_name",
            "requester",
            "requester_name",
            "description",
            "budget",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "artist",
            "artist_name",
            "requester",
            "requester_name",
            "artwork_title",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_requester_name(self, obj):
        name = (
            f"{obj.requester.first_name} "
            f"{obj.requester.last_name}"
        ).strip()

        return name or obj.requester.email

    def get_artist_name(self, obj):
        name = (
            f"{obj.artist.first_name} "
            f"{obj.artist.last_name}"
        ).strip()

        return name or obj.artist.email