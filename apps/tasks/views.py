from django.contrib.auth import login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import (
    LoginView as DjangoLoginView,
    PasswordResetView,
)
from django.http import JsonResponse
from django.shortcuts import (
    get_object_or_404,
    redirect,
    render,
)
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext as _
from django.views import View
from django.views.generic import (
    CreateView,
    DetailView,
    ListView,
    TemplateView,
    UpdateView,
)

from apps.accounts.forms import RegisterForm

from .forms import LoginForm, TaskForm
from .models import (
    Achievement,
    MissionRewardClaim,
    Profile,
    QuestRewardClaim,
    Task,
)
from .services import (
    calculate_streak,
    get_historical_completed_tasks,
    get_today_completed_tasks,
    get_user_progress,
    record_task_completion_progress,
    synchronize_progress_counters,
    unlock_achievements,
)


# ==========================================================
# DASHBOARD
# ==========================================================

class DashboardView(
    LoginRequiredMixin,
    ListView,
):
    """
    Dashboard displaying the user's tasks and progress.
    """

    model = Task

    template_name = "dashboard/dashboard.html"

    context_object_name = "tasks"

    def get_queryset(self):
        return (
            Task.objects
            .filter(
                user=self.request.user
            )
            .order_by("-created_at")
        )

    def get_context_data(self, **kwargs):

        context = super().get_context_data(
            **kwargs
        )

        user = self.request.user

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        current_xp = profile.xp

        xp_progress = current_xp % 100

        xp_to_next_level = (
            100 - xp_progress
            if xp_progress > 0
            else 100
        )

        context["xp_progress"] = xp_progress

        context["xp_to_next_level"] = (
            xp_to_next_level
        )

        context["streak"] = (
            calculate_streak(user)
        )

        tasks = Task.objects.filter(
            user=user
        )

        total_tasks = tasks.count()

        completed_tasks = (
            tasks
            .filter(
                completed=True
            )
            .count()
        )

        pending_tasks = (
            total_tasks - completed_tasks
        )

        completion_rate = (
            round(
                (
                    completed_tasks /
                    total_tasks
                ) * 100
            )
            if total_tasks > 0
            else 0
        )

        context["total_tasks"] = (
            total_tasks
        )

        context["completed_tasks"] = (
            completed_tasks
        )

        context["pending_tasks"] = (
            pending_tasks
        )

        context["completion_rate"] = (
            completion_rate
        )

        context["level"] = profile.level

        context["xp"] = profile.xp

        return context


# ==========================================================
# TASKS
# ==========================================================

class TasksView(
    LoginRequiredMixin,
    ListView,
):
    """
    Display all tasks belonging to the current user.
    """

    model = Task

    template_name = "tasks/tasks.html"

    context_object_name = "tasks"

    def get_queryset(self):

        return (
            Task.objects
            .filter(
                user=self.request.user
            )
            .order_by("-created_at")
        )


class TaskCreateView(
    LoginRequiredMixin,
    CreateView,
):
    """
    Create a new task for the current user.
    """

    model = Task

    form_class = TaskForm

    template_name = "tasks/task_form.html"

    success_url = reverse_lazy(
        "tasks:dashboard"
    )

    def form_valid(self, form):

        form.instance.user = (
            self.request.user
        )

        return super().form_valid(
            form
        )


class TaskUpdateView(
    LoginRequiredMixin,
    UpdateView,
):
    """
    Update an existing task belonging to
    the current user.
    """

    model = Task

    form_class = TaskForm

    template_name = "tasks/task_form.html"

    success_url = reverse_lazy(
        "tasks:dashboard"
    )

    def get_queryset(self):

        return Task.objects.filter(
            user=self.request.user
        )


class TaskDetailView(
    LoginRequiredMixin,
    DetailView,
):
    """
    Display a single task belonging to
    the current user.
    """

    model = Task

    template_name = "tasks/task_detail.html"

    def get_queryset(self):

        return Task.objects.filter(
            user=self.request.user
        )


