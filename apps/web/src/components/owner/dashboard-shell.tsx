import { StatCard } from "@/components/ui/stat-card";
import { titleize } from "@/lib/utils/format";
import type { AuthUser, ListingSummary } from "@/types/api";

type DashboardShellProps = {
  user: AuthUser;
  listings: ListingSummary[];
};

export function OwnerDashboardShell({ user, listings }: DashboardShellProps) {
  const draftCount = listings.filter((item) => item.moderation_status === "draft").length;
  const pendingCount = listings.filter((item) => item.moderation_status === "pending_review").length;
  const approvedCount = listings.filter((item) => item.moderation_status === "approved").length;
  const closedCount = listings.filter((item) => item.status === "sold" || item.status === "rented").length;

  return (
    <div className="site-shell owner-dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Owner workspace</p>
          <h1>{user.full_name || user.email}</h1>
          <p>
            Manage moderated inventory, monitor listing momentum, and keep premium presentation consistent across every property.
          </p>
        </div>
        <div className="dashboard-status">
          <span className={`verification-pill ${user.is_verified_owner ? "verification-pill-active" : ""}`}>
            {user.is_verified_owner ? "Verified owner" : "Verification pending"}
          </span>
        </div>
      </section>

      <section className="dashboard-stats">
        <StatCard label="Total listings" value={String(listings.length)} tone="accent" />
        <StatCard label="Drafts" value={String(draftCount)} />
        <StatCard label="Pending review" value={String(pendingCount)} />
        <StatCard label="Approved" value={String(approvedCount)} />
        <StatCard label="Sold / rented" value={String(closedCount)} />
      </section>

      <section className="dashboard-content">
        <div className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>My listings</h2>
            <p>Moderation state, pricing posture, and premium placement cues.</p>
          </div>
          <div className="dashboard-table">
            <div className="dashboard-table-row dashboard-table-head">
              <span>Listing</span>
              <span>Purpose</span>
              <span>Status</span>
              <span>Price</span>
            </div>
            {listings.map((listing) => (
              <div key={listing.id} className="dashboard-table-row">
                <span>
                  <strong>{listing.title}</strong>
                  <small>{listing.city.name}</small>
                </span>
                <span>{titleize(listing.purpose)}</span>
                <span>{titleize(listing.moderation_status)}</span>
                <span>{listing.currency} {listing.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-rail">
          <div className="premium-card analytics-panel">
            <p className="eyebrow">Performance</p>
            <h3>Analytics foundation</h3>
            <ul>
              <li>Views, favorites, and contact clicks will surface here once analytics aggregation is connected.</li>
              <li>Moderation cycle insights are already supported by the backend listing states.</li>
            </ul>
          </div>
          <div className="premium-card analytics-panel">
            <p className="eyebrow">Moderation posture</p>
            <h3>Submission guidance</h3>
            <ul>
              <li>Upload complete galleries before review.</li>
              <li>Keep city, district, and contact options accurate.</li>
              <li>Use polished descriptions for stronger trust signals.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
