from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserProfile, UserRole


def build_auth_payload(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    refresh["email"] = user.email
    refresh["role"] = user.role

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@transaction.atomic
def register_user(*, email: str, phone_number: str, password: str, first_name: str, last_name: str, role: str, profile_data: dict) -> User:
    user = User.objects.create_user(
        email=email,
        phone_number=phone_number,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role=role if role in {UserRole.USER, UserRole.OWNER} else UserRole.USER,
    )

    UserProfile.objects.update_or_create(
        user=user,
        defaults=profile_data,
    )

    return user
