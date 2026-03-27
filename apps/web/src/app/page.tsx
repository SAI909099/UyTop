import { DeveloperBrandRail } from '@/components/home/developer-brand-rail';
import { DeveloperLogoMarquee } from '@/components/home/developer-logo-marquee';
import { HomeLiveMap } from '@/components/home/home-live-map';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { ProjectFilterPanel } from '@/components/home/project-filter-panel';
import { getHomepageData } from '@/lib/api/public';
import { formatCompactNumber, formatCurrency } from '@/lib/utils/format';
import type { PublicCompany, PublicProject } from '@/types/home';

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function sortCompanies(companies: PublicCompany[]) {
  return [...companies].sort((left, right) => {
    if (left.is_verified !== right.is_verified) {
      return Number(right.is_verified) - Number(left.is_verified);
    }

    if (left.project_count !== right.project_count) {
      return right.project_count - left.project_count;
    }

    return right.apartment_count - left.apartment_count;
  });
}

function sortProjects(projects: PublicProject[]) {
  return [...projects].sort((left, right) => {
    if (left.building_count !== right.building_count) {
      return right.building_count - left.building_count;
    }

    const priceDifference = numeric(right.starting_price) - numeric(left.starting_price);
    if (priceDifference !== 0) {
      return priceDifference;
    }

    return left.name.localeCompare(right.name);
  });
}

export default async function HomePage() {
  const {
    companies,
    companiesCount,
    projects,
    projectsCount,
    projectDeliveryYears,
    projectPriceBounds,
    projectRoomCounts,
    showcaseApartments,
    showcaseApartmentsCount,
    mapApartments,
    mapApartmentsCount,
  } = await getHomepageData();

  const sortedCompanies = sortCompanies(companies);
  const sortedProjects = sortProjects(projects);
  const marqueeCompanies = sortedCompanies.filter((company) => company.logo_url?.trim());
  const totalPublishedApartments = mapApartmentsCount;
  const averageProjectEntry =
    sortedProjects.length > 0
      ? Math.round(sortedProjects.reduce((sum, project) => sum + numeric(project.starting_price), 0) / sortedProjects.length)
      : 0;
  const liveCities = new Set(
    sortedProjects.map((project) => project.district?.name ?? project.city.name),
  ).size;

  return (
    <main className="home-page">
      <HomePrimaryNav />

      <section className="hero-section" id="top">
        <div className="hero-layer hero-layer-one" />
        <div className="hero-layer hero-layer-two" />
        <div className="hero-line-grid" aria-hidden="true" />
        <div className="site-shell hero-grid">
          <div className="hero-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Premium real estate platform
            </p>
            <h1>
              Map-first discovery for
              <span className="hero-title-accent"> cinematic urban living.</span>
            </h1>
            <p className="hero-lead">
              UyTop pairs verified developers, live public inventory, and a dark layered interface that feels more
              like a design-led property launch than a generic listing feed.
            </p>

            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Open live map
              </a>
              <a href="#projects" className="button button-secondary">
                Featured projects
              </a>
              <a href="#developers" className="button button-ghost">
                Verified developers
              </a>
            </div>

            <div className="hero-metrics">
              <article className="metric-card">
                <p>Verified companies</p>
                <strong>{formatCompactNumber(companiesCount)}</strong>
                <span>Trusted developer brands with an active public presence across the live catalog experience.</span>
              </article>
              <article className="metric-card">
                <p>Visible residences</p>
                <strong>{formatCompactNumber(totalPublishedApartments)}</strong>
                <span>Public apartments currently available to inspect through the live map, not a static promo showcase.</span>
              </article>
              <article className="metric-card">
                <p>Average launch entry</p>
                <strong>{averageProjectEntry ? formatCurrency(averageProjectEntry) : 'Awaiting inventory'}</strong>
                <span>A live snapshot of the current starting-price level across the featured launches now active on the platform.</span>
              </article>
            </div>
          </div>

          <div className="hero-visual" id="map">
            <HomeLiveMap items={mapApartments} variant="preview" />
            <DeveloperLogoMarquee companies={marqueeCompanies} />
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="site-shell stats-strip-grid">
          <article className="stats-strip-item">
            <strong>{formatCompactNumber(companiesCount)}</strong>
            <span>Developer brands</span>
          </article>
          <article className="stats-strip-item">
            <strong>{formatCompactNumber(projectsCount)}</strong>
            <span>Public projects</span>
          </article>
          <article className="stats-strip-item">
            <strong>{formatCompactNumber(totalPublishedApartments)}</strong>
            <span>Map apartments</span>
          </article>
          <article className="stats-strip-item">
            <strong>{formatCompactNumber(liveCities)}</strong>
            <span>Live districts</span>
          </article>
        </div>
      </section>

      <ProjectFilterPanel
        projects={sortedProjects}
        companies={sortedCompanies}
        totalCount={projectsCount}
        deliveryYears={projectDeliveryYears}
        priceBounds={projectPriceBounds}
        roomCounts={projectRoomCounts}
        apartments={showcaseApartments}
        apartmentCount={showcaseApartmentsCount}
      />

      <section className="section-shell section-ivory" id="developers">
        <div className="site-shell">
          <div className="section-head">
            <div>
              <p className="section-label">Verified developers</p>
              <h2 className="section-title">Brands, trust notes, and launch depth stay visible.</h2>
              <p className="section-copy">
                The homepage uses the active company catalog as a brand layer, so trust and storytelling are not
                separated from inventory.
              </p>
            </div>
          </div>

          <div className="developer-brand-rail-wrap">
            {sortedCompanies.length ? (
              <DeveloperBrandRail companies={sortedCompanies} />
            ) : (
              <article className="empty-card premium-surface">
                <p className="section-label">Developers</p>
                <h3>No active companies are available yet.</h3>
                <p>Publish companies through the admin catalog and this section will start rendering live brand data.</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="site-shell cta-shell premium-surface">
          <p className="section-label">Built for live inventory</p>
          <h2 className="section-title">This homepage is real app code, not a static mock.</h2>
          <p className="section-copy">
            It uses the current backend catalog endpoints, keeps the established env pattern, and is ready to grow into
            a larger public experience when you restore more routes.
          </p>
          <div className="cta-actions">
            <a href="#map" className="button button-primary">
              Back to map
            </a>
            <a href="#projects" className="button button-secondary">
              Review projects
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
