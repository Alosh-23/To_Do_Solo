from django.db import transaction
from django.utils import timezone

from .models import (
    Achievement,
    DailyActivity,
    Profile,
    Task,
)


# ==========================================================
# STREAK
# ==========================================================

def calculate_streak(user):
    """
    Calculate the user's current daily activity streak.

    A day is considered active when a DailyActivity record
    exists for that user and date.
    """

    activity_dates = set(
        DailyActivity.objects
        .filter(user=user)
        .values_list(
            "date",
            flat=True,
        )
    )


    if not activity_dates:
        return 0


    today = timezone.localdate()


    if today in activity_dates:

        current_date = today

    else:

        current_date = (
            today -
            timezone.timedelta(days=1)
        )


        if current_date not in activity_dates:
            return 0


    streak = 0


    while current_date in activity_dates:

        streak += 1

        current_date -= (
            timezone.timedelta(days=1)
        )


    return streak


# ==========================================================
# ACHIEVEMENTS
# ==========================================================

def unlock_achievements(user):
    """
    Automatically unlock achievements based on the user's
    persistent progress.

    Returns:
        list[Achievement]:
            Achievements unlocked during this call.
    """

    profile, _ = (
        Profile.objects.get_or_create(
            user=user
        )
    )

    # Use the historical counter instead of counting
    # currently existing completed Task objects.
    completed_tasks = profile.completed_tasks_total

    streak = calculate_streak(user)

    conditions = {
        Achievement.Key.FIRST_STEP:
            completed_tasks >= 1,

        Achievement.Key.TASK_STARTER:
            completed_tasks >= 5,

        Achievement.Key.TASK_MASTER:
            completed_tasks >= 10,

        Achievement.Key.XP_HUNTER:
            profile.xp >= 100,

        Achievement.Key.LEVEL_UP:
            profile.level >= 2,

        Achievement.Key.STREAK_STARTER:
            streak >= 3,

        Achievement.Key.WEEK_WARRIOR:
            streak >= 7,
    }

    unlocked = []

    for key, condition in conditions.items():

        if not condition:
            continue

        achievement, created = (
            Achievement.objects.get_or_create(
                user=user,
                key=key,
            )
        )

        if created:
            unlocked.append(achievement)

    return unlocked


# ==========================================================
# TASK COMPLETION HISTORY
# ==========================================================

@transaction.atomic
def record_task_completion_progress(
    user,
    task,
):
    """
    Record historical progress when a task is completed
    for the first time.

    Historical mission progress is stored in Profile.

    Daily quest progress is stored in DailyActivity.

    The same task is counted only once historically.

    Deleting the Task later does not reduce either counter.
    """

    if task.completion_counted:
        return False


    profile, _ = (
        Profile.objects.select_for_update()
        .get_or_create(
            user=user
        )
    )


    today = timezone.localdate()


    daily_activity, _ = (
        DailyActivity.objects
        .select_for_update()
        .get_or_create(
            user=user,
            date=today,
        )
    )


    # ------------------------------------------------------
    # HISTORICAL MISSION PROGRESS
    # ------------------------------------------------------

    profile.completed_tasks_total += 1


    profile.save(
        update_fields=[
            "completed_tasks_total",
            "updated_at",
        ]
    )


    # ------------------------------------------------------
    # DAILY QUEST PROGRESS
    # ------------------------------------------------------

    daily_activity.completed_tasks_count += 1


    daily_activity.save(
        update_fields=[
            "completed_tasks_count",
            "updated_at",
        ]
    )


    # ------------------------------------------------------
    # MARK TASK AS COUNTED
    # ------------------------------------------------------

    task.completion_counted = True


    task.save(
        update_fields=[
            "completion_counted",
            "updated_at",
        ]
    )


    return True


# ==========================================================
# PROGRESS SYNCHRONIZATION
# ==========================================================

@transaction.atomic
def synchronize_progress_counters(user):
    """
    Initialize or repair the persistent progress counters.

    This function is intentionally NON-DESTRUCTIVE.

    It may increase a counter when existing data proves that
    the counter is too low, but it never decreases a counter.

    This protects historical progress from being lost when
    tasks are deleted later.
    """

    profile, _ = (
        Profile.objects.select_for_update()
        .get_or_create(
            user=user
        )
    )


    # ------------------------------------------------------
    # HISTORICAL TASK COUNTER
    # ------------------------------------------------------
    #
    # For an existing project that already has completed
    # tasks before this system was introduced, initialize
    # the historical counter from the tasks that still exist.
    #
    # IMPORTANT:
    # We only increase the counter.
    # We never decrease it.
    #

    current_completed_count = (
        Task.objects
        .filter(
            user=user,
            completed=True,
        )
        .count()
    )


    if (
        current_completed_count
        > profile.completed_tasks_total
    ):

        profile.completed_tasks_total = (
            current_completed_count
        )


        profile.save(
            update_fields=[
                "completed_tasks_total",
                "updated_at",
            ]
        )


    # ------------------------------------------------------
    # MARK CURRENTLY COMPLETED TASKS AS COUNTED
    # ------------------------------------------------------

    (
        Task.objects
        .filter(
            user=user,
            completed=True,
        )
        .update(
            completion_counted=True
        )
    )


    # ------------------------------------------------------
    # TODAY'S QUEST COUNTER
    # ------------------------------------------------------
    #
    # Again, only increase.
    # Never decrease because of task deletion.
    #

    today = timezone.localdate()


    today_completed_count = (
        Task.objects
        .filter(
            user=user,
            completed=True,
            completed_at__date=today,
        )
        .count()
    )


    daily_activity, _ = (
        DailyActivity.objects
        .select_for_update()
        .get_or_create(
            user=user,
            date=today,
        )
    )


    if (
        today_completed_count
        > daily_activity.completed_tasks_count
    ):

        daily_activity.completed_tasks_count = (
            today_completed_count
        )


        daily_activity.save(
            update_fields=[
                "completed_tasks_count",
                "updated_at",
            ]
        )


# ==========================================================
# HISTORICAL MISSION PROGRESS
# ==========================================================

def get_historical_completed_tasks(user):
    """
    Return the user's persistent historical number
    of completed tasks.

    Deleting old tasks cannot reduce this value.
    """

    synchronize_progress_counters(
        user
    )


    profile = Profile.objects.get(
        user=user
    )


    return profile.completed_tasks_total


# ==========================================================
# TODAY'S QUEST PROGRESS
# ==========================================================

def get_today_completed_tasks(user):
    """
    Return the persistent number of tasks completed today.

    Deleting a completed task later does not reduce this
    value for the current day.
    """

    synchronize_progress_counters(
        user
    )


    daily_activity, _ = (
        DailyActivity.objects.get_or_create(
            user=user,
            date=timezone.localdate(),
        )
    )


    return (
        daily_activity.completed_tasks_count
    )


# ==========================================================
# GET PROFILE
# ==========================================================

def get_user_profile(user):
    """
    Return the user's profile, creating it when necessary.
    """

    profile, _ = (
        Profile.objects.get_or_create(
            user=user
        )
    )


    return profile


# ==========================================================
# GET USER PROGRESS
# ==========================================================

def get_user_progress(user):
    """
    Return the main persistent progress values used
    throughout the application.
    """

    synchronize_progress_counters(
        user
    )


    profile = Profile.objects.get(
        user=user
    )


    return {

        "xp":
            profile.xp,

        "level":
            profile.level,

        "completed_tasks_total":
            profile.completed_tasks_total,

        "streak":
            calculate_streak(user),

    }
