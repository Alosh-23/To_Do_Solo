from django import forms
from django.contrib.auth.forms import AuthenticationForm

from .models import Task


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
    
class TaskForm(forms.ModelForm):
    """
    Form used for creating and updating tasks.
    """

    class Meta:
        model = Task

        fields = (
            "title",
            "description",
            "due_date",
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

            "due_date": forms.DateTimeInput(
                attrs={
                    "class": "form-control",
                    "type": "datetime-local",
                }
            ),

        }