from django.contrib.auth.views import LogoutView
from django.urls import include, path, reverse_lazy
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import (
    PasswordResetDoneView,
    PasswordResetConfirmView,
    PasswordResetCompleteView,
)


from .api_views import (
    TaskListAPIView,
    TaskToggleCompleteAPIView,
    TaskDeleteAPIView,
    StatsAPIView,
    TaskCreateAPIView,
    TaskUpdateAPIView,
)



from .views import (
    DashboardView,
    TasksView,
    StatsView,
    AchievementsView,
    ForgotPasswordView,
    LoginView,
    RegisterView,
    TaskCreateView,
    TaskDetailView,
    TaskDeleteView,
    TaskToggleCompleteView,
    TaskUpdateView,
    VerifyEmailView,
    
)

app_name = "tasks"

urlpatterns = [

    path(
        "",
        DashboardView.as_view(),
        name="dashboard",
    ),

    path(
        "tasks/",
        TasksView.as_view(),
        name="tasks",
    ),
    
    path(
        "stats/",
        StatsView.as_view(),
        name="stats",
    ),

    path(
        "achievements/",
        AchievementsView.as_view(),
        name="achievements",
    ),

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot_password",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "task/add/",
        TaskCreateView.as_view(),
        name="task_create",
    ),

    path(
        "task/<int:pk>/",
        TaskDetailView.as_view(),
        name="task_detail",
    ),

    path(
        "task/<int:pk>/edit/",
        TaskUpdateView.as_view(),
        name="task_update",
    ),
    path(
        "task/<int:pk>/toggle-complete/",
        TaskToggleCompleteView.as_view(),
        name="task_toggle_complete",
    ),

    path(
        "task/<int:pk>/delete/",
        TaskDeleteView.as_view(),
        name="task_delete",
    ),

    path(
        "verify-email/",
        VerifyEmailView.as_view(),
        name="verify_email",
    ),

    path(
        "account/",
        include("apps.accounts.urls"),
    ),

    path(
        "password-reset/",
        ForgotPasswordView.as_view(),
        name="password_reset",
    ),

    path(
        "password-reset/done/",
            auth_views.PasswordResetDoneView.as_view(
            template_name="accounts/password/password_reset_done.html"
        ),
        name="password_reset_done",
    ),

    path(
        "password-reset/confirm/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="accounts/password/password_reset_confirm.html",
            success_url=reverse_lazy("tasks:password_reset_complete"),
        ),
        name="password_reset_confirm",
    ),

    path(
        "password-reset/complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),

    path(
        "password-reset/done/",
        PasswordResetDoneView.as_view(
            template_name="accounts/password/password_reset_done.html"
        ),
        name="password_reset_done",
    ),

    path(
        "password-reset/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(
            template_name="accounts/password/password_reset_confirm.html"
        ),
        name="password_reset_confirm",
    ),

    path(
        "password-reset/complete/",
        PasswordResetCompleteView.as_view(
            template_name="accounts/password/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),

        path(
        "api/tasks/",
        TaskListAPIView.as_view(),
        name="api_tasks",
    ),

    path(
        "api/tasks/<int:pk>/toggle/",
        TaskToggleCompleteAPIView.as_view(),
        name="api_task_toggle",
    ),

    path(
        "api/tasks/<int:pk>/delete/",
        TaskDeleteAPIView.as_view(),
        name="api_task_delete",
    ),

    path(
        "api/stats/",
        StatsAPIView.as_view(),
        name="api_stats",
    ),

    path(
        "api/tasks/create/",
        TaskCreateAPIView.as_view(),
        name="api_task_create",
    ),

    path(
        "api/tasks/<int:pk>/update/",
        TaskUpdateAPIView.as_view(),
        name="api_task_update",
    ),



]