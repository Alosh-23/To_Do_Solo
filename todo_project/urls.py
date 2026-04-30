from django.contrib import admin
from django.urls import path
from tasks.views import (
    task_list,
    delete_task,
    edit_task,
    complete_task,
    register,
    user_login,
    logout_view,
    api_tasks,
    api_update_task,
    api_delete_task,
    api_page,
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

    # ================= API =================
    # GET + POST
    path('api/tasks/', api_tasks, name='api_tasks'),

    # PUT (update)
    path('api/tasks/<int:id>/update/', api_update_task, name='api_update_task'),

    # DELETE
    path('api/tasks/<int:id>/delete/', api_delete_task, name='api_delete_task'),

    # صفحة التجربة
    path('api-page/', api_page, name='api_page'),
]