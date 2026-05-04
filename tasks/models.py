from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

# ================= TASK =================
class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"


# ================= PROFILE =================
phone_validator = RegexValidator(
    regex=r'^\d{9,15}$',
    message="رقم الهاتف يجب أن يكون أرقام فقط من 9 إلى 15 رقم"
)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, validators=[phone_validator], blank=True, null=True)

    def __str__(self):
        return self.user.username


# ================= OTP =================
import random

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_code(self):
        self.code = str(random.randint(100000, 999999))
        self.save()


# ================= SIGNAL =================
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)