class TaskToggleCompleteView(
    LoginRequiredMixin,
    View,
):
    """
    Legacy/server-side task toggle.

    Keeps the same XP behavior as the API while also
    recording persistent mission and quest progress.
    """

    def post(self, request, pk):

        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user,
        )

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=request.user
            )
        )

        was_completed = task.completed

        newly_completed = False

        # ==================================================
        # MARK AS INCOMPLETE
        # ==================================================

        if was_completed:

            task.completed = False

            task.status = (
                Task.Status.TODO
            )

            task.completed_at = None

            profile.xp = max(
                0,
                profile.xp - 10,
            )

        # ==================================================
        # MARK AS COMPLETE
        # ==================================================

        else:

            task.completed = True

            task.status = (
                Task.Status.DONE
            )

            task.completed_at = (
                timezone.now()
            )

            profile.xp += 10

            newly_completed = True

        # ==================================================
        # UPDATE LEVEL
        # ==================================================

        profile.level = (
            profile.xp // 100
        ) + 1

        profile.save(
            update_fields=[
                "xp",
                "level",
                "updated_at",
            ]
        )

        # ==================================================
        # SAVE TASK
        # ==================================================

        task.save(
            update_fields=[
                "completed",
                "status",
                "completed_at",
                "updated_at",
            ]
        )

        # ==================================================
        # RECORD PERSISTENT PROGRESS
        # ==================================================

        if newly_completed:

            record_task_completion_progress(
                user=request.user,
                task=task,
            )

        # ==================================================
        # SYNCHRONIZE PROGRESS
        # ==================================================

        synchronize_progress_counters(
            request.user
        )

        # ==================================================
        # UNLOCK ACHIEVEMENTS
        # ==================================================

        unlocked_achievements = (
            unlock_achievements(
                request.user
            )
        )

        # ==================================================
        # RESPONSE
        # ==================================================

        return JsonResponse({

            "success":
                True,

            "task": {

                "id":
                    task.pk,

                "title":
                    task.title,

                "completed":
                    task.completed,

                "status":
                    task.status,

                "completed_at": (
                    task.completed_at.isoformat()
                    if task.completed_at
                    else None
                ),

            },

            "profile": {

                "xp":
                    profile.xp,

                "level":
                    profile.level,

                "streak":
                    calculate_streak(
                        request.user
                    ),

                "completed_tasks_total": (
                    profile.completed_tasks_total
                ),

            },

            "unlocked_achievements": [

                {

                    "key":
                        achievement.key,

                    "label":
                        achievement.get_key_display(),

                    "unlocked_at": (
                        achievement
                        .unlocked_at
                        .isoformat()
                    ),

                }

                for achievement
                in unlocked_achievements

            ],

        })


class TaskDeleteView(
    LoginRequiredMixin,
    View,
):
    """
    Delete a task belonging to the current user.

    Deleting a task does not modify:
        - XP
        - historical mission progress
        - daily quest progress
        - achievements
    """

    def post(self, request, pk):

        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user,
        )

        task.delete()

        return redirect(
            "tasks:dashboard"
        )


# ==========================================================
# STATISTICS
# ==========================================================

class StatsView(
    LoginRequiredMixin,
    TemplateView,
):
    """
    Display the user's productivity statistics.
    """

    template_name = (
        "stats/stats.html"
    )

    def get_context_data(self, **kwargs):

        context = super().get_context_data(
            **kwargs
        )

        user = self.request.user

        tasks = Task.objects.filter(
            user=user
        )

        total_tasks = tasks.count()

        completed_tasks = (
            tasks
            .filter(
                completed=True
            )
            .count()
        )

        pending_tasks = (
            tasks
            .filter(
                completed=False
            )
            .count()
        )

        completion_rate = (
            round(
                (
                    completed_tasks /
                    total_tasks
                ) * 100
            )
            if total_tasks > 0
            else 0
        )

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        context["total_tasks"] = (
            total_tasks
        )

        context["completed_tasks"] = (
            completed_tasks
        )

        context["pending_tasks"] = (
            pending_tasks
        )

        context["completion_rate"] = (
            completion_rate
        )

        context["xp"] = profile.xp

        context["level"] = profile.level

        context["streak"] = (
            calculate_streak(user)
        )

        return context


# ==========================================================
# ACHIEVEMENTS
# ==========================================================

