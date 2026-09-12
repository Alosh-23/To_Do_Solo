from datetime import datetime, timedelta

from django.utils import timezone

from .models import TaskReminder


# ==========================================================
# CALCULATE NEXT REMINDER
# ==========================================================

def calculate_next_run_at(
    reminder,
    reference_time=None,
):
    """
    Calculate the next date and time at which a reminder
    should run.

    Supported reminder types:
        - Once
        - Daily
        - Weekly

    Returns:
        datetime | None
    """

    if not reminder.enabled:
        return None

    if reference_time is None:
        reference_time = timezone.now()

    current_timezone = timezone.get_current_timezone()

    # ------------------------------------------------------
    # ONCE
    # ------------------------------------------------------

    if reminder.reminder_type == (
        TaskReminder.ReminderType.ONCE
    ):

        if (
            reminder.reminder_date is None
            or reminder.reminder_time is None
        ):
            return None

        naive_datetime = datetime.combine(
            reminder.reminder_date,
            reminder.reminder_time,
        )

        reminder_datetime = timezone.make_aware(
            naive_datetime,
            current_timezone,
        )

        if reminder_datetime <= reference_time:
            return None

        return reminder_datetime

    # ------------------------------------------------------
    # DAILY
    # ------------------------------------------------------

    if reminder.reminder_type == (
        TaskReminder.ReminderType.DAILY
    ):

        if reminder.reminder_time is None:
            return None

        current_date = timezone.localdate(
            reference_time
        )

        naive_datetime = datetime.combine(
            current_date,
            reminder.reminder_time,
        )

        next_datetime = timezone.make_aware(
            naive_datetime,
            current_timezone,
        )

        if next_datetime <= reference_time:

            next_datetime += timedelta(
                days=1
            )

        return next_datetime

    # ------------------------------------------------------
    # WEEKLY
    # ------------------------------------------------------

    if reminder.reminder_type == (
        TaskReminder.ReminderType.WEEKLY
    ):

        if (
            reminder.reminder_time is None
            or not reminder.weekdays
        ):
            return None

        current_date = timezone.localdate(
            reference_time
        )

        current_weekday = current_date.weekday()

        selected_weekdays = sorted(
            {
                int(day)
                for day in reminder.weekdays
                if 0 <= int(day) <= 6
            }
        )

        if not selected_weekdays:
            return None

        for days_ahead in range(7):

            candidate_date = (
                current_date
                + timedelta(days=days_ahead)
            )

            if (
                candidate_date.weekday()
                not in selected_weekdays
            ):
                continue

            naive_datetime = datetime.combine(
                candidate_date,
                reminder.reminder_time,
            )

            candidate_datetime = timezone.make_aware(
                naive_datetime,
                current_timezone,
            )

            if candidate_datetime > reference_time:
                return candidate_datetime

        return None

    return None