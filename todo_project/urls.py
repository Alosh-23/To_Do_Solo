from django.contrib import admin
from django.urls import path
from django.views.generic import RedirectView
from tasks.views import (
    task_list,
    delete_task,
    edit_task,
    complete_task,
    register,
    user_login,
    logout_view,
    forgot_password,
    verify_otp,
    reset_password,
    api_tasks,
    api_update_task,
    api_delete_task,
    api_page,
    api_delete_task,
    api_page,
    api_profile,
    api_leaderboard,

)

urlpatterns = [
    # ================= ADMIN =================
    path('admin/', admin.site.urls),

    # ================= NORMAL VIEWS =================
    path('', task_list, name='home'),
    path('delete/<int:id>/', delete_task, name='delete_task'),
    path('edit/<int:id>/', edit_task, name='edit_task'),
    path('complete/<int:id>/', complete_task, name='complete_task'),

    # ================= AUTH =================
    path('register/', register, name='register'),
    path('login/', user_login, name='login'),
    path('logout/', logout_view, name='logout'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('verify-otp/', verify_otp, name='verify_otp'),
    path('reset-password/', reset_password, name='reset_password'),
    path('favicon.ico', RedirectView.as_view(url='/static/images/ToDo-solo-logo.png', permanent=False)),

    # ================= API =================
    path('api/tasks/', api_tasks, name='api_tasks'),
    path('api/tasks/<int:id>/update/', api_update_task, name='api_update_task'),
    path('api/tasks/<int:id>/delete/', api_delete_task, name='api_delete_task'),
    path('api/profile/', api_profile, name='api_profile'),
    path('api/leaderboard/', api_leaderboard, name='api_leaderboard'),
    
    
    # صفحة التجربة
    path('api-page/', api_page, name='api_page'),
]