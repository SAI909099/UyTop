from django.conf import settings
from django.db.models import Q
from rest_framework import serializers

from apps.accounts.models import OwnerVerification, User, UserProfile, UserRole
from apps.accounts.services import build_auth_payload, register_user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("preferred_language", "city", "district")


class OwnerVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnerVerification
        fields = ("status", "notes", "reviewed_at")


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    owner_verification = OwnerVerificationSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    is_verified_owner = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "is_verified_owner",
            "profile",
            "owner_verification",
        )
        read_only_fields = fields


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=32)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[UserRole.USER, UserRole.OWNER], default=UserRole.USER)
    preferred_language = serializers.CharField(max_length=16, required=False, default=settings.UYTOP_DEFAULT_LANGUAGE)
    city = serializers.CharField(max_length=128, required=False, allow_blank=True, default="")
    district = serializers.CharField(max_length=128, required=False, allow_blank=True, default="")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        profile_data = {
            "preferred_language": validated_data.pop("preferred_language", settings.UYTOP_DEFAULT_LANGUAGE),
            "city": validated_data.pop("city", ""),
            "district": validated_data.pop("district", ""),
        }
        return register_user(profile_data=profile_data, **validated_data)


class CurrentUserSerializer(UserSerializer):
    pass


class CurrentUserUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=32, required=False)
    preferred_language = serializers.CharField(max_length=16, required=False)
    city = serializers.CharField(max_length=128, required=False, allow_blank=True)
    district = serializers.CharField(max_length=128, required=False, allow_blank=True)

    def validate_phone_number(self, value):
        user = self.context["request"].user
        if User.objects.filter(phone_number=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def update(self, instance, validated_data):
        profile = instance.profile

        for field in ("first_name", "last_name", "phone_number"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save(update_fields=["first_name", "last_name", "phone_number", "updated_at"])

        profile_updates = {}
        for field in ("preferred_language", "city", "district"):
            if field in validated_data:
                profile_updates[field] = validated_data[field]

        for field, value in profile_updates.items():
            setattr(profile, field, value)
        if profile_updates:
            profile.save(update_fields=[*profile_updates.keys(), "updated_at"])

        return instance


class UyTopTokenObtainPairSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(max_length=32, required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier") or attrs.get("email") or attrs.get("phone_number")
        password = attrs["password"]

        if not identifier:
            raise serializers.ValidationError({"identifier": "Provide email, phone_number, or identifier."})

        user = User.objects.filter(
            Q(email__iexact=identifier) | Q(phone_number=identifier)
        ).first()

        if user is None or not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid credentials."})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "User account is inactive."})

        payload = build_auth_payload(user)
        payload["user"] = UserSerializer(user).data
        return payload
