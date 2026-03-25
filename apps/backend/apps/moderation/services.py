from apps.moderation.models import AuditLog, ListingModerationAction


def create_moderation_action(*, listing, actor, action, notes="", report=None, metadata=None):
    return ListingModerationAction.objects.create(
        listing=listing,
        actor=actor,
        action=action,
        notes=notes,
        report=report,
        metadata=metadata or {},
    )


def create_audit_log(*, actor, action, target_model, target_id, metadata=None):
    return AuditLog.objects.create(
        actor=actor,
        action=action,
        target_model=target_model,
        target_id=str(target_id),
        metadata=metadata or {},
    )
