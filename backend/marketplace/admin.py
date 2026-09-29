from django.contrib import admin

from .models import Artwork, PurchaseRequest, Review


@admin.register(Artwork)
class ArtworkAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "artist",
        "price",
        "category",
        "status",
        "created_at",
    )
    list_filter = (
        "category",
        "status",
    )
    search_fields = (
        "title",
        "artist__email",
        "artist__first_name",
        "artist__last_name",
    )


@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = (
        "artwork",
        "buyer",
        "request_type",
        "offered_price",
        "status",
        "created_at",
    )
    list_filter = (
        "request_type",
        "status",
    )
    search_fields = (
        "artwork__title",
        "buyer__email",
        "buyer__first_name",
        "buyer__last_name",
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "artwork",
        "artist",
        "buyer",
        "rating",
        "created_at",
    )
    list_filter = (
        "rating",
        "created_at",
    )
    search_fields = (
        "artwork__title",
        "artist__email",
        "artist__first_name",
        "artist__last_name",
        "buyer__email",
        "buyer__first_name",
        "buyer__last_name",
    )