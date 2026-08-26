import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django.views import View

from .models import Task, Profile, DailyActivity
from .services import calculate_streak


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

    # Try full datetime first.
    parsed_datetime = parse_datetime(value)

    if parsed_datetime is not None:
        return parsed_datetime

    # Then try date-only value.
    parsed_date = parse_date(value)

    if parsed_date is not None:
        return parsed_date

    return None


# ==========================================================
# TASK LIST API
# ==========================================================

class TaskListAPIView(LoginRequiredMixin, View):
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

class TaskToggleCompleteAPIView(LoginRequiredMixin, View):
    """
    Toggle task completion and update XP / level / streak.
    """

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

            # ==============================================
            # MARK AS INCOMPLETE
            # ==============================================

            task.completed = False
            task.status = Task.Status.TODO
            task.completed_at = None

            profile.xp = max(
                0,
                profile.xp - 10,
            )

        else:

            # ==============================================
            # MARK AS COMPLETE
            # ==============================================

            task.completed = True
            task.status = Task.Status.DONE
            task.completed_at = timezone.now()

            profile.xp += 10

            DailyActivity.objects.get_or_create(
                user=request.user,
                date=timezone.localdate(),
            )

        # ==============================================
        # UPDATE LEVEL
        # ==============================================

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

        task.save(
            update_fields=[
                "completed",
                "status",
                "completed_at",
                "updated_at",
            ]
        )

        # ==============================================
        # RESPONSE
        # ==============================================

        return JsonResponse({
            "success": True,

            "task": {
                "id": task.pk,
                "title": task.title,
                "completed": task.completed,
                "status": task.status,
                "completed_at": (
                    task.completed_at.isoformat()
                    if task.completed_at
                    else None
                ),
            },

            "profile": {
                "xp": profile.xp,
                "level": profile.level,
                "streak": calculate_streak(
                    request.user
                ),
            },
        })


# ==========================================================
# TASK DELETE API
# ==========================================================

class TaskDeleteAPIView(LoginRequiredMixin, View):
    """
    Delete a task belonging to the current user.
    """

    def post(self, request, pk):

        task = get_object_or_404(
            Task,
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

class StatsAPIView(LoginRequiredMixin, View):
    """
    Return the current user's task and progress statistics.
    """

    def get(self, request):

        user = request.user

        tasks = Task.objects.filter(
            user=user
        )

        total_tasks = tasks.count()

        completed_tasks = tasks.filter(
            completed=True
        ).count()

        pending_tasks = tasks.filter(
            completed=False
        ).count()

        completion_rate = (
            round(
                (completed_tasks / total_tasks) * 100
            )
            if total_tasks > 0
            else 0
        )

        profile, created = Profile.objects.get_or_create(
            user=user
        )

        streak = calculate_streak(user)

        return JsonResponse({
            "success": True,

            "stats": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "pending_tasks": pending_tasks,
                "completion_rate": completion_rate,
                "xp": profile.xp,
                "level": profile.level,
                "streak": streak,
            },
        })


# ==========================================================
# TASK CREATE API
# ==========================================================

class TaskCreateAPIView(LoginRequiredMixin, View):
    """
    Create a new task and return it as JSON.
    """

    def post(self, request):

        try:

            data = json.loads(
                request.body.decode("utf-8")
            )

        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
        ):

            return JsonResponse(
                {
                    "success": False,
                    "message": "Invalid JSON data.",
                },
                status=400,
            )


        title = (
            data.get("title") or ""
        ).strip()

        description = (
            data.get("description") or ""
        ).strip()

        due_date_value = (
            data.get("due_date") or ""
        )


        # ==============================================
        # VALIDATE TITLE
        # ==============================================

        if not title:

            return JsonResponse(
                {
                    "success": False,
                    "message": "Title is required.",
                },
                status=400,
            )


        # ==============================================
        # PARSE DUE DATE
        # ==============================================

        due_date = None

        if due_date_value:

            due_date = parse_task_due_date(
                due_date_value
            )

            if due_date is None:

                return JsonResponse(
                    {
                        "success": False,
                        "message": "Invalid due date.",
                    },
                    status=400,
                )


        # ==============================================
        # CREATE TASK
        # ==============================================

        task = Task.objects.create(

            user=request.user,

            title=title,

            description=description,

            due_date=due_date,

        )


        # ==============================================
        # RESPONSE
        # ==============================================

        return JsonResponse(
            {
                "success": True,

                "task": {
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
                },
            },
            status=201,
        )


# ==========================================================
# TASK UPDATE API
# ==========================================================

class TaskUpdateAPIView(LoginRequiredMixin, View):
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
                request.body.decode("utf-8")
            )

        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
        ):

            return JsonResponse(
                {
                    "success": False,
                    "message": "Invalid JSON data.",
                },
                status=400,
            )


        # ==============================================
        # TITLE
        # ==============================================

        if "title" in data:

            title = (
                data.get("title") or ""
            ).strip()


            if not title:

                return JsonResponse(
                    {
                        "success": False,
                        "message": "Title is required.",
                    },
                    status=400,
                )


            task.title = title


        # ==============================================
        # DESCRIPTION
        # ==============================================

        if "description" in data:

            task.description = (
                data.get("description") or ""
            ).strip()


        # ==============================================
        # DUE DATE
        # ==============================================

        if "due_date" in data:

            due_date_value = (
                data.get("due_date") or ""
            )

            if due_date_value:

                due_date = parse_task_due_date(
                    due_date_value
                )

                if due_date is None:

                    return JsonResponse(
                        {
                            "success": False,
                            "message": "Invalid due date.",
                        },
                        status=400,
                    )

                task.due_date = due_date

            else:

                task.due_date = None


        # ==============================================
        # SAVE
        # ==============================================

        task.save()


        # ==============================================
        # RESPONSE
        # ==============================================

        return JsonResponse({
            "success": True,

            "task": {
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
            },
        })

