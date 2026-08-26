from django.utils import timezone

from .models import DailyActivity


def calculate_streak(user):
    """
    Calculate the user's current daily activity streak.
    """

    activity_dates = set(
        DailyActivity.objects
        .filter(user=user)
        .values_list("date", flat=True)
    )

    if not activity_dates:
        return 0

    today = timezone.localdate()

    if today in activity_dates:
        current_date = today
    else:
        current_date = today - timezone.timedelta(days=1)

        if current_date not in activity_dates:
            return 0

    streak = 0

    while current_date in activity_dates:
        streak += 1
        current_date -= timezone.timedelta(days=1)

    return streak