from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import (
    LoginView as DjangoLoginView,
    PasswordResetView,
)
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import (
    CreateView,
    DetailView,
    ListView,
    TemplateView,
    UpdateView,
)
from django.utils import timezone

from .forms import LoginForm, TaskForm
from .models import Task, Profile , DailyActivity, Achievement
from .services import calculate_streak
from django.contrib.auth import login
from apps.accounts.forms import RegisterForm


class DashboardView(LoginRequiredMixin, ListView):
    """
    Dashboard displaying the user's tasks.
    """

    model = Task

    template_name = "dashboard/dashboard.html"

    context_object_name = "tasks"

    def get_queryset(self):
        return (
            Task.objects
            .filter(user=self.request.user)
            .order_by("-created_at")
        )

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)

        profile, created = Profile.objects.get_or_create(
            user=self.request.user
        )

        current_xp = profile.xp

        xp_progress = current_xp % 100

        xp_to_next_level = 100 - xp_progress

        context["xp_progress"] = xp_progress
        context["xp_to_next_level"] = xp_to_next_level

        context["streak"] = calculate_streak(self.request.user)

        total_tasks = Task.objects.filter(
            user=self.request.user
        ).count()

        completed_tasks = Task.objects.filter(
            user=self.request.user,
            completed=True,
        ).count()

        pending_tasks = total_tasks - completed_tasks

        completion_rate = (
            round((completed_tasks / total_tasks) * 100)
            if total_tasks > 0
            else 0
        )

        context["total_tasks"] = total_tasks
        context["completed_tasks"] = completed_tasks
        context["pending_tasks"] = pending_tasks
        context["completion_rate"] = completion_rate

        return context

class TasksView(LoginRequiredMixin, ListView):
    """
    Display all tasks belonging to the current user.
    """

    model = Task
    template_name = "tasks/tasks.html"
    context_object_name = "tasks"

    def get_queryset(self):
        return (
            Task.objects
            .filter(user=self.request.user)
            .order_by("-created_at")
        )

class StatsView(LoginRequiredMixin, TemplateView):

    template_name = "stats/stats.html"

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)

        user = self.request.user

        tasks = Task.objects.filter(user=user)

        total_tasks = tasks.count()

        completed_tasks = tasks.filter(
            completed=True
        ).count()

        pending_tasks = tasks.filter(
            completed=False
        ).count()

        if total_tasks > 0:
            completion_rate = round(
                (completed_tasks / total_tasks) * 100
            )
        else:
            completion_rate = 0

        profile, created = Profile.objects.get_or_create(
            user=user
        )

        context["total_tasks"] = total_tasks
        context["completed_tasks"] = completed_tasks
        context["pending_tasks"] = pending_tasks
        context["completion_rate"] = completion_rate
        context["xp"] = profile.xp
        context["level"] = profile.level
        context["streak"] = calculate_streak(user)

        return context

class LoginView(DjangoLoginView):
    """
    User Login
    """

    template_name = "accounts/login.html"

    authentication_form = LoginForm

    redirect_authenticated_user = True

    success_url = reverse_lazy("tasks:dashboard")


class RegisterView(View):

    def get(self, request):
        form = RegisterForm()

        return render(
            request,
            "accounts/register.html",
            {"form": form},
        )

    def post(self, request):
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = form.save()

            login(request, user)

            return redirect("tasks:dashboard")

        return render(
            request,
            "accounts/register.html",
            {"form": form},
        )


class ForgotPasswordView(PasswordResetView):
    template_name = "accounts/forgot_password.html"
    email_template_name = "accounts/password/password_reset_email.html"
    subject_template_name = "accounts/password/password_reset_subject.txt"
    success_url = reverse_lazy("tasks:password_reset_done")


class VerifyEmailView(TemplateView):
    template_name = "accounts/verify_email.html"


class TaskCreateView(LoginRequiredMixin, CreateView):
    model = Task

    form_class = TaskForm

    template_name = "tasks/task_form.html"

    success_url = reverse_lazy("tasks:dashboard")

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)


class TaskUpdateView(LoginRequiredMixin, UpdateView):

    model = Task

    form_class = TaskForm

    template_name = "tasks/task_form.html"

    success_url = reverse_lazy("tasks:dashboard")

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user
        )


class TaskDetailView(LoginRequiredMixin, DetailView):

    model = Task

    template_name = "tasks/task_detail.html"

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user
        )

class TaskToggleCompleteView(LoginRequiredMixin, View):

    def post(self, request, pk):

        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user,
        )

        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        if task.completed:

            # Mark as incomplete
            task.completed = False
            task.status = Task.Status.TODO
            task.completed_at = None

            # Remove the XP that was awarded for this task
            profile.xp = max(0, profile.xp - 10)

        else:

            # Mark as completed
            task.completed = True
            task.status = Task.Status.DONE
            task.completed_at = timezone.now()

            # Award XP
            profile.xp += 10

            # Record today's activity for the streak.
            # get_or_create prevents multiple tasks on the same day
            # from increasing the streak more than once.
            DailyActivity.objects.get_or_create(
                user=request.user,
                date=timezone.localdate(),
            )

        # Calculate level
        profile.level = (profile.xp // 100) + 1

        profile.save(
            update_fields=[
                "xp",
                "level",
                "updated_at",
            ]
        )

        task.save(
            update_fields=[
                "completed",
                "status",
                "completed_at",
                "updated_at",
            ]
        )

        return redirect("tasks:dashboard")


class TaskDeleteView(LoginRequiredMixin, View):
    def post(self, request, pk):
        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user,
        )

        task.delete()

        return redirect("tasks:dashboard")

class AchievementsView(LoginRequiredMixin, TemplateView):
    template_name = "achievements/achievements.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["unlocked_achievements"] = (
            Achievement.objects
            .filter(user=self.request.user)
            .order_by("-unlocked_at")
        )

        context["achievement_keys"] = Achievement.Key.choices

        return context