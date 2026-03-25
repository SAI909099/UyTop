import { OwnerDashboardShell } from "@/components/owner/dashboard-shell";
import { PremiumCard } from "@/components/ui/premium-card";
import { getAuthToken, getCurrentUser, getOwnerDashboardListings } from "@/lib/api/client";

export default async function OwnerDashboardPage() {
  const token = await getAuthToken();

  if (!token) {
    return (
      <main className="access-gate">
        <div className="site-shell">
          <PremiumCard>
            <p className="eyebrow">Owner dashboard</p>
            <h1>Sign-in is required for owner operations.</h1>
            <p>
              This public website already supports a protected owner workspace, but it expects a valid backend JWT in the
              `uytop_access_token` cookie or a `WEB_DEMO_OWNER_TOKEN` environment value for local demos.
            </p>
          </PremiumCard>
        </div>
      </main>
    );
  }

  try {
    const [user, listings] = await Promise.all([
      getCurrentUser(token),
      getOwnerDashboardListings(token),
    ]);

    return (
      <main className="owner-page">
        <OwnerDashboardShell user={user} listings={listings.results} />
      </main>
    );
  } catch {
    return (
      <main className="access-gate">
        <div className="site-shell">
          <PremiumCard>
            <p className="eyebrow">Owner dashboard</p>
            <h1>We couldn’t load the owner workspace.</h1>
            <p>
              Check that the backend is running and the access token belongs to an owner or admin account.
            </p>
          </PremiumCard>
        </div>
      </main>
    );
  }
}