class AchievementsView(
    LoginRequiredMixin,
    TemplateView,
):
    """
    Display all achievements with their unlocked state
    and the requirement needed to unlock each one.
    """

    template_name = (
        "achievements/achievements.html"
    )

    def get_context_data(self, **kwargs):

        context = super().get_context_data(
            **kwargs
        )

        user = self.request.user

        # ==================================================
        # SYNCHRONIZE HISTORICAL PROGRESS
        # ==================================================

        synchronize_progress_counters(
            user
        )

        # ==================================================
        # AUTOMATICALLY UNLOCK ACHIEVEMENTS
        # ==================================================

        unlock_achievements(
            user
        )

        # ==================================================
        # GET PROFILE
        # ==================================================

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        # ==================================================
        # GET UNLOCKED ACHIEVEMENT KEYS
        # ==================================================

        unlocked_keys = set(
            Achievement.objects
            .filter(
                user=user
            )
            .values_list(
                "key",
                flat=True
            )
        )

        # ==================================================
        # ACHIEVEMENT REQUIREMENTS
        # ==================================================

        achievement_requirements = {

            Achievement.Key.FIRST_STEP: _(
                "Complete your first task."
            ),

            Achievement.Key.TASK_STARTER: _(
                "Complete 5 tasks."
            ),

            Achievement.Key.TASK_MASTER: _(
                "Complete 10 tasks."
            ),

            Achievement.Key.XP_HUNTER: _(
                "Reach 100 XP."
            ),

            Achievement.Key.LEVEL_UP: _(
                "Reach level 2."
            ),

            Achievement.Key.STREAK_STARTER: _(
                "Build a 3-day streak."
            ),

            Achievement.Key.WEEK_WARRIOR: _(
                "Build a 7-day streak."
            ),

        }

        # ==================================================
        # BUILD ACHIEVEMENTS
        # ==================================================

        achievements = []

        for key, label in (
            Achievement.Key.choices
        ):

            achievements.append({

                "key":
                    key,

                "label":
                    label,

                "unlocked":
                    key in unlocked_keys,

                "requirement":
                    achievement_requirements.get(
                        key,
                        ""
                    ),

            })

        context["achievements"] = (
            achievements
        )

        return context


# ==========================================================
# MISSIONS
# ==========================================================

class MissionsView(
    LoginRequiredMixin,
    TemplateView,
):
    """
    Display long-term missions using persistent
    historical progress.
    """

    template_name = (
        "missions/missions.html"
    )

    def get_context_data(self, **kwargs):

        context = super().get_context_data(
            **kwargs
        )

        user = self.request.user

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        completed_tasks = (
            get_historical_completed_tasks(
                user
            )
        )

        streak = calculate_streak(
            user
        )

        missions_data = [

            {
                "key":
                    "complete_10_tasks",

                "icon":
                    "🎯",

                "title":
                    _(
                        "Complete 10 Tasks"
                    ),

                "description":
                    _(
                        "Complete ten tasks to strengthen your productivity."
                    ),

                "current":
                    min(
                        completed_tasks,
                        10,
                    ),

                "target":
                    10,

                "reward":
                    100,
            },

            {
                "key":
                    "reach_level_5",

                "icon":
                    "⭐",

                "title":
                    _(
                        "Reach Level 5"
                    ),

                "description":
                    _(
                        "Keep earning XP and reach level five."
                    ),

                "current":
                    min(
                        profile.level,
                        5,
                    ),

                "target":
                    5,

                "reward":
                    150,
            },

            {
                "key":
                    "seven_day_streak",

                "icon":
                    "🔥",

                "title":
                    _(
                        "Build a 7-Day Streak"
                    ),

                "description":
                    _(
                        "Stay active for seven consecutive days."
                    ),

                "current":
                    min(
                        streak,
                        7,
                    ),

                "target":
                    7,

                "reward":
                    200,
            },

        ]

        for mission in missions_data:

            mission["completed"] = (
                mission["current"]
                >= mission["target"]
            )

            mission["progress"] = min(
                round(
                    (
                        mission["current"]
                        /
                        mission["target"]
                    ) * 100
                ),
                100,
            )

            mission["claimed"] = (
                MissionRewardClaim.objects
                .filter(
                    user=user,
                    mission_key=mission["key"],
                )
                .exists()
            )

        context["missions"] = (
            missions_data
        )

        return context


