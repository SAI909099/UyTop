import os

from rest_framework.permissions import BasePermission


class IsAdminRoleOrBypass(BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated and getattr(request.user, "is_admin_role", False):
            return True

        bypass_enabled = os.getenv("ADMIN_BYPASS_AUTH", "false").lower() == "true"
        return bypass_enabled and request.headers.get("X-Admin-Bypass", "").lower() == "true"
