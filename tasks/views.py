from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Profile, OTP
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import TaskSerializer


# ✅ دالة مساعدة (تمت الإضافة)
def get_user_task(request, id):
    return get_object_or_404(Task, id=id, user=request.user)


# ================= NORMAL VIEWS ================= #

@login_required
def task_list(request):

    if request.method == 'POST':
        title = request.POST.get('title')

        if title:
            Task.objects.create(
                user=request.user,
                title=title
            )

        return redirect('home')

    tasks = Task.objects.filter(user=request.user)

    return render(request, 'tasks/index.html', {'tasks': tasks})


@login_required
def delete_task(request, id):
    task = get_user_task(request, id)  # ✅ تعديل
    task.delete()
    return redirect('home')


@login_required
def edit_task(request, id):
    task = get_user_task(request, id)  # ✅ تعديل

    if request.method == 'POST':
        task.title = request.POST.get('title')
        task.save()
        return redirect('home')

    return render(request, 'tasks/edit.html', {'task': task})


@login_required
def complete_task(request, id):
    task = get_user_task(request, id)  # ✅ تعديل
    task.completed = True
    task.save()
    return redirect('home')


def api_page(request):
    return render(request, 'tasks/api.html')


# ================= AUTH ================= #

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password1')
        password2 = request.POST.get('password2')
        email = request.POST.get('email')
        phone = request.POST.get('phone')

        if not username or not password or not password2:
            return render(request, 'tasks/register.html', {
                'error': 'يرجى ملء جميع الحقول المطلوبة'
            })

        if password != password2:
            return render(request, 'tasks/register.html', {
                'error': 'كلمتا المرور غير متطابقتين'
            })

        if User.objects.filter(username=username).exists():
            return render(request, 'tasks/register.html', {
                'error': 'هذا الاسم مستخدم بالفعل'
            })

        if email and User.objects.filter(email=email).exists():
            return render(request, 'tasks/register.html', {
                'error': 'هذا البريد مستخدم بالفعل'
            })

        if not email and not phone:
            return render(request, 'tasks/register.html', {
                'error': 'يجب إدخال الإيميل أو رقم الهاتف'
            })

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email if email else ''
        )

        profile = Profile.objects.get(user=user)
        profile.phone = phone
        profile.save()

        otp = OTP.objects.create(user=user)
        otp.generate_code()

        if email:
            send_mail(
                'OTP Code',
                f'Your code is: {otp.code}',
                'your_email@gmail.com',
                [email],
                fail_silently=False,
            )

        request.session['user_id'] = user.id
        return redirect('verify_otp')

    return render(request, 'tasks/register.html')


def user_login(request):
    if request.method == 'POST':
        login_input = request.POST.get('login')
        password = request.POST.get('password')

        user = authenticate(request, username=login_input, password=password)

        if user is None:
            try:
                user_obj = User.objects.get(email=login_input)
                user = authenticate(request, username=user_obj.username, password=password)
            except:
                pass

        if user is None:
            try:
                profile = Profile.objects.get(phone=login_input)
                user = authenticate(request, username=profile.user.username, password=password)
            except:
                pass

        if user:
            login(request, user)
            return redirect('/')
        else:
            return render(request, 'tasks/login.html', {'error': 'بيانات غير صحيحة'})

    return render(request, 'tasks/login.html')


def logout_view(request):
    logout(request)
    return redirect('login')


# ================= OTP ================= #

def verify_otp(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('register')

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return redirect('register')

    if request.method == 'POST':
        code = request.POST.get('code')
        otp = OTP.objects.filter(user=user).last()

        if otp and otp.code == code:
            login(request, user)
            return redirect('/')
        else:
            return render(request, 'tasks/verify.html', {'error': 'كود غير صحيح'})

    return render(request, 'tasks/verify.html')


def forgot_password(request):
    if request.method == 'POST':
        email = request.POST.get('email')

        try:
            user = User.objects.get(email=email)

            otp = OTP.objects.create(user=user)
            otp.generate_code()

            send_mail(
                'Reset Password Code',
                f'Your code is: {otp.code}',
                'your_email@gmail.com',
                [email],
                fail_silently=False,
            )

            request.session['reset_user'] = user.id
            return redirect('reset_password')

        except:
            return render(request, 'tasks/forgot.html', {'error': 'الإيميل غير موجود'})

    return render(request, 'tasks/forgot.html')


def reset_password(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        password = request.POST.get('password')

        user = User.objects.get(id=request.session.get('reset_user'))
        otp = OTP.objects.filter(user=user).last()

        if otp and otp.code == code:
            user.set_password(password)
            user.save()
            return redirect('login')

    return render(request, 'tasks/reset.html')


# ================= API ================= #

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_tasks(request):

    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_task(request, id):
    task = get_user_task(request, id)  # ✅ تعديل

    serializer = TaskSerializer(task, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_task(request, id):
    task = get_user_task(request, id)  # ✅ تعديل
    task.delete()
    return Response({'message': 'deleted'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_profile(request):
    profile = Profile.objects.get(user=request.user)

    return Response({
        "xp": profile.xp,
        "level": profile.level,
        "streak": profile.streak,
        "completed_tasks": profile.completed_tasks,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_leaderboard(request):

    profiles = Profile.objects.select_related("user").order_by("-xp")[:10]

    data = []

    for profile in profiles:
        data.append({
            "username": profile.user.username,
            "level": profile.level,
            "xp": profile.xp,
        })

    return Response(data)