# ==========================================================
# MISSION REWARD CLAIM
# ==========================================================

class MissionRewardClaimView(
    LoginRequiredMixin,
    View,
):
    """
    Claim a completed mission reward once.
    """

    def post(
        self,
        request,
        mission_key,
    ):

        user = request.user

        missions = {

            "complete_10_tasks": {
                "target": 10,
                "reward": 100,
            },

            "reach_level_5": {
                "target": 5,
                "reward": 150,
            },

            "seven_day_streak": {
                "target": 7,
                "reward": 200,
            },

        }

        mission = missions.get(
            mission_key
        )

        if mission is None:

            return JsonResponse(

                {
                    "success":
                        False,

                    "message":
                        _(
                            "Mission not found."
                        ),
                },

                status=404,
            )

        # ==================================================
        # CURRENT PERSISTENT PROGRESS
        # ==================================================

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        if mission_key == (
            "complete_10_tasks"
        ):

            progress = (
                get_historical_completed_tasks(
                    user
                )
            )

        elif mission_key == (
            "reach_level_5"
        ):

            progress = profile.level

        else:

            progress = calculate_streak(
                user
            )

        # ==================================================
        # CHECK COMPLETION
        # ==================================================

        if (
            progress
            <
            mission["target"]
        ):

            return JsonResponse(

                {
                    "success":
                        False,

                    "message":
                        _(
                            "Mission is not completed yet."
                        ),
                },

                status=400,
            )

        # ==================================================
        # PREVENT DOUBLE CLAIM
        # ==================================================

        already_claimed = (
            MissionRewardClaim.objects
            .filter(
                user=user,
                mission_key=mission_key,
            )
            .exists()
        )

        if already_claimed:

            return JsonResponse(

                {
                    "success":
                        False,

                    "message":
                        _(
                            "Mission reward has already been claimed."
                        ),
                },

                status=400,
            )

        # ==================================================
        # REWARD
        # ==================================================

        profile.xp += mission["reward"]

        profile.level = (
            profile.xp // 100
        ) + 1

        MissionRewardClaim.objects.create(
            user=user,
            mission_key=mission_key,
        )

        profile.save(
            update_fields=[
                "xp",
                "level",
                "updated_at",
            ]
        )

        return JsonResponse({

            "success":
                True,

            "reward":
                mission["reward"],

            "xp":
                profile.xp,

            "level":
                profile.level,

        })


# ==========================================================
# QUESTS
# ==========================================================

class QuestsView(
    LoginRequiredMixin,
    TemplateView,
):
    """
    Display daily quests using persistent
    progress for the current day.
    """

    template_name = (
        "quests/quests.html"
    )

    def get_context_data(self, **kwargs):

        context = super().get_context_data(
            **kwargs
        )

        user = self.request.user

        completed_today = (
            get_today_completed_tasks(
                user
            )
        )

        quests_data = [

            {
                "key":
                    "complete_1_task_today",

                "title":
                    _(
                        "Complete 1 Task Today"
                    ),

                "description":
                    _(
                        "Finish at least one task today."
                    ),

                "current":
                    min(
                        completed_today,
                        1,
                    ),

                "target":
                    1,

                "reward":
                    20,
            },

            {
                "key":
                    "complete_3_tasks_today",

                "title":
                    _(
                        "Complete 3 Tasks Today"
                    ),

                "description":
                    _(
                        "Finish three tasks before the day ends."
                    ),

                "current":
                    min(
                        completed_today,
                        3,
                    ),

                "target":
                    3,

                "reward":
                    40,
            },

            {
                "key":
                    "earn_30_xp_today",

                "title":
                    _(
                        "Earn 30 XP Today"
                    ),

                "description":
                    _(
                        "Complete tasks and earn at least 30 XP today."
                    ),

                "current":
                    min(
                        completed_today * 10,
                        30,
                    ),

                "target":
                    30,

                "reward":
                    30,
            },

        ]

        for quest in quests_data:

            quest["completed"] = (
                quest["current"]
                >= quest["target"]
            )

            quest["progress"] = min(
                round(
                    (
                        quest["current"]
                        /
                        quest["target"]
                    ) * 100
                ),
                100,
            )

            quest["claimed"] = (
                QuestRewardClaim.objects
                .filter(
                    user=user,
                    quest_key=quest["key"],
                    date=timezone.localdate(),
                )
                .exists()
            )

        context["quests"] = (
            quests_data
        )

        return context


