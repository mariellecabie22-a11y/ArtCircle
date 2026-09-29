from django.conf import settings
from django.db import models


class Artwork(models.Model):

    CATEGORY_CHOICES = [
        ("painting", "Painting"),
        ("drawing", "Drawing"),
        ("digital", "Digital Art"),
        ("photography", "Photography"),
        ("sculpture", "Sculpture"),
        ("mixed_media", "Mixed Media"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("available", "Available"),
        ("reserved", "Reserved"),
        ("sold", "Sold"),
    ]

    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="artworks",
    )

    title = models.CharField(max_length=150)

    description = models.TextField(max_length=2000)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
    )

    image = models.ImageField(
        upload_to="artwork_images/"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="available",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class PurchaseRequest(models.Model):

    REQUEST_TYPE_CHOICES = [
        ("buy", "Request to Buy"),
        ("offer", "Make an Offer"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("cancelled", "Cancelled"),
    ]

    artwork = models.ForeignKey(
        Artwork,
        on_delete=models.CASCADE,
        related_name="purchase_requests",
    )

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="purchase_requests",
    )

    request_type = models.CharField(
        max_length=10,
        choices=REQUEST_TYPE_CHOICES,
    )

    offered_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.artwork.title}"

class Review(models.Model):
    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_reviews",
    )

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="written_reviews",
    )

    artwork = models.ForeignKey(
        Artwork,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveIntegerField()
    comment = models.TextField(
        max_length=1000,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["buyer", "artwork"],
                name="unique_buyer_artwork_review",
            )
        ]

    def __str__(self):
        return f"{self.rating}/5 - {self.artwork.title}"

class CustomArtworkRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("cancelled", "Cancelled"),
    ]

    artwork = models.ForeignKey(
        Artwork,
        on_delete=models.CASCADE,
        related_name="custom_requests",
    )

    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="custom_artwork_requests_received",
    )

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="custom_artwork_requests",
    )

    description = models.TextField(
        max_length=2000
    )

    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Custom request - {self.artwork.title}"