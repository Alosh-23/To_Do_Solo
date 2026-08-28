import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django.views import View

from .models import (
    Achievement,
    DailyActivity,
    Profile,
    Task,
)

from .services import (
    calculate_streak,
    get_user_progress,
    record_task_completion_progress,
    synchronize_progress_counters,
    unlock_achievements,
)


# ==========================================================
# HELPER
# ==========================================================

def parse_task_due_date(value):
    """
    Convert a browser date/datetime value into a Python
    datetime/date value.

    Supported examples:
        2026-08-26
        2026-08-26T18:30
        2026-08-26T18:30:00

    Returns:
        parsed value or None
    """

    if not value:
        return None

    value = str(value).strip()

    if not value:
        return None

    parsed_datetime = parse_datetime(value)

    if parsed_datetime is not None:
        return parsed_datetime

    parsed_date = parse_date(value)

    if parsed_date is not None:
        return parsed_date

    return None


# ==========================================================
# TASK LIST API
# ==========================================================

class TaskListAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Return all tasks belonging to the current user.
    """

    def get(self, request):

        tasks = (
            Task.objects
            .filter(user=request.user)
            .order_by("-created_at")
        )

        data = []

        for task in tasks:

            data.append({
                "id": task.pk,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "status": task.status,
                "due_date": (
                    task.due_date.isoformat()
                    if task.due_date
                    else None
                ),
                "created_at": (
                    task.created_at.isoformat()
                    if task.created_at
                    else None
                ),
                "updated_at": (
                    task.updated_at.isoformat()
                    if task.updated_at
                    else None
                ),
            })

        return JsonResponse({
            "success": True,
            "tasks": data,
        })


# ==========================================================
# TASK TOGGLE API
# ==========================================================

class TaskToggleCompleteAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Toggle task completion.

    Completing a task:
        - awards XP
        - updates the user's level
        - records historical mission progress
        - records today's quest progress
        - updates daily activity
        - unlocks achievements
        - returns newly unlocked achievements

    Uncompleting a task:
        - removes the XP previously awarded
        - does NOT remove historical mission progress
        - does NOT remove historical quest progress
        - does NOT remove unlocked achievements
    """

    @transaction.atomic
    def post(self, request, pk):

        task = get_object_or_404(
            Task.objects.select_for_update(),
            pk=pk,
            user=request.user,
        )

        profile, _ = (
            Profile.objects
            .select_for_update()
            .get_or_create(
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

            task.status = Task.Status.TODO

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

            task.status = Task.Status.DONE

            task.completed_at = timezone.now()

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
        # RECORD HISTORICAL PROGRESS
        # ==================================================

        if newly_completed:

            record_task_completion_progress(
                user=request.user,
                task=task,
            )

        # ==================================================
        # SYNCHRONIZE OLD DATA
        # ==================================================

        # This is non-destructive.
        # It may increase historical counters when needed,
        # but it never decreases them.

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
        # GET CURRENT PROFILE PROGRESS
        # ==================================================

        progress = get_user_progress(
            request.user
        )

        # ==================================================
        # RESPONSE
        # ==================================================

        return JsonResponse({

            "success": True,

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
                    progress["xp"],

                "level":
                    progress["level"],

                "streak":
                    progress["streak"],

                "completed_tasks_total":
                    progress[
                        "completed_tasks_total"
                    ],

            },

            "unlocked_achievements": [

                {

                    "id":
                        achievement.pk,

                    "key":
                        achievement.key,

                    "label":
                        achievement.get_key_display(),

                    "unlocked_at": (
                        achievement.unlocked_at.isoformat()
                        if achievement.unlocked_at
                        else None
                    ),

                }

                for achievement
                in unlocked_achievements

            ],

        })


# ==========================================================
# TASK DELETE API
# ==========================================================

class TaskDeleteAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Delete a task belonging to the current user.

    Deleting a task does NOT:
        - reduce XP
        - reduce historical mission progress
        - reduce historical quest progress
        - remove achievements
    """

    @transaction.atomic
    def post(self, request, pk):

        task = get_object_or_404(
            Task.objects.select_for_update(),
            pk=pk,
            user=request.user,
        )

        task_id = task.pk

        task.delete()

        return JsonResponse({
            "success": True,
            "deleted_task_id": task_id,
        })


# ==========================================================
# STATS API
# ==========================================================

class StatsAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Return the current user's task and progress statistics.
    """

    def get(self, request):

        user = request.user

        synchronize_progress_counters(
            user
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

        profile, _ = (
            Profile.objects.get_or_create(
                user=user
            )
        )

        streak = calculate_streak(
            user
        )

        return JsonResponse({

            "success": True,

            "stats": {

                "total_tasks":
                    total_tasks,

                "completed_tasks":
                    completed_tasks,

                "pending_tasks":
                    pending_tasks,

                "completion_rate":
                    completion_rate,

                "xp":
                    profile.xp,

                "level":
                    profile.level,

                "streak":
                    streak,

                "completed_tasks_total":
                    profile.completed_tasks_total,

            },

        })


# ==========================================================
# ACHIEVEMENTS API
# ==========================================================

class AchievementListAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Return all available achievements for the current user.

    Every achievement is returned with its unlocked state.
    """

    def get(self, request):

        user = request.user

        synchronize_progress_counters(
            user
        )

        unlock_achievements(
            user
        )

        unlocked_achievements = {

            achievement.key:
                achievement

            for achievement in (
                Achievement.objects
                .filter(user=user)
            )

        }

        achievements = []

        for key, label in (
            Achievement.Key.choices
        ):

            achievement = (
                unlocked_achievements.get(
                    key
                )
            )

            achievements.append({

                "id": (
                    achievement.pk
                    if achievement
                    else None
                ),

                "key":
                    key,

                "label":
                    label,

                "unlocked": (
                    achievement
                    is not None
                ),

                "unlocked_at": (
                    achievement.unlocked_at.isoformat()
                    if achievement
                    else None
                ),

            })

        return JsonResponse({

            "success": True,

            "achievements":
                achievements,

        })


# ==========================================================
# TASK CREATE API
# ==========================================================

class TaskCreateAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Create a new task and return it as JSON.
    """

    def post(self, request):

        try:

            data = json.loads(
                request.body.decode(
                    "utf-8"
                )
            )

        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
        ):

            return JsonResponse(
                {
                    "success":
                        False,

                    "message":
                        "Invalid JSON data.",
                },
                status=400,
            )

        # ==================================================
        # TITLE
        # ==================================================

        title = (
            data.get("title") or ""
        ).strip()

        if not title:

            return JsonResponse(
                {
                    "success":
                        False,

                    "message":
                        "Title is required.",
                },
                status=400,
            )

        # ==================================================
        # DESCRIPTION
        # ==================================================

        description = (
            data.get("description") or ""
        ).strip()

        # ==================================================
        # DUE DATE
        # ==================================================

        due_date_value = (
            data.get("due_date") or ""
        )

        due_date = None

        if due_date_value:

            due_date = parse_task_due_date(
                due_date_value
            )

            if due_date is None:

                return JsonResponse(
                    {
                        "success":
                            False,

                        "message":
                            "Invalid due date.",
                    },
                    status=400,
                )

        # ==================================================
        # CREATE
        # ==================================================

        task = Task.objects.create(

            user=request.user,

            title=title,

            description=description,

            due_date=due_date,

        )

        # ==================================================
        # RESPONSE
        # ==================================================

        return JsonResponse(

            {
                "success":
                    True,

                "task": {

                    "id":
                        task.pk,

                    "title":
                        task.title,

                    "description":
                        task.description,

                    "completed":
                        task.completed,

                    "status":
                        task.status,

                    "due_date": (
                        task.due_date.isoformat()
                        if task.due_date
                        else None
                    ),

                    "created_at": (
                        task.created_at.isoformat()
                        if task.created_at
                        else None
                    ),

                    "updated_at": (
                        task.updated_at.isoformat()
                        if task.updated_at
                        else None
                    ),

                },

            },

            status=201,

        )


# ==========================================================
# TASK UPDATE API
# ==========================================================

class TaskUpdateAPIView(
    LoginRequiredMixin,
    View,
):
    """
    Update an existing task and return it as JSON.
    """

    def put(self, request, pk):

        task = get_object_or_404(
            Task,
            pk=pk,
            user=request.user,
        )

        try:

            data = json.loads(
                request.body.decode(
                    "utf-8"
                )
            )

        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
        ):

            return JsonResponse(
                {
                    "success":
                        False,

                    "message":
                        "Invalid JSON data.",
                },
                status=400,
            )

        # ==================================================
        # TITLE
        # ==================================================

        if "title" in data:

            title = (
                data.get("title") or ""
            ).strip()

            if not title:

                return JsonResponse(
                    {
                        "success":
                            False,

                        "message":
                            "Title is required.",
                    },
                    status=400,
                )

            task.title = title

        # ==================================================
        # DESCRIPTION
        # ==================================================

        if "description" in data:

            task.description = (
                data.get("description") or ""
            ).strip()

        # ==================================================
        # DUE DATE
        # ==================================================

        if "due_date" in data:

            due_date_value = (
                data.get("due_date") or ""
            )

            if due_date_value:

                due_date = (
                    parse_task_due_date(
                        due_date_value
                    )
                )

                if due_date is None:

                    return JsonResponse(
                        {
                            "success":
                                False,

                            "message":
                                "Invalid due date.",
                        },
                        status=400,
                    )

                task.due_date = due_date

            else:

                task.due_date = None

        # ==================================================
        # SAVE
        # ==================================================

        task.save()

        # ==================================================
        # RESPONSE
        # ==================================================

        return JsonResponse({

            "success": True,

            "task": {

                "id":
                    task.pk,

                "title":
                    task.title,

                "description":
                    task.description,

                "completed":
                    task.completed,

                "status":
                    task.status,

                "due_date": (
                    task.due_date.isoformat()
                    if task.due_date
                    else None
                ),

                "created_at": (
                    task.created_at.isoformat()
                    if task.created_at
                    else None
                ),

                "updated_at": (
                    task.updated_at.isoformat()
                    if task.updated_at
                    else None
                ),

            },

        })