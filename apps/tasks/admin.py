from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """
    Task Admin Configuration.
    """

    list_display = (
        "id",
        "title",
        "user",
        "status",
        "completed",
        "due_date",
        "created_at",
    )

    list_filter = (
        "status",
        "completed",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "user__username",
    )

    ordering = (
        "-created_at",
    )

    list_per_page = 25

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Task Information",
            {
                "fields": (
                    "user",
                    "title",
                    "description",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "status",
                    "completed",
                    "due_date",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )