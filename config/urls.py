from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from django.views.i18n import set_language


urlpatterns = [

    path("admin/", admin.site.urls),

    path("", include("apps.tasks.urls")),

    path(
        "i18n/setlang/",
        set_language,
        name="set_language",
    ),

    path(
        "password-reset/complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),
]