# ==========================================================
# QUEST REWARD CLAIM
# ==========================================================

class QuestRewardClaimView(
    LoginRequiredMixin,
    View,
):
    """
    Claim a completed daily quest reward once
    per user per day.
    """

    def post(
        self,
        request,
        quest_key,
    ):

        user = request.user

        today = timezone.localdate()

        quests = {

            "complete_1_task_today": {
                "target": 1,
                "reward": 20,
            },

            "complete_3_tasks_today": {
                "target": 3,
                "reward": 40,
            },

            "earn_30_xp_today": {
                "target": 30,
                "reward": 30,
            },

        }

        quest = quests.get(
            quest_key
        )

        if quest is None:

            return JsonResponse(

                {
                    "success":
                        False,

                    "message":
                        _(
                            "Quest not found."
                        ),
                },

                status=404,
            )

        # ==================================================
        # TODAY'S PERSISTENT PROGRESS
        # ==================================================

        completed_today = (
            get_today_completed_tasks(
                user
            )
        )

        if quest_key == (
            "earn_30_xp_today"
        ):

            progress = min(
                completed_today * 10,
                30,
            )

        else:

            progress = min(
                completed_today,
                quest["target"],
            )

        # ==================================================
        # CHECK COMPLETION
        # ==================================================

        if (
            progress
            <
            quest["target"]
        ):

            return JsonResponse(

                {
                    "success":
                        False,

                    "message":
                        _(
                            "Quest is not completed yet."
                        ),
                },

                status=400,
            )

        # ==================================================
        # PREVENT DOUBLE CLAIM
        # ==================================================

        already_claimed = (
            QuestRewardClaim.objects
            .filter(
                user=user,
                quest_key=quest_key,
                date=today,
            )
            .exists()
        )

        if already_claimed:

            return JsonResponse(

                {
                    "success":
                        False,

                    "message":
                        _(
                            "Quest reward has already been claimed today."
                        ),
                },

                status=400,
            )

        # ==================================================
        # REWARD
        # ==================================================

        profile, profile_created = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        profile.xp += quest["reward"]

        profile.level = (
            profile.xp // 100
        ) + 1

        QuestRewardClaim.objects.create(
            user=user,
            quest_key=quest_key,
            date=today,
        )

        profile.save(
            update_fields=[
                "xp",
                "level",
                "updated_at",
            ]
        )

        return JsonResponse({

            "success":
                True,

            "reward":
                quest["reward"],

            "xp":
                profile.xp,

            "level":
                profile.level,

        })


# ==========================================================
# AUTHENTICATION
# ==========================================================

class LoginView(
    DjangoLoginView
):
    """
    User login.
    """

    template_name = (
        "accounts/login.html"
    )

    authentication_form = (
        LoginForm
    )

    redirect_authenticated_user = (
        True
    )

    success_url = reverse_lazy(
        "tasks:dashboard"
    )


class RegisterView(View):
    """
    User registration.
    """

    def get(self, request):

        form = RegisterForm()

        return render(
            request,
            "accounts/register.html",
            {
                "form":
                    form,
            },
        )

    def post(self, request):

        form = RegisterForm(
            request.POST
        )

        if form.is_valid():

            user = form.save()

            login(
                request,
                user,
            )

            return redirect(
                "tasks:dashboard"
            )

        return render(
            request,
            "accounts/register.html",
            {
                "form":
                    form,
            },
        )


class ForgotPasswordView(
    PasswordResetView
):
    """
    Password reset request.
    """

    template_name = (
        "accounts/forgot_password.html"
    )

    email_template_name = (
        "accounts/password/password_reset_email.html"
    )

    subject_template_name = (
        "accounts/password/password_reset_subject.txt"
    )

    success_url = reverse_lazy(
        "tasks:password_reset_done"
    )


class VerifyEmailView(
    TemplateView
):
    """
    Email verification page.
    """

    template_name = (
        "accounts/verify_email.html"
    )