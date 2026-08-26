from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    """
    Base model that adds creation and update timestamps.
    """

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Task(TimeStampedModel):
    """
    Task model.
    """

    class Status(models.TextChoices):
        TODO = "todo", "To Do"
        IN_PROGRESS = "progress", "In Progress"
        DONE = "done", "Done"

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

    class Meta:
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        return self.title

class Profile(TimeStampedModel):

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

    def __str__(self):
        return f"{self.user.username} Profile"

class DailyActivity(TimeStampedModel):
    """
    Stores one activity record per user per day.
    Used for streak calculation.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_activities",
    )

    date = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="unique_user_daily_activity",
            )
        ]

        ordering = [
            "-date",
        ]

    def __str__(self):
        return f"{self.user.username} - {self.date}"

class Achievement(TimeStampedModel):
    """
    Stores achievements unlocked by users.
    """

    class Key(models.TextChoices):
        FIRST_STEP = "first_step", "First Step"
        TASK_STARTER = "task_starter", "Task Starter"
        TASK_MASTER = "task_master", "Task Master"
        XP_HUNTER = "xp_hunter", "XP Hunter"
        LEVEL_UP = "level_up", "Level Up"
        STREAK_STARTER = "streak_starter", "Streak Starter"
        WEEK_WARRIOR = "week_warrior", "Week Warrior"

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
                fields=["user", "key"],
                name="unique_user_achievement",
            )
        ]

        ordering = [
            "-unlocked_at",
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_key_display()}"