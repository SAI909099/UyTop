import { formatCompactNumber, formatCurrency, formatLabel, formatRooms } from '@/lib/utils/format';
import type { PublicApartmentSort, PublicApartmentSummary } from '@/types/home';

const DEFAULT_SORT: PublicApartmentSort = 'newest';
const SORT_OPTIONS: Array<{ value: PublicApartmentSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
];

type ResidencesHubProps = {
  residences: PublicApartmentSummary[];
  totalCount: number;
  searchQuery: string;
  sort: PublicApartmentSort;
  currentPage: number;
  pageSize: number;
  hasError?: boolean;
};

type DirectoryState = {
  q: string;
  sort: PublicApartmentSort;
  page: number;
};

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function getLocationLabel(apartment: PublicApartmentSummary) {
  return apartment.district ? `${apartment.district.name}, ${apartment.city.name}` : apartment.city.name;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getResidenceLead(apartment: PublicApartmentSummary) {
  const description = apartment.description.trim();
  if (description) {
    return description;
  }

  const address = apartment.address.trim();
  if (address) {
    return `${address} inside ${apartment.project_name}, with the project and building context visible before the user opens the full detail route.`;
  }

  return `${apartment.title} keeps price, floor, room count, and project context visible in one browse card.`;
}

function getPageLabel(currentPage: number, pageSize: number, totalCount: number) {
  if (totalCount === 0) {
    return 'No residences match the current query.';
  }

  const pageStart = (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(totalCount, pageStart + pageSize - 1);
  return `Showing ${pageStart}-${pageEnd} of ${totalCount} residences`;
}

function buildPagination(totalPages: number, currentPage: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items: Array<number | string> = [];
  let previousPage = 0;

  sortedPages.forEach((page) => {
    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}-${page}`);
    }

    items.push(page);
    previousPage = page;
  });

  return items;
}

function buildResidencesHref(currentState: DirectoryState, overrides: Partial<DirectoryState>) {
  const nextState = {
    ...currentState,
    ...overrides,
  };
  const query = new URLSearchParams();

  if (nextState.q) {
    query.set('q', nextState.q);
  }

  if (nextState.sort !== DEFAULT_SORT) {
    query.set('sort', nextState.sort);
  }

  if (nextState.page > 1) {
    query.set('page', String(nextState.page));
  }

  const serialized = query.toString();
  return serialized ? `/residences?${serialized}` : '/residences';
}

export function ResidencesHub({
  residences,
  totalCount,
  searchQuery,
  sort,
  currentPage,
  pageSize,
  hasError = false,
}: ResidencesHubProps) {
  const activeState = { q: searchQuery, sort, page: currentPage };
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginationItems = totalPages > 1 ? buildPagination(totalPages, currentPage) : [];
  const representedProjects = new Set(residences.map((residence) => residence.project_name).filter(Boolean)).size;
  const representedLocations = new Set(residences.map((residence) => getLocationLabel(residence))).size;
  const averagePrice =
    residences.length > 0
      ? Math.round(residences.reduce((sum, residence) => sum + numeric(residence.price), 0) / residences.length)
      : 0;
  const currency = residences[0]?.currency ?? 'USD';
  const hasSearch = searchQuery.length > 0;

  return (
    <main className="project-hub-page residences-page">
      <section className="project-hub-hero residences-hero">
        <div className="project-hub-layer project-hub-layer-one" />
        <div className="project-hub-layer project-hub-layer-two" />

        <div className="site-shell project-hub-hero-grid">
          <div className="project-hub-copy residences-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Residences directory
            </p>
            <h1>
              Browse
              <span className="hero-title-accent"> live residences.</span>
            </h1>
            <p className="project-hub-lead">
              A dedicated public catalog for scanning every published residence, refining the view with search, and
              switching the order without dropping back to the homepage showcase.
            </p>

            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Open live map
              </a>
              <a href="/projects" className="button button-secondary">
                Explore projects
              </a>
              <a href="/" className="button button-ghost">
                Back to homepage
              </a>
            </div>
          </div>

          <article className="developer-hub-spotlight premium-surface residences-spotlight">
            <p className="section-label">Directory snapshot</p>
            <h2>Search and sort the published residential catalog from one shareable route.</h2>
            <div className="developer-hub-spotlight-grid">
              <article>
                <span>Visible residences</span>
                <strong>{formatCompactNumber(totalCount)}</strong>
              </article>
              <article>
                <span>Projects on this page</span>
                <strong>{formatCompactNumber(representedProjects)}</strong>
              </article>
              <article>
                <span>Locations in view</span>
                <strong>{formatCompactNumber(representedLocations)}</strong>
              </article>
              <article>
                <span>Average on page</span>
                <strong>{averagePrice ? formatCurrency(averagePrice, currency) : 'Awaiting inventory'}</strong>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className="project-hub-tools-section">
        <div className="site-shell">
          <div className="project-hub-tools premium-surface residences-tools">
            <form action="/residences" className="residences-search-form">
              <label className="developer-hub-search-shell" htmlFor="residences-search">
                <span>Search residences</span>
                <input
                  id="residences-search"
                  className="developer-hub-search-input"
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Residence, project, building, district, or address"
                />
              </label>
              <input type="hidden" name="sort" value={sort} />
              <button type="submit" className="button button-primary residences-search-submit">
                Search
              </button>
              {hasSearch ? (
                <a href={buildResidencesHref(activeState, { q: '', page: 1 })} className="button button-ghost">
                  Clear search
                </a>
              ) : null}
            </form>

            <div className="project-filter-sort-row residences-sort-row">
              <div className="project-filter-results-copy">
                <strong>{formatCompactNumber(totalCount)}</strong>
                <span>{hasSearch ? `match${totalCount === 1 ? '' : 'es'} for "${searchQuery}"` : 'published residences'}</span>
              </div>

              <div className="project-filter-sort-list">
                {SORT_OPTIONS.map((option) => (
                  <a
                    key={option.value}
                    href={buildResidencesHref(activeState, { sort: option.value, page: 1 })}
                    className={`project-sort-pill${sort === option.value ? ' project-sort-pill-active' : ''}`}
                  >
                    {option.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="project-filter-status" aria-live="polite">
            <p className="project-filter-pagination-copy">{hasError ? 'The residences catalog could not be loaded.' : getPageLabel(currentPage, pageSize, totalCount)}</p>
          </div>

          {hasError ? (
            <div className="project-filter-feedback project-filter-feedback-error" role="status">
              <span>The public residences request failed. Retry the directory or open the live map while the catalog recovers.</span>
              <a href={buildResidencesHref(activeState, {})} className="project-filter-reset">
                Try again
              </a>
            </div>
          ) : null}

          <div className="developer-hub-results-head">
            <div>
              <p className="section-label">Residence roster</p>
              <h2 className="developer-hub-results-title">Every published apartment stays browseable beyond the homepage highlight rail.</h2>
            </div>

            {hasSearch ? (
              <a href={buildResidencesHref(activeState, { q: '', page: 1 })} className="developer-hub-reset">
                Clear query
              </a>
            ) : null}
          </div>

          {!hasError && residences.length ? (
            <div className="project-grid residence-grid">
              {residences.map((residence) => {
                const image = residence.primary_image || residence.images[0]?.image_url || null;
                const locationLabel = getLocationLabel(residence);
                const sizeValue = numeric(residence.size_sqm);
                const sizeLabel = sizeValue > 0 ? `${sizeValue.toFixed(sizeValue % 1 === 0 ? 0 : 1)} sqm` : 'Area pending';

                return (
                  <article key={residence.slug} className="project-card premium-surface residence-card">
                    <div className="project-media residence-card-media">
                      {image ? (
                        <img src={image} alt={residence.title} loading="lazy" />
                      ) : (
                        <div className="project-media project-media-placeholder">
                          <span>{getInitials(residence.project_name || residence.title)}</span>
                        </div>
                      )}

                      <div className="project-media-overlay" />

                      <div className="residence-card-status">
                        <span>{formatLabel(residence.status)}</span>
                      </div>
                    </div>

                    <div className="project-card-body residence-card-body">
                      <div className="project-topline">
                        <span>{locationLabel}</span>
                        <span>{residence.project_name}</span>
                      </div>

                      <h3>{residence.title}</h3>
                      <strong>{formatCurrency(residence.price, residence.currency)}</strong>
                      <p>{getResidenceLead(residence)}</p>

                      <div className="residence-card-context">
                        <span>{residence.company_name}</span>
                        <span>{residence.building_name}</span>
                        <span>{residence.apartment_number}</span>
                      </div>

                      <div className="project-meta-grid">
                        <div>
                          <span>Rooms</span>
                          <strong>{formatRooms(residence.rooms)}</strong>
                        </div>
                        <div>
                          <span>Area</span>
                          <strong>{sizeLabel}</strong>
                        </div>
                        <div>
                          <span>Floor</span>
                          <strong>{residence.floor}</strong>
                        </div>
                      </div>

                      <a href={`/apartments/${residence.slug}`} className="apartment-showcase-link">
                        View residence
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!hasError && !residences.length ? (
            <article className="empty-card premium-surface project-filter-empty residences-empty">
              <p className="section-label">{hasSearch ? 'No matches' : 'No residences'}</p>
              <h3>{hasSearch ? 'No residences match the current search query.' : 'No public residences are active yet.'}</h3>
              <p>
                {hasSearch
                  ? 'Widen the search terms or clear the query to bring more residences back into view.'
                  : 'Publish public apartments in the catalog and this route will begin rendering the live residence roster.'}
              </p>
              <div className="hero-actions">
                {hasSearch ? (
                  <a href={buildResidencesHref(activeState, { q: '', page: 1 })} className="button button-primary">
                    Clear search
                  </a>
                ) : (
                  <a href="/map" className="button button-primary">
                    Open live map
                  </a>
                )}
                <a href="/" className="button button-secondary">
                  Back to homepage
                </a>
              </div>
            </article>
          ) : null}

          {!hasError && totalPages > 1 ? (
            <div className="project-filter-pagination" aria-label="Residence results pages">
              <p className="project-filter-pagination-copy">{getPageLabel(currentPage, pageSize, totalCount)}</p>

              <div className="project-filter-pagination-controls">
                {currentPage > 1 ? (
                  <a href={buildResidencesHref(activeState, { page: currentPage - 1 })} className="project-filter-page-button">
                    Previous
                  </a>
                ) : (
                  <span className="project-filter-page-button residences-page-button-disabled">Previous</span>
                )}

                {paginationItems.map((item) =>
                  typeof item === 'number' ? (
                    <a
                      key={item}
                      href={buildResidencesHref(activeState, { page: item })}
                      className={`project-filter-page-button${currentPage === item ? ' project-filter-page-button-active' : ''}`}
                      aria-current={currentPage === item ? 'page' : undefined}
                    >
                      {item}
                    </a>
                  ) : (
                    <span key={item} className="project-filter-page-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  ),
                )}

                {currentPage < totalPages ? (
                  <a href={buildResidencesHref(activeState, { page: currentPage + 1 })} className="project-filter-page-button">
                    Next
                  </a>
                ) : (
                  <span className="project-filter-page-button residences-page-button-disabled">Next</span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
