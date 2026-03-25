from rest_framework import serializers

from apps.listings.api.serializers import ListingListSerializer
from apps.moderation.models import ListingModerationAction, ListingReport, ListingReportReason


class ListingReportCreateSerializer(serializers.ModelSerializer):
    reason = serializers.ChoiceField(choices=ListingReportReason.choices)

    class Meta:
        model = ListingReport
        fields = ("listing", "reason", "details")

    def validate_listing(self, value):
        if value.moderation_status != "approved":
            raise serializers.ValidationError("Reports can only be created for approved listings.")
        request = self.context["request"]
        if value.owner_id == request.user.id:
            raise serializers.ValidationError("You cannot report your own listing.")
        return value

    def create(self, validated_data):
        return ListingReport.objects.create(reporter=self.context["request"].user, **validated_data)


class ListingReportSerializer(serializers.ModelSerializer):
    listing = ListingListSerializer(read_only=True)
    reporter_email = serializers.EmailField(source="reporter.email", read_only=True, default=None)

    class Meta:
        model = ListingReport
        fields = ("id", "listing", "reporter_email", "reason", "details", "status", "created_at")


class ListingModerationActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingModerationAction
        fields = ("id", "action", "notes", "metadata", "created_at")


class ModerationDecisionSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)
