from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, UpdateView

from .forms import ProfileUpdateForm

class ProfileView(LoginRequiredMixin, TemplateView):
    """
    Display the user's account information.
    """

    template_name = "accounts/profile.html"


class ProfileEditView(LoginRequiredMixin, TemplateView):
    """
    Edit the user's account information.
    """

    template_name = "accounts/profile_edit.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["profile_form"] = ProfileUpdateForm(
            instance=self.request.user
        )

        return context

    def post(self, request, *args, **kwargs):
        form = ProfileUpdateForm(
            request.POST,
            instance=request.user,
        )

        if form.is_valid():
            form.save()
            return redirect("accounts:profile")

        context = self.get_context_data(**kwargs)
        context["profile_form"] = form

        return self.render_to_response(context)

class ProfileUpdateView(LoginRequiredMixin, UpdateView):

    form_class = ProfileUpdateForm
    template_name = "accounts/profile_edit.html"
    success_url = reverse_lazy("tasks:accounts:profile")

    def get_object(self):
        return self.request.user

class SettingsView(LoginRequiredMixin, TemplateView):

    template_name = "settings/settings.html"