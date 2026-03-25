from django.urls import path

from .views import AdminPendingListingsView, AdminReportListView, ApproveListingView, ListingReportCreateView, RejectListingView

urlpatterns = [
    path("reports", ListingReportCreateView.as_view(), name="report-create"),
    path("admin/listings/pending", AdminPendingListingsView.as_view(), name="admin-pending-listings"),
    path("admin/listings/<int:id>/approve", ApproveListingView.as_view(), name="admin-approve-listing"),
    path("admin/listings/<int:id>/reject", RejectListingView.as_view(), name="admin-reject-listing"),
    path("admin/reports", AdminReportListView.as_view(), name="admin-reports"),
]
