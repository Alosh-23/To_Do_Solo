from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


# ==========================================================
# TIMESTAMP MODEL
# ==========================================================

class TimeStampedModel(models.Model):
    """
    Base model that adds creation and update timestamps.
    """

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        abstract = True


# ==========================================================
# TASK
# ==========================================================

class Task(TimeStampedModel):
    """
    Task model.
    """

    class Status(models.TextChoices):

        TODO = (
            "todo",
            _("To Do")
        )

        IN_PROGRESS = (
            "progress",
            _("In Progress")
        )

        DONE = (
            "done",
            _("Done")
        )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    title = models.CharField(
        max_length=150,
    )

    description = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )

    due_date = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed = models.BooleanField(
        default=False,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completion_counted = models.BooleanField(
        default=False,
        help_text=(
            "Whether this task has already been counted "
            "toward historical completion progress."
        ),
    )

    class Meta:
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        return self.title


# ==========================================================
# PROFILE
# ==========================================================

class Profile(TimeStampedModel):
    """
    Stores the user's XP, level, and historical progress.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    xp = models.PositiveIntegerField(
        default=0,
    )

    level = models.PositiveIntegerField(
        default=1,
    )

    completed_tasks_total = models.PositiveIntegerField(
        default=0,
        help_text=(
            "Historical number of tasks completed by the user."
        ),
    )

    def __str__(self):
        return f"{self.user.username} Profile"


# ==========================================================
# DAILY ACTIVITY
# ==========================================================

class DailyActivity(TimeStampedModel):
    """
    Stores one activity record per user per day.

    Used for:
        - streak calculation
        - daily quest progress
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_activities",
    )

    date = models.DateField()

    completed_tasks_count = models.PositiveIntegerField(
        default=0,
        help_text=(
            "Number of tasks completed on this date."
        ),
    )

    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "user",
                    "date",
                ],
                name="unique_user_daily_activity",
            )

        ]

        ordering = [
            "-date",
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.date}"
        )


# ==========================================================
# ACHIEVEMENT
# ==========================================================

class Achievement(TimeStampedModel):
    """
    Stores achievements unlocked by users.
    """

    class Key(models.TextChoices):

        FIRST_STEP = (
            "first_step",
            _("First Step")
        )

        TASK_STARTER = (
            "task_starter",
            _("Task Starter")
        )

        TASK_MASTER = (
            "task_master",
            _("Task Master")
        )

        XP_HUNTER = (
            "xp_hunter",
            _("XP Hunter")
        )

        LEVEL_UP = (
            "level_up",
            _("Level Up")
        )

        STREAK_STARTER = (
            "streak_starter",
            _("Streak Starter")
        )

        WEEK_WARRIOR = (
            "week_warrior",
            _("Week Warrior")
        )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="achievements",
    )

    key = models.CharField(
        max_length=50,
        choices=Key.choices,
    )

    unlocked_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "user",
                    "key",
                ],
                name="unique_user_achievement",
            )

        ]

        ordering = [
            "-unlocked_at",
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.get_key_display()}"
        )


# ==========================================================
# MISSION REWARD CLAIM
# ==========================================================

class MissionRewardClaim(TimeStampedModel):
    """
    Stores mission rewards already claimed by users.

    Each mission can be claimed only once per user.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mission_reward_claims",
    )

    mission_key = models.CharField(
        max_length=100,
    )

    claimed_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "user",
                    "mission_key",
                ],
                name="unique_user_mission_reward_claim",
            )

        ]

        ordering = [
            "-claimed_at",
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.mission_key}"
        )


# ==========================================================
# QUEST REWARD CLAIM
# ==========================================================

class QuestRewardClaim(TimeStampedModel):
    """
    Stores daily quest rewards claimed by users.

    A quest can be claimed once per user per day.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quest_reward_claims",
    )

    quest_key = models.CharField(
        max_length=100,
    )

    date = models.DateField()

    claimed_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "user",
                    "quest_key",
                    "date",
                ],
                name="unique_user_quest_reward_claim",
            )

        ]

        ordering = [
            "-claimed_at",
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.quest_key} - "
            f"{self.date}"
        )