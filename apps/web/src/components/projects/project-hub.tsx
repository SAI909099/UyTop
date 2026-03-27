"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { getPublicProjects } from "@/lib/api/public";
import { formatCompactNumber, formatCurrency, formatRooms } from "@/lib/utils/format";
import type { ProjectPriceBounds, PublicCompany, PublicProject, PublicProjectSort } from "@/types/home";

const PROJECTS_PAGE_SIZE = 12;
const ROOM_MATCH_PAGE_SIZE = 100;
const PRICE_STEP = 25_000;

type ProjectHubProps = {
  companies: PublicCompany[];
  projects: PublicProject[];
  deliveryYears: number[];
  priceBounds: ProjectPriceBounds;
  roomCounts: number[];
};

type NormalizedProject = PublicProject & {
  companyName: string;
  locationName: string;
  deliveryYear: number | null;
  priceValue: number;
};

type RangeControlProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueLabel: string;
  onChange: (value: number) => void;
};

const sortOptions: { value: PublicProjectSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
  { value: "delivery_asc", label: "Earliest year" },
];

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function parseDeliveryYear(value: string) {
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function normalizePriceBounds(minimum: number, maximum: number): ProjectPriceBounds {
  if (maximum <= 0) {
    return { min: 0, max: 1_000_000 };
  }

  const normalizedMin = Math.floor(minimum / PRICE_STEP) * PRICE_STEP;
  const normalizedMax = Math.ceil(maximum / PRICE_STEP) * PRICE_STEP;

  if (normalizedMin === normalizedMax) {
    return {
      min: normalizedMin,
      max: normalizedMax + PRICE_STEP,
    };
  }

  return {
    min: normalizedMin,
    max: normalizedMax,
  };
}

function getFallbackPriceBounds(projects: PublicProject[]) {
  const prices = projects.map((project) => numeric(project.starting_price)).filter((value) => value > 0);

  if (!prices.length) {
    return { min: 0, max: 1_000_000 };
  }

  return normalizePriceBounds(Math.min(...prices), Math.max(...prices));
}

function getResolvedPriceBounds(priceBounds: ProjectPriceBounds, projects: PublicProject[]) {
  if (priceBounds.max > 0) {
    return normalizePriceBounds(priceBounds.min, priceBounds.max);
  }

  return getFallbackPriceBounds(projects);
}

function getRangeBackground(min: number, max: number, value: number) {
  if (max <= min) {
    return "linear-gradient(90deg, #ddb84e 0%, #ddb84e 100%)";
  }

  const progress = ((value - min) / (max - min)) * 100;

  return `linear-gradient(90deg, #ddb84e 0%, #ddb84e ${progress}%, rgba(255, 255, 255, 0.12) ${progress}%, rgba(255, 255, 255, 0.12) 100%)`;
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

function toggleRoomSelection(selectedRooms: number[], roomCount: number) {
  if (selectedRooms.includes(roomCount)) {
    return selectedRooms.filter((value) => value !== roomCount);
  }

  return [...selectedRooms, roomCount].sort((left, right) => left - right);
}

function sortProjects(projects: NormalizedProject[], sortMode: PublicProjectSort) {
  return [...projects].sort((left, right) => {
    if (sortMode === "price_asc") {
      const priceDifference = left.priceValue - right.priceValue;
      if (priceDifference !== 0) {
        return priceDifference;
      }
    }

    if (sortMode === "price_desc") {
      const priceDifference = right.priceValue - left.priceValue;
      if (priceDifference !== 0) {
        return priceDifference;
      }
    }

    if (sortMode === "delivery_asc") {
      if (left.deliveryYear === null && right.deliveryYear !== null) {
        return 1;
      }

      if (left.deliveryYear !== null && right.deliveryYear === null) {
        return -1;
      }

      if (left.deliveryYear !== null && right.deliveryYear !== null && left.deliveryYear !== right.deliveryYear) {
        return left.deliveryYear - right.deliveryYear;
      }
    }

    if (left.building_count !== right.building_count) {
      return right.building_count - left.building_count;
    }

    if (left.priceValue !== right.priceValue) {
      return right.priceValue - left.priceValue;
    }

    return left.name.localeCompare(right.name);
  });
}

function getProjectLead(project: NormalizedProject) {
  return (
    project.headline.trim() ||
    project.address.trim() ||
    project.location_label.trim() ||
    `${project.name} keeps its live pricing, delivery, and developer context visible in one project-first browse card.`
  );
}

function RangeControl({ id, label, min, max, step, value, valueLabel, onChange }: RangeControlProps) {
  return (
    <div className="project-filter-range-control">
      <div className="project-filter-range-head">
        <label htmlFor={id} className="project-filter-range-label">
          {label}
        </label>
        <strong className="project-filter-range-value">{valueLabel}</strong>
      </div>

      <input
        id={id}
        className="project-filter-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        style={{ background: getRangeBackground(min, max, value) }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function ProjectHub({ companies, projects, deliveryYears, priceBounds, roomCounts }: ProjectHubProps) {
  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company])), [companies]);
  const normalizedProjects = useMemo<NormalizedProject[]>(
    () =>
      projects.map((project) => ({
        ...project,
        companyName: companyMap.get(project.company)?.name ?? "Verified developer",
        locationName: project.district?.name ?? project.city.name,
        deliveryYear: parseDeliveryYear(project.delivery_window),
        priceValue: numeric(project.starting_price),
      })),
    [companyMap, projects],
  );
  const resolvedPriceBounds = useMemo(
    () => getResolvedPriceBounds(priceBounds, projects),
    [priceBounds.max, priceBounds.min, projects],
  );
  const availableCompanies = useMemo(() => {
    const referencedCompanyIds = new Set(projects.map((project) => project.company));

    return [...companies]
      .filter((company) => referencedCompanyIds.has(company.id))
      .sort((left, right) => {
        if (left.is_verified !== right.is_verified) {
          return Number(right.is_verified) - Number(left.is_verified);
        }

        if (left.project_count !== right.project_count) {
          return right.project_count - left.project_count;
        }

        return left.name.localeCompare(right.name);
      });
  }, [companies, projects]);
  const availableYears = useMemo(() => {
    if (deliveryYears.length) {
      return [...new Set(deliveryYears)].sort((left, right) => left - right);
    }

    return Array.from(
      new Set(normalizedProjects.map((project) => project.deliveryYear).filter((year): year is number => year !== null)),
    ).sort((left, right) => left - right);
  }, [deliveryYears, normalizedProjects]);
  const availableRooms = useMemo(
    () => [...new Set(roomCounts)].filter((roomCount) => roomCount > 0).sort((left, right) => left - right),
    [roomCounts],
  );
  const availableRegions = useMemo(
    () => ["all", ...new Set(normalizedProjects.map((project) => project.locationName).filter(Boolean)).values()],
    [normalizedProjects],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [minimumPrice, setMinimumPrice] = useState(resolvedPriceBounds.min);
  const [maximumPrice, setMaximumPrice] = useState(resolvedPriceBounds.max);
  const [sortMode, setSortMode] = useState<PublicProjectSort>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [matchingRoomProjectIds, setMatchingRoomProjectIds] = useState<Set<number> | null>(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [roomFilterError, setRoomFilterError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());
  const selectedRoomsKey = selectedRooms.join(",");

  useEffect(() => {
    if (!selectedRooms.length) {
      setMatchingRoomProjectIds(null);
      setIsRoomLoading(false);
      setRoomFilterError(null);
      return;
    }

    const controller = new AbortController();

    async function loadMatchingProjectIds() {
      setIsRoomLoading(true);
      setRoomFilterError(null);

      try {
        let page = 1;
        let totalPages = 1;
        const projectIds = new Set<number>();

        while (page <= totalPages) {
          const response = await getPublicProjects(
            {
              rooms: selectedRooms,
              page,
              pageSize: ROOM_MATCH_PAGE_SIZE,
            },
            { signal: controller.signal },
          );

          if (controller.signal.aborted) {
            return;
          }

          response.results.forEach((project) => {
            projectIds.add(project.id);
          });

          totalPages = Math.max(1, Math.ceil(response.count / ROOM_MATCH_PAGE_SIZE));
          page += 1;
        }

        if (!controller.signal.aborted) {
          setMatchingRoomProjectIds(projectIds);
        }
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(requestError);
        setRoomFilterError("Could not refresh the room-count filter right now.");
      } finally {
        if (!controller.signal.aborted) {
          setIsRoomLoading(false);
        }
      }
    }

    void loadMatchingProjectIds();

    return () => {
      controller.abort();
    };
  }, [reloadKey, selectedRooms, selectedRoomsKey]);

  const hasProjectCatalog = normalizedProjects.length > 0;
  const filteredProjects = useMemo(() => {
    const companyId = companyFilter === "all" ? null : Number(companyFilter);

    return normalizedProjects.filter((project) => {
      const searchTarget = [
        project.name,
        project.headline,
        project.address,
        project.location_label,
        project.city.name,
        project.district?.name ?? "",
        project.companyName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !deferredSearchQuery || searchTarget.includes(deferredSearchQuery);
      const matchesCompany = companyId === null || project.company === companyId;
      const matchesRegion = regionFilter === "all" || project.locationName === regionFilter;
      const matchesPrice = project.priceValue >= minimumPrice && project.priceValue <= maximumPrice;
      const matchesYear = selectedYear === null || project.deliveryYear === selectedYear;
      const matchesRooms =
        !selectedRooms.length || matchingRoomProjectIds === null || matchingRoomProjectIds.has(project.id);

      return matchesSearch && matchesCompany && matchesRegion && matchesPrice && matchesYear && matchesRooms;
    });
  }, [
    companyFilter,
    deferredSearchQuery,
    matchingRoomProjectIds,
    maximumPrice,
    minimumPrice,
    normalizedProjects,
    regionFilter,
    selectedRooms.length,
    selectedYear,
  ]);

  const sortedProjects = useMemo(() => sortProjects(filteredProjects, sortMode), [filteredProjects, sortMode]);
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / PROJECTS_PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageProjects = sortedProjects.slice(
    (currentPageSafe - 1) * PROJECTS_PAGE_SIZE,
    currentPageSafe * PROJECTS_PAGE_SIZE,
  );
  const paginationItems = totalPages > 1 ? buildPagination(totalPages, currentPageSafe) : [];
  const pageStart = sortedProjects.length > 0 ? (currentPageSafe - 1) * PROJECTS_PAGE_SIZE + 1 : 0;
  const pageEnd = sortedProjects.length > 0 ? pageStart + pageProjects.length - 1 : 0;
  const visibleDeveloperCount = new Set(normalizedProjects.map((project) => project.company)).size;
  const visibleRegionCount = new Set(normalizedProjects.map((project) => project.locationName)).size;
  const averageEntryPrice =
    normalizedProjects.length > 0
      ? Math.round(normalizedProjects.reduce((sum, project) => sum + project.priceValue, 0) / normalizedProjects.length)
      : 0;
  const filterCurrency = normalizedProjects[0]?.currency ?? "USD";
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    companyFilter !== "all" ||
    regionFilter !== "all" ||
    selectedRooms.length > 0 ||
    selectedYear !== null ||
    minimumPrice > resolvedPriceBounds.min ||
    maximumPrice < resolvedPriceBounds.max;

  function resetFilters() {
    setSearchQuery("");
    setCompanyFilter("all");
    setRegionFilter("all");
    setSelectedRooms([]);
    setSelectedYear(null);
    setMinimumPrice(resolvedPriceBounds.min);
    setMaximumPrice(resolvedPriceBounds.max);
    setSortMode("featured");
    setCurrentPage(1);
    setRoomFilterError(null);
    setMatchingRoomProjectIds(null);
  }

  function retryRoomFilter() {
    setReloadKey((value) => value + 1);
  }

  if (!hasProjectCatalog) {
    return (
      <main className="project-hub-page">
        <section className="project-hub-hero">
          <div className="project-hub-layer project-hub-layer-one" />
          <div className="project-hub-layer project-hub-layer-two" />

          <div className="site-shell project-hub-hero-grid">
            <div className="project-hub-copy">
              <p className="hero-badge">
                <span className="hero-badge-dot" />
                Project hub
              </p>
              <h1>Our projects directory is ready for live launches.</h1>
              <p className="project-hub-lead">
                As soon as projects are published through the catalog, this page will become the canonical browse
                surface for launch discovery, filtering, and comparison.
              </p>
              <div className="hero-actions">
                <a href="/map" className="button button-primary">
                  Open live map
                </a>
                <a href="/" className="button button-secondary">
                  Back to homepage
                </a>
              </div>
            </div>

            <article className="empty-card premium-surface project-hub-empty">
              <p className="section-label">No projects</p>
              <h3>No public projects are active yet.</h3>
              <p>Publish active projects in the catalog and this page will begin rendering the live project roster.</p>
            </article>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="project-hub-page">
      <section className="project-hub-hero">
        <div className="project-hub-layer project-hub-layer-one" />
        <div className="project-hub-layer project-hub-layer-two" />

        <div className="site-shell project-hub-hero-grid">
          <div className="project-hub-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Project hub
            </p>
            <h1>
              Explore
              <span className="hero-title-accent"> live public launches.</span>
            </h1>
            <p className="project-hub-lead">
              A project-first directory for scanning developer-backed launches, narrowing the portfolio with richer
              filters, and reviewing pricing and delivery context without staying trapped on the homepage.
            </p>

            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Open live map
              </a>
              <a href="/developers" className="button button-secondary">
                View developers
              </a>
              <a href="/" className="button button-ghost">
                Back to homepage
              </a>
            </div>
          </div>

          <aside className="developer-hub-spotlight premium-surface">
            <p className="section-label">Live launch snapshot</p>
            <h2>Search, filter, and compare the active public project roster.</h2>
            <div className="developer-hub-spotlight-grid">
              <article>
                <span>Active projects</span>
                <strong>{formatCompactNumber(normalizedProjects.length)}</strong>
              </article>
              <article>
                <span>Developers represented</span>
                <strong>{formatCompactNumber(visibleDeveloperCount)}</strong>
              </article>
              <article>
                <span>Regions covered</span>
                <strong>{formatCompactNumber(visibleRegionCount)}</strong>
              </article>
              <article>
                <span>Average entry</span>
                <strong>{averageEntryPrice ? formatCurrency(averageEntryPrice, filterCurrency) : "Awaiting inventory"}</strong>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="project-hub-tools-section">
        <div className="site-shell">
          <div className="project-hub-tools premium-surface">
            <label className="developer-hub-search-shell" htmlFor="project-hub-search">
              <span>Search projects</span>
              <input
                id="project-hub-search"
                className="developer-hub-search-input"
                type="search"
                value={searchQuery}
                placeholder="Project, headline, address, developer, or district"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>

            <div className="project-hub-toolbar-grid">
              <div className="project-filter-control-panel">
                <div className="project-filter-subgroup">
                  <div className="project-filter-control-copy">
                    <h3>Developer</h3>
                    <span>Focus the directory on one builder without leaving the route.</span>
                  </div>

                  <div className="developer-hub-segment-row developer-hub-segment-row-scroll">
                    <button
                      type="button"
                      className={`developer-hub-segment${companyFilter === "all" ? " developer-hub-segment-active" : ""}`}
                      aria-pressed={companyFilter === "all"}
                      onClick={() => {
                        setCompanyFilter("all");
                        setCurrentPage(1);
                      }}
                    >
                      All developers
                    </button>

                    {availableCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        className={`developer-hub-segment${companyFilter === String(company.id) ? " developer-hub-segment-active" : ""}`}
                        aria-pressed={companyFilter === String(company.id)}
                        onClick={() => {
                          setCompanyFilter(String(company.id));
                          setCurrentPage(1);
                        }}
                      >
                        {company.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="project-filter-subgroup">
                  <div className="project-filter-control-copy">
                    <h3>Region</h3>
                    <span>Use district and city context as a direct browse control.</span>
                  </div>

                  <div className="developer-hub-segment-row developer-hub-segment-row-scroll">
                    {availableRegions.map((region) => (
                      <button
                        key={region}
                        type="button"
                        className={`developer-hub-segment${regionFilter === region ? " developer-hub-segment-active" : ""}`}
                        aria-pressed={regionFilter === region}
                        onClick={() => {
                          setRegionFilter(region);
                          setCurrentPage(1);
                        }}
                      >
                        {region === "all" ? "All regions" : region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="project-filter-control-panel">
                <div className="project-filter-control-copy">
                  <h3>Price range</h3>
                  <span>
                    {formatCurrency(minimumPrice, filterCurrency)} to {formatCurrency(maximumPrice, filterCurrency)}
                  </span>
                </div>

                <div className="project-filter-range-stack">
                  <RangeControl
                    id="project-hub-min-price"
                    label="Minimum price"
                    min={resolvedPriceBounds.min}
                    max={resolvedPriceBounds.max}
                    step={PRICE_STEP}
                    value={minimumPrice}
                    valueLabel={formatCurrency(minimumPrice, filterCurrency)}
                    onChange={(value) => {
                      setMinimumPrice(Math.min(value, maximumPrice));
                      setCurrentPage(1);
                    }}
                  />

                  <RangeControl
                    id="project-hub-max-price"
                    label="Maximum price"
                    min={resolvedPriceBounds.min}
                    max={resolvedPriceBounds.max}
                    step={PRICE_STEP}
                    value={maximumPrice}
                    valueLabel={formatCurrency(maximumPrice, filterCurrency)}
                    onChange={(value) => {
                      setMaximumPrice(Math.max(value, minimumPrice));
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="project-filter-control-panel">
                <div className="project-filter-subgroup">
                  <div className="project-filter-control-copy">
                    <h3>Apartment rooms</h3>
                    <span>Room mix is matched live against public apartments inside each project.</span>
                  </div>

                  {availableRooms.length ? (
                    <div className="project-filter-room-list">
                      {availableRooms.map((roomCount) => (
                        <button
                          key={roomCount}
                          type="button"
                          className={`project-filter-pill${selectedRooms.includes(roomCount) ? " project-filter-pill-active" : ""}`}
                          onClick={() => {
                            setSelectedRooms((currentRooms) => toggleRoomSelection(currentRooms, roomCount));
                            setCurrentPage(1);
                          }}
                        >
                          {formatRooms(roomCount)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="project-filter-empty-note">
                      Room options will appear here when public apartments are available across the catalog.
                    </p>
                  )}
                </div>

                <div className="project-filter-subgroup">
                  <div className="project-filter-control-copy">
                    <h3>Delivery year</h3>
                    <span>{selectedYear ?? "Any published year"}</span>
                  </div>

                  {availableYears.length ? (
                    <div className="project-filter-year-list">
                      <button
                        type="button"
                        className={`project-filter-pill${selectedYear === null ? " project-filter-pill-active" : ""}`}
                        onClick={() => {
                          setSelectedYear(null);
                          setCurrentPage(1);
                        }}
                      >
                        All years
                      </button>

                      {availableYears.map((year) => (
                        <button
                          key={year}
                          type="button"
                          className={`project-filter-pill${selectedYear === year ? " project-filter-pill-active" : ""}`}
                          onClick={() => {
                            setSelectedYear(year);
                            setCurrentPage(1);
                          }}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="project-filter-empty-note">
                      Delivery years will appear here when the project catalog publishes a parsable year.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="project-filter-active-row">
              <div className="project-filter-active-copy">
                <p>Active filters</p>
                <span>{hasActiveFilters ? "Tap any chip to clear it." : "All live projects are currently visible."}</span>
              </div>

              <div className="project-filter-active-list">
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    className="project-filter-chip project-filter-chip-active"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                  >
                    Search: {searchQuery.trim()}
                  </button>
                ) : (
                  <span className="project-filter-chip project-filter-chip-static">Any project or address</span>
                )}

                {companyFilter !== "all" ? (
                  <button
                    type="button"
                    className="project-filter-chip project-filter-chip-active"
                    onClick={() => {
                      setCompanyFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    {availableCompanies.find((company) => String(company.id) === companyFilter)?.name ?? "Developer"}
                  </button>
                ) : (
                  <span className="project-filter-chip project-filter-chip-static">Any developer</span>
                )}

                {regionFilter !== "all" ? (
                  <button
                    type="button"
                    className="project-filter-chip project-filter-chip-active"
                    onClick={() => {
                      setRegionFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    {regionFilter}
                  </button>
                ) : (
                  <span className="project-filter-chip project-filter-chip-static">Any region</span>
                )}

                <button
                  type="button"
                  className="project-filter-chip"
                  onClick={() => {
                    setMinimumPrice(resolvedPriceBounds.min);
                    setCurrentPage(1);
                  }}
                  disabled={minimumPrice === resolvedPriceBounds.min}
                >
                  From {formatCurrency(minimumPrice, filterCurrency)}
                </button>

                <button
                  type="button"
                  className="project-filter-chip"
                  onClick={() => {
                    setMaximumPrice(resolvedPriceBounds.max);
                    setCurrentPage(1);
                  }}
                  disabled={maximumPrice === resolvedPriceBounds.max}
                >
                  Up to {formatCurrency(maximumPrice, filterCurrency)}
                </button>

                {selectedRooms.length ? (
                  selectedRooms.map((roomCount) => (
                    <button
                      key={roomCount}
                      type="button"
                      className="project-filter-chip project-filter-chip-active"
                      onClick={() => {
                        setSelectedRooms((currentRooms) => currentRooms.filter((value) => value !== roomCount));
                        setCurrentPage(1);
                      }}
                    >
                      {formatRooms(roomCount)}
                    </button>
                  ))
                ) : (
                  <span className="project-filter-chip project-filter-chip-static">Any room count</span>
                )}

                {selectedYear !== null ? (
                  <button
                    type="button"
                    className="project-filter-chip project-filter-chip-active"
                    onClick={() => {
                      setSelectedYear(null);
                      setCurrentPage(1);
                    }}
                  >
                    Delivery {selectedYear}
                  </button>
                ) : (
                  <span className="project-filter-chip project-filter-chip-static">Any delivery year</span>
                )}
              </div>

              <button type="button" className="project-filter-reset" onClick={resetFilters}>
                Reset filters
              </button>
            </div>

            <div className="project-filter-sort-row">
              <div className="project-filter-results-copy">
                <strong>{sortedProjects.length}</strong>
                <span>{sortedProjects.length === 1 ? "project matches" : "projects match"}</span>
              </div>

              <div className="project-filter-sort-list">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`project-sort-pill${sortMode === option.value ? " project-sort-pill-active" : ""}`}
                    onClick={() => {
                      setSortMode(option.value);
                      setCurrentPage(1);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="project-filter-status" aria-live="polite">
            <p className="project-filter-pagination-copy">
              {sortedProjects.length > 0
                ? `Showing ${pageStart}-${pageEnd} of ${sortedProjects.length} launches`
                : "No launches match the current filters."}
            </p>

            {isRoomLoading ? <p className="project-filter-feedback">Updating room matches...</p> : null}
          </div>

          {roomFilterError ? (
            <div className="project-filter-feedback project-filter-feedback-error" role="status">
              <span>{roomFilterError}</span>
              <button type="button" className="project-filter-reset" onClick={retryRoomFilter}>
                Try again
              </button>
            </div>
          ) : null}

          <div className="developer-hub-results-head">
            <div>
              <p className="section-label">Project roster</p>
              <h2 className="developer-hub-results-title">Compare launches without leaving the browse page.</h2>
            </div>

            {hasActiveFilters ? (
              <button type="button" className="developer-hub-reset" onClick={resetFilters}>
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="project-grid">
            {pageProjects.length ? (
              pageProjects.map((project) => (
                <article key={project.id} className="project-card premium-surface" aria-label={project.name}>
                  {project.hero_image_url ? (
                    <div className="project-media">
                      <img src={project.hero_image_url} alt={project.name} loading="lazy" />
                      <div className="project-media-overlay" />
                    </div>
                  ) : (
                    <div className="project-media project-media-placeholder">
                      <span>{project.name.slice(0, 1)}</span>
                    </div>
                  )}

                  <div className="project-card-body">
                    <div className="project-topline">
                      <span>{project.locationName}</span>
                      <span>{project.companyName}</span>
                    </div>

                    <h3>{project.name}</h3>
                    <p>{getProjectLead(project)}</p>

                    <div className="project-meta-grid">
                      <div>
                        <span>Starting from</span>
                        <strong>{formatCurrency(project.starting_price, project.currency)}</strong>
                      </div>
                      <div>
                        <span>Delivery</span>
                        <strong>{project.delivery_window || "Awaiting timeline"}</strong>
                      </div>
                      <div>
                        <span>Buildings</span>
                        <strong>{formatCompactNumber(project.building_count)}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <article className="empty-card premium-surface project-filter-empty">
                <p className="section-label">No matches</p>
                <h3>No projects match the current filter set.</h3>
                <p>Widen the price range, clear a room count, or open the filters back up to restore more launches.</p>
                <button type="button" className="project-filter-reset project-filter-reset-inline" onClick={resetFilters}>
                  Show all launches
                </button>
              </article>
            )}
          </div>

          {sortedProjects.length > PROJECTS_PAGE_SIZE ? (
            <div className="project-filter-pagination" aria-label="Project results pages">
              <div className="project-filter-pagination-controls">
                <button
                  type="button"
                  className="project-filter-page-button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPageSafe === 1}
                >
                  Previous
                </button>

                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      type="button"
                      className={`project-filter-page-button${currentPageSafe === item ? " project-filter-page-button-active" : ""}`}
                      aria-current={currentPageSafe === item ? "page" : undefined}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="project-filter-page-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  ),
                )}

                <button
                  type="button"
                  className="project-filter-page-button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPageSafe === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
