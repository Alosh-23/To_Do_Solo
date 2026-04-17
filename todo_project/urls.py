"""
URL configuration for todo_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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

)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', task_list, name='home'),
    path('delete/<int:id>/', delete_task),
    path('edit/<int:id>/', edit_task),
    path('register/', register, name='register'),
    path('login/', user_login, name='login'),
    path('logout/', logout_view, name='logout'),
    path('api/tasks/', api_tasks),
    path('api/tasks/<int:id>/', api_update_task),
    path('api/tasks/<int:id>/delete/', api_delete_task),
    
]
