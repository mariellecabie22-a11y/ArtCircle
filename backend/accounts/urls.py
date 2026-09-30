from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    DeleteAccountView,
    VerificationRequestView,
    PublicProfileView,
    ConversationListView,
    MessageListCreateView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path(
        "delete-account/",
        DeleteAccountView.as_view(),
        name="delete-account",
    ),
    path(
        "profile/verification-request/",
        VerificationRequestView.as_view(),
    ),
    path(
        "public-profile/<int:user_id>/",
        PublicProfileView.as_view(),
        name="public-profile",
    ),
    path(
        "conversations/",
        ConversationListView.as_view(),
        name="conversation-list",
    ),

    path(
        "conversations/<int:conversation_id>/messages/",
        MessageListCreateView.as_view(),
        name="message-list-create",
    ),
]