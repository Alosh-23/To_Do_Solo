from django.shortcuts import render, redirect, get_object_or_404
from .models import Task
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import TaskSerializer


@login_required
def task_list(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        if title:
            Task.objects.create(title=title, user=request.user)
        return redirect('home')

    tasks = Task.objects.filter(user=request.user)
    return render(request, 'tasks/list.html', {'tasks': tasks})


@login_required
def delete_task(request, id):
    task = get_object_or_404(Task, id=id, user=request.user)
    task.delete()
    return redirect('/')


@login_required
def edit_task(request, id):
    task = get_object_or_404(Task, id=id, user=request.user)

    if request.method == 'POST':
        task.title = request.POST.get('title')
        task.save()
        return redirect('/')

    return render(request, 'tasks/edit.html', {'task': task})


@login_required
def complete_task(request, id):
    task = get_object_or_404(Task, id=id, user=request.user)
    task.completed = True
    task.save()
    return redirect('/')


# ✅ تسجيل
def register(request):
    form = UserCreationForm()

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()

            # 🔥 تسجيل دخول مباشر (بدون مشاكل)
            login(request, user)

            return redirect('/')  # بدل home

    return render(request, 'tasks/register.html', {'form': form})


# ✅ تسجيل دخول
def user_login(request):
    form = AuthenticationForm()

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('/')
        else:
            return render(request, 'tasks/login.html', {
                'form': form,
                'error': 'بيانات غير صحيحة'
            })

    return render(request, 'tasks/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


# ================= API ================= #

@api_view(['GET', 'POST'])
def api_tasks(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)

        return Response(serializer.errors)


@api_view(['PUT'])
def api_update_task(request, id):
    task = get_object_or_404(Task, id=id, user=request.user)

    serializer = TaskSerializer(task, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['DELETE'])
def api_delete_task(request, id):
    task = get_object_or_404(Task, id=id, user=request.user)
    task.delete()
    return Response({'message': 'Task deleted successfully'})