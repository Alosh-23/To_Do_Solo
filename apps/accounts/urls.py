from django.contrib.auth import views as auth_views
from django.urls import path

from .views import (
    ProfileView,
    ProfileUpdateView,
    SettingsView,
)

app_name = "accounts"


urlpatterns = [

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    path(
        "profile/edit/",
        ProfileUpdateView.as_view(),
        name="profile_edit",
    ),

    path(
        "settings/",
        SettingsView.as_view(),
        name="settings",
    ),

    path(
        "password-reset/",
        auth_views.PasswordResetView.as_view(
            template_name="accounts/password/password_reset_form.html",
            email_template_name="accounts/password/password_reset_email.html",
            success_url="/account/password-reset/done/",
        ),
        name="password_reset",
    ),

    path(
        "password-reset/done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="accounts/password/password_reset_done.html",
        ),
        name="password_reset_done",
    ),

    path(
        "password-reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="accounts/password/password_reset_confirm.html",
            success_url="/account/password-reset/complete/",
        ),
        name="password_reset_confirm",
    ),

    path(
        "password-reset/complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password/password_reset_complete.html",
        ),
        name="password_reset_complete",
    ),


]