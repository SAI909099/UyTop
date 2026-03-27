import { BuildingDetailView } from '@/components/buildings/building-detail-view';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicBuildingDetail } from '@/lib/api/public';
import type { PublicBuildingDetail } from '@/types/home';

type BuildingDetailPageProps = {
  params: Promise<{
    projectSlug: string;
    buildingSlug: string;
  }>;
};

async function loadBuilding(buildingSlug: string): Promise<PublicBuildingDetail | null> {
  try {
    return await getPublicBuildingDetail(buildingSlug);
  } catch {
    return null;
  }
}

function BuildingDetailState() {
  return (
    <main className="building-detail-page-shell">
      <HomePrimaryNav ctaHref="/map" ctaLabel="Open live map" />

      <section className="building-detail-state-section">
        <div className="site-shell">
          <article className="premium-surface building-detail-state-card">
            <p className="section-label">Building unavailable</p>
            <h1>The requested building detail could not be loaded.</h1>
            <p>
              The building may be unpublished, the nested route may not match the actual project relationship, or the
              public catalog request may have failed.
            </p>
            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Back to live map
              </a>
              <a href="/" className="button button-secondary">
                Back to homepage
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default async function BuildingDetailPage({ params }: BuildingDetailPageProps) {
  const { buildingSlug, projectSlug } = await params;
  const building = await loadBuilding(buildingSlug);

  if (!building || building.project.slug !== projectSlug) {
    return <BuildingDetailState />;
  }

  return (
    <main className="building-detail-page-shell">
      <HomePrimaryNav ctaHref="/map" ctaLabel="Open live map" />
      <BuildingDetailView building={building} />
    </main>
  );
}
