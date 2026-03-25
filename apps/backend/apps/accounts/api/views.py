from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.services import build_auth_payload

from .serializers import (
    AuthResponseSerializer,
    CurrentUserSerializer,
    CurrentUserUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
    UyTopTokenObtainPairSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: AuthResponseSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        payload = build_auth_payload(user)
        payload["user"] = UserSerializer(user).data
        return Response(payload, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=UyTopTokenObtainPairSerializer, responses={200: AuthResponseSerializer})
    def post(self, request):
        serializer = UyTopTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: CurrentUserSerializer})
    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=CurrentUserUpdateSerializer, responses={200: CurrentUserSerializer})
    def put(self, request):
        serializer = CurrentUserUpdateSerializer(
            request.user,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(CurrentUserSerializer(user).data)
