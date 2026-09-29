from django.urls import path
from .views import (
    ArtworkListCreateView,
    ArtworkDetailView,
    PurchaseRequestListCreateView,
    ArtistPurchaseRequestListView,
    ArtistPurchaseRequestStatusView,
    CustomArtworkRequestListCreateView,
    BuyerPurchaseRequestCancelView
)


urlpatterns = [
    path(
        "artworks/",
        ArtworkListCreateView.as_view(),
        name="artwork-list-create",
    ),

    path(
        "artworks/<int:artwork_id>/",
        ArtworkDetailView.as_view(),
        name="artwork-detail",
    ),

    path(
        "purchase-requests/",
        PurchaseRequestListCreateView.as_view(),
        name="purchase-request-list-create",
    ),

    path(
        "artist-requests/",
        ArtistPurchaseRequestListView.as_view(),
        name="artist-request-list",
    ),

    path(
        "artist-requests/<int:request_id>/",
        ArtistPurchaseRequestStatusView.as_view(),
        name="artist-request-status",
    ),

    path(
        "custom-requests/",
        CustomArtworkRequestListCreateView.as_view(),
        name="custom-request-create",
    ),

    path(
        "purchase-requests/<int:request_id>/cancel/",
        BuyerPurchaseRequestCancelView.as_view(),
    ),
]