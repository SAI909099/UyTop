import { BuildingFloorExplorer } from '@/components/buildings/building-floor-explorer';
import { formatCurrency, formatLabel } from '@/lib/utils/format';
import type { PublicBuildingDetail } from '@/types/home';

type BuildingDetailViewProps = {
  building: PublicBuildingDetail;
};

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function getLocationLabel(building: PublicBuildingDetail) {
  return building.project.district ? `${building.project.district.name}, ${building.project.city.name}` : building.project.city.name;
}

function getHeroImage(building: PublicBuildingDetail) {
  return building.cover_image_url || building.project.hero_image_url || null;
}

function getPriceSummary(building: PublicBuildingDetail) {
  const priceFrom = numeric(building.price_from);
  const priceTo = numeric(building.price_to);

  if (priceFrom <= 0 && priceTo <= 0) {
    return 'Pricing on request';
  }

  if (priceFrom > 0 && priceTo > priceFrom) {
    return `${formatCurrency(priceFrom)} - ${formatCurrency(priceTo)}`;
  }

  return `From ${formatCurrency(priceFrom || priceTo)}`;
}

function getSummaryCopy(building: PublicBuildingDetail) {
  return (
    building.summary.trim() ||
    building.project.headline.trim() ||
    `${building.name} brings a cinematic tower presentation into the live public catalog, with pricing and unit visibility held beside the floor interaction instead of hidden in a secondary screen.`
  );
}

export function BuildingDetailView({ building }: BuildingDetailViewProps) {
  const heroImage = getHeroImage(building);
  const locationLabel = getLocationLabel(building);
  const priceSummary = getPriceSummary(building);

  return (
    <>
      <section className="building-detail-hero">
        <div className="building-detail-hero-layer building-detail-hero-layer-one" />
        <div className="building-detail-hero-layer building-detail-hero-layer-two" />

        <div className="site-shell">
          <div className="building-detail-hero-media">
            {heroImage ? (
              <img src={heroImage} alt={building.name} />
            ) : (
              <div className="building-detail-hero-placeholder">{building.name.slice(0, 1)}</div>
            )}
            <div className="building-detail-hero-overlay" />

            <div className="building-detail-hero-copy">
              <p className="hero-badge">
                <span className="hero-badge-dot" />
                Building detail
              </p>
              <h1>{building.name}</h1>
              <p className="building-detail-hero-lead">{getSummaryCopy(building)}</p>

              <div className="building-detail-hero-meta">
                <span>{building.project.name}</span>
                <span>{locationLabel}</span>
                <span>{building.handover || 'Handover pending'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="building-detail-section">
        <div className="site-shell building-detail-layout">
          <BuildingFloorExplorer building={building} />

          <aside className="building-detail-sidebar premium-surface">
            <p className="section-label">Price & availability</p>
            <h2 className="building-detail-sidebar-title">{priceSummary}</h2>
            <p className="section-copy">
              The fixed sidebar keeps the essential buying context visible while the left panel focuses on floors,
              diagram treatment, and unit selection.
            </p>

            <div className="building-detail-sidebar-grid">
              <div>
                <span>Status</span>
                <strong>{formatLabel(building.status)}</strong>
              </div>
              <div>
                <span>Public units</span>
                <strong>{building.apartments_left}</strong>
              </div>
              <div>
                <span>Total floors</span>
                <strong>{building.total_floors ?? 'Pending'}</strong>
              </div>
              <div>
                <span>Total apartments</span>
                <strong>{building.total_apartments ?? 'Pending'}</strong>
              </div>
              <div>
                <span>Handover</span>
                <strong>{building.handover || 'Pending'}</strong>
              </div>
              <div>
                <span>Project</span>
                <strong>{building.project.name}</strong>
              </div>
            </div>

            <div className="building-detail-amenity-row" aria-label="Building highlights">
              <span>
                <i className="building-detail-amenity-icon" aria-hidden="true" />
                Tower scale
              </span>
              <span>
                <i className="building-detail-amenity-icon" aria-hidden="true" />
                Live units
              </span>
              <span>
                <i className="building-detail-amenity-icon" aria-hidden="true" />
                Dusk presentation
              </span>
            </div>

            <div className="building-detail-sidebar-actions">
              <a href="#available-units" className="button button-primary">
                View available units
              </a>
              <a href="/map" className="button button-secondary">
                Back to live map
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
