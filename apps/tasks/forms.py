from django import forms
from django.contrib.auth.forms import AuthenticationForm

from .models import Task, TaskReminder


# ==========================================================
# LOGIN FORM
# ==========================================================

class LoginForm(AuthenticationForm):
    """
    Custom login form for To Do Solo.
    """

    username = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "Username",
                "autocomplete": "username",
            }
        )
    )

    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "placeholder": "Password",
                "autocomplete": "current-password",
            }
        )
    )


# ==========================================================
# TASK FORM
# ==========================================================

class TaskForm(forms.ModelForm):
    """
    Form used for creating and updating tasks.
    """

    class Meta:
        model = Task

        fields = (
            "title",
            "description",
        )

        widgets = {

            "title": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Task title",
                }
            ),

            "description": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 5,
                    "placeholder": "Task description",
                }
            ),

        }


# ==========================================================
# TASK REMINDER FORM
# ==========================================================

class TaskReminderForm(forms.ModelForm):
    """
    Form used for creating and updating a task reminder.
    """

    WEEKDAY_CHOICES = (
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    )

    weekdays = forms.MultipleChoiceField(
        choices=WEEKDAY_CHOICES,
        required=False,
        widget=forms.CheckboxSelectMultiple(
            attrs={
                "class": "reminder-weekdays",
            }
        ),
    )

    class Meta:
        model = TaskReminder

        fields = (
            "reminder_type",
            "reminder_date",
            "reminder_time",
            "weekdays",
            "enabled",
        )

        widgets = {

            "reminder_type": forms.Select(
                attrs={
                    "class": "form-control",
                }
            ),

            "reminder_date": forms.DateInput(
                attrs={
                    "class": "form-control",
                    "type": "date",
                }
            ),

            "reminder_time": forms.TimeInput(
                attrs={
                    "class": "form-control",
                    "type": "time",
                }
            ),

            "enabled": forms.CheckboxInput(
                attrs={
                    "class": "form-check-input",
                }
            ),

        }

    def clean_weekdays(self):
        """
        Convert selected weekday values into integers.

        Monday=0 through Sunday=6.
        """

        value = self.cleaned_data.get("weekdays")

        if not value:
            return []

        return sorted(
            {
                int(day)
                for day in value
            }
        )