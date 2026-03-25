from rest_framework.permissions import BasePermission


class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_owner or request.user.is_admin_role)
        )

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin_role or obj.owner_id == request.user.id)
        )
