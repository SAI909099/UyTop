"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

import { getPublicApartments, getPublicProjects } from '@/lib/api/public';
import { formatCurrency, formatRooms } from '@/lib/utils/format';
import type {
  ProjectPriceBounds,
  PublicApartmentSummary,
  PublicCompany,
  PublicProject,
  PublicProjectSort,
} from '@/types/home';

const PROJECTS_PAGE_SIZE = 20;
const SHOWCASE_APARTMENTS_COUNT = 3;
const PRICE_STEP = 25_000;
const ADDRESS_DEBOUNCE_MS = 280;

type ProjectFilterPanelProps = {
  projects: PublicProject[];
  companies: PublicCompany[];
  totalCount: number;
  deliveryYears: number[];
  priceBounds: ProjectPriceBounds;
  roomCounts: number[];
  apartments: PublicApartmentSummary[];
  apartmentCount: number;
};

type NormalizedProject = PublicProject & {
  companyName: string;
  locationName: string;
};

type NormalizedApartment = PublicApartmentSummary & {
  locationName: string;
  areaLabel: string;
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
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'delivery_asc', label: 'Earliest year' },
];

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
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
    return 'linear-gradient(90deg, #ddb84e 0%, #ddb84e 100%)';
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

export function ProjectFilterPanel({
  projects,
  companies,
  totalCount,
  deliveryYears,
  priceBounds,
  roomCounts,
  apartments,
  apartmentCount,
}: ProjectFilterPanelProps) {
  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company.name])), [companies]);
  const resolvedPriceBounds = useMemo(
    () => getResolvedPriceBounds(priceBounds, projects),
    [priceBounds.max, priceBounds.min, projects],
  );
  const availableYears = useMemo(() => {
    if (deliveryYears.length) {
      return [...new Set(deliveryYears)].sort((left, right) => left - right);
    }

    return Array.from(
      new Set(
        projects
          .map((project) => parseDeliveryYear(project.delivery_window))
          .filter((year): year is number => year !== null),
      ),
    ).sort((left, right) => left - right);
  }, [deliveryYears, projects]);
  const availableRooms = useMemo(
    () => [...new Set(roomCounts)].filter((roomCount) => roomCount > 0).sort((left, right) => left - right),
    [roomCounts],
  );

  const [addressQuery, setAddressQuery] = useState('');
  const [debouncedAddressQuery, setDebouncedAddressQuery] = useState('');
  const [minimumPrice, setMinimumPrice] = useState(resolvedPriceBounds.min);
  const [maximumPrice, setMaximumPrice] = useState(resolvedPriceBounds.max);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<PublicProjectSort>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageProjects, setPageProjects] = useState(projects);
  const [visibleProjectCount, setVisibleProjectCount] = useState(totalCount);
  const [showcaseApartments, setShowcaseApartments] = useState(apartments);
  const [showcaseApartmentCount, setShowcaseApartmentCount] = useState(apartmentCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowcaseLoading, setIsShowcaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showcaseError, setShowcaseError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const hasMountedProjectsRef = useRef(false);
  const hasMountedShowcaseRef = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedAddressQuery(addressQuery.trim());
    }, ADDRESS_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [addressQuery]);

  useEffect(() => {
    setAddressQuery('');
    setDebouncedAddressQuery('');
    setMinimumPrice(resolvedPriceBounds.min);
    setMaximumPrice(resolvedPriceBounds.max);
    setSelectedRooms([]);
    setSelectedYear(null);
    setSortMode('featured');
    setCurrentPage(1);
    setPageProjects(projects);
    setVisibleProjectCount(totalCount);
    setShowcaseApartments(apartments);
    setShowcaseApartmentCount(apartmentCount);
    setError(null);
    setShowcaseError(null);
    setIsLoading(false);
    setIsShowcaseLoading(false);
    hasMountedProjectsRef.current = false;
    hasMountedShowcaseRef.current = false;
  }, [apartmentCount, apartments, projects, resolvedPriceBounds.max, resolvedPriceBounds.min, totalCount]);

  const selectedRoomsKey = selectedRooms.join(',');

  useEffect(() => {
    if (!hasMountedProjectsRef.current) {
      hasMountedProjectsRef.current = true;
      return;
    }

    const controller = new AbortController();

    async function loadProjects() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getPublicProjects(
          {
            addressQuery: debouncedAddressQuery,
            minPrice: minimumPrice,
            maxPrice: maximumPrice,
            rooms: selectedRooms,
            deliveryYear: selectedYear,
            sort: sortMode,
            page: currentPage,
            pageSize: PROJECTS_PAGE_SIZE,
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) {
          return;
        }

        setPageProjects(response.results);
        setVisibleProjectCount(response.count);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(requestError);
        setError('Could not refresh the filtered launches right now.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      controller.abort();
    };
  }, [currentPage, debouncedAddressQuery, maximumPrice, minimumPrice, reloadKey, selectedRoomsKey, selectedYear, sortMode]);

  useEffect(() => {
    if (!hasMountedShowcaseRef.current) {
      hasMountedShowcaseRef.current = true;
      return;
    }

    const controller = new AbortController();

    async function loadApartments() {
      setIsShowcaseLoading(true);
      setShowcaseError(null);

      try {
        const response = await getPublicApartments(
          {
            addressQuery: debouncedAddressQuery,
            minPrice: minimumPrice,
            maxPrice: maximumPrice,
            rooms: selectedRooms,
            deliveryYear: selectedYear,
            pageSize: SHOWCASE_APARTMENTS_COUNT,
            random: true,
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) {
          return;
        }

        setShowcaseApartments(response.results);
        setShowcaseApartmentCount(response.count);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(requestError);
        setShowcaseError('Could not refresh the apartment showcase right now.');
      } finally {
        if (!controller.signal.aborted) {
          setIsShowcaseLoading(false);
        }
      }
    }

    void loadApartments();

    return () => {
      controller.abort();
    };
  }, [debouncedAddressQuery, maximumPrice, minimumPrice, reloadKey, selectedRoomsKey, selectedYear]);

  const normalizedProjects = useMemo<NormalizedProject[]>(
    () =>
      pageProjects.map((project) => ({
        ...project,
        companyName: companyMap.get(project.company) ?? 'Verified developer',
        locationName: project.district?.name ?? project.city.name,
      })),
    [companyMap, pageProjects],
  );

  const normalizedApartments = useMemo<NormalizedApartment[]>(
    () =>
      showcaseApartments.map((apartment) => ({
        ...apartment,
        locationName: apartment.district?.name ?? apartment.city.name,
        areaLabel: numeric(apartment.size_sqm) > 0 ? `${numeric(apartment.size_sqm).toFixed(0)} sqm` : 'Area pending',
      })),
    [showcaseApartments],
  );

  const addressFilterValue = addressQuery.trim();
  const hasProjectCatalog = projects.length > 0 || totalCount > 0;
  const hasActiveFilters =
    addressFilterValue.length > 0 ||
    minimumPrice > resolvedPriceBounds.min ||
    maximumPrice < resolvedPriceBounds.max ||
    selectedRooms.length > 0 ||
    selectedYear !== null;
  const totalPages = Math.max(1, Math.ceil(visibleProjectCount / PROJECTS_PAGE_SIZE));
  const pageStart = visibleProjectCount > 0 ? (currentPage - 1) * PROJECTS_PAGE_SIZE + 1 : 0;
  const pageEnd = visibleProjectCount > 0 ? Math.min(visibleProjectCount, pageStart + normalizedProjects.length - 1) : 0;
  const filterCurrency = pageProjects[0]?.currency ?? projects[0]?.currency ?? 'USD';
  const paginationItems = totalPages > 1 ? buildPagination(totalPages, currentPage) : [];

  function resetFilters() {
    setAddressQuery('');
    setDebouncedAddressQuery('');
    setMinimumPrice(resolvedPriceBounds.min);
    setMaximumPrice(resolvedPriceBounds.max);
    setSelectedRooms([]);
    setSelectedYear(null);
    setSortMode('featured');
    setCurrentPage(1);
    setError(null);
    setShowcaseError(null);
  }

  function retryFetch() {
    setReloadKey((value) => value + 1);
  }

  function getShowcaseHeading() {
    if (hasActiveFilters) {
      return {
        label: 'Matching residences',
        title: 'Apartments aligned with your live filters.',
        copy:
          showcaseApartmentCount > 0
            ? `Showing a random cut from ${showcaseApartmentCount} matching public apartments.`
            : 'No public apartments currently match the filter set above.',
      };
    }

    return {
      label: 'Fresh residences',
      title: 'A rotating apartment sample from the live catalog.',
      copy:
        showcaseApartmentCount > 0
          ? `Showing ${Math.min(showcaseApartmentCount, SHOWCASE_APARTMENTS_COUNT)} random apartments from the active public inventory.`
          : 'No public apartments are available to spotlight yet.',
    };
  }

  const showcaseHeading = getShowcaseHeading();

  return (
    <section className="project-filter-section" id="projects">
      <div className="site-shell project-filter-shell">
        <div className="project-filter-head">
          <p className="section-label">Project filters</p>
          <h2 className="section-title">Filter launches by address, price, room mix, and delivery pace.</h2>
          <p className="section-copy">
            Search a district or address, narrow the apartment mix you need, then page through the live project
            launches without leaving the homepage.
          </p>
        </div>

        {hasProjectCatalog ? (
          <>
            <div className="project-filter-controls premium-surface">
              <div className="project-filter-controls-grid">
                <div className="project-filter-control-panel">
                  <div className="project-filter-control-copy">
                    <h3>Address search</h3>
                    <span>Looks across project address, district, city, and launch naming.</span>
                  </div>

                  <label className="project-filter-search-shell" htmlFor="project-filter-address">
                    <span className="project-filter-search-label">Search location</span>
                    <input
                      id="project-filter-address"
                      className="project-filter-search-input"
                      type="search"
                      value={addressQuery}
                      placeholder="Street, district, city, or project"
                      onChange={(event) => {
                        setAddressQuery(event.target.value);
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    />
                  </label>

                  <p className="project-filter-empty-note">Examples: Yunusabad, Riverfront, Dream House, Sample address.</p>
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
                      id="project-filter-min-price"
                      label="Minimum price"
                      min={resolvedPriceBounds.min}
                      max={resolvedPriceBounds.max}
                      step={PRICE_STEP}
                      value={minimumPrice}
                      valueLabel={formatCurrency(minimumPrice, filterCurrency)}
                      onChange={(value) => {
                        setMinimumPrice(Math.min(value, maximumPrice));
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    />

                    <RangeControl
                      id="project-filter-max-price"
                      label="Maximum price"
                      min={resolvedPriceBounds.min}
                      max={resolvedPriceBounds.max}
                      step={PRICE_STEP}
                      value={maximumPrice}
                      valueLabel={formatCurrency(maximumPrice, filterCurrency)}
                      onChange={(value) => {
                        setMaximumPrice(Math.max(value, minimumPrice));
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    />
                  </div>
                </div>

                <div className="project-filter-control-panel">
                  <div className="project-filter-subgroup">
                    <div className="project-filter-control-copy">
                      <h3>Apartment rooms</h3>
                      <span>Select one or more room counts to keep only matching launches.</span>
                    </div>

                    {availableRooms.length ? (
                      <div className="project-filter-room-list">
                        {availableRooms.map((roomCount) => (
                          <button
                            key={roomCount}
                            type="button"
                            className={`project-filter-pill${selectedRooms.includes(roomCount) ? ' project-filter-pill-active' : ''}`}
                            onClick={() => {
                              setSelectedRooms((currentRooms) => toggleRoomSelection(currentRooms, roomCount));
                              setCurrentPage(1);
                              setError(null);
                              setShowcaseError(null);
                            }}
                          >
                            {formatRooms(roomCount)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="project-filter-empty-note">
                        Room options will appear here when public apartments are published in the live catalog.
                      </p>
                    )}
                  </div>

                  <div className="project-filter-subgroup">
                    <div className="project-filter-control-copy">
                      <h3>Delivery year</h3>
                      <span>{selectedYear ?? 'Any published year'}</span>
                    </div>

                    {availableYears.length ? (
                      <div className="project-filter-year-list">
                        <button
                          type="button"
                          className={`project-filter-pill${selectedYear === null ? ' project-filter-pill-active' : ''}`}
                          onClick={() => {
                            setSelectedYear(null);
                            setCurrentPage(1);
                            setError(null);
                            setShowcaseError(null);
                          }}
                        >
                          All years
                        </button>

                        {availableYears.map((year) => (
                          <button
                            key={year}
                            type="button"
                            className={`project-filter-pill${selectedYear === year ? ' project-filter-pill-active' : ''}`}
                            onClick={() => {
                              setSelectedYear(year);
                              setCurrentPage(1);
                              setError(null);
                              setShowcaseError(null);
                            }}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="project-filter-empty-note">
                        Delivery years will appear here when projects publish a parsable year in the delivery field.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="project-filter-active-row">
                <div className="project-filter-active-copy">
                  <p>Active filters</p>
                  <span>{hasActiveFilters ? 'Tap any chip to clear it.' : 'All launches are currently visible.'}</span>
                </div>

                <div className="project-filter-active-list">
                  {addressFilterValue ? (
                    <button
                      type="button"
                      className="project-filter-chip project-filter-chip-active"
                      onClick={() => {
                        setAddressQuery('');
                        setDebouncedAddressQuery('');
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    >
                      Address: {addressFilterValue}
                    </button>
                  ) : (
                    <span className="project-filter-chip project-filter-chip-static">Any address</span>
                  )}

                  <button
                    type="button"
                    className="project-filter-chip"
                    onClick={() => {
                      setMinimumPrice(resolvedPriceBounds.min);
                      setCurrentPage(1);
                      setError(null);
                      setShowcaseError(null);
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
                      setError(null);
                      setShowcaseError(null);
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
                          setError(null);
                          setShowcaseError(null);
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
                        setError(null);
                        setShowcaseError(null);
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
                  <strong>{visibleProjectCount}</strong>
                  <span>{visibleProjectCount === 1 ? 'project matches' : 'projects match'}</span>
                </div>

                <div className="project-filter-sort-list">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`project-sort-pill${sortMode === option.value ? ' project-sort-pill-active' : ''}`}
                      onClick={() => {
                        setSortMode(option.value);
                        setCurrentPage(1);
                        setError(null);
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
                {visibleProjectCount > 0
                  ? `Showing ${pageStart}-${pageEnd} of ${visibleProjectCount} launches`
                  : 'No launches match the current filters.'}
              </p>

              {isLoading ? <p className="project-filter-feedback">Updating results...</p> : null}
            </div>

            {error ? (
              <div className="project-filter-feedback project-filter-feedback-error" role="status">
                <span>{error}</span>
                <button type="button" className="project-filter-reset" onClick={retryFetch}>
                  Try again
                </button>
              </div>
            ) : null}

            <div className="project-grid project-filter-grid">
              {normalizedProjects.length ? (
                normalizedProjects.map((project) => (
                  <article key={project.id} className="project-card premium-surface">
                    {project.hero_image_url ? (
                      <div className="project-media">
                        <img src={project.hero_image_url} alt={project.name} />
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
                      <p>{project.headline}</p>
                      <div className="project-meta-grid">
                        <div>
                          <span>Starting from</span>
                          <strong>{formatCurrency(project.starting_price, project.currency)}</strong>
                        </div>
                        <div>
                          <span>Address</span>
                          <strong>{project.address || project.location_label || project.locationName}</strong>
                        </div>
                        <div>
                          <span>Delivery</span>
                          <strong>{project.delivery_window || 'Awaiting timeline'}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card premium-surface project-filter-empty">
                  <p className="section-label">No matches</p>
                  <h3>No projects match the current filter set.</h3>
                  <p>Try widening the price range, removing a room count, or searching a broader address or district.</p>
                  <button type="button" className="project-filter-reset project-filter-reset-inline" onClick={resetFilters}>
                    Show all launches
                  </button>
                </article>
              )}
            </div>

            {visibleProjectCount > PROJECTS_PAGE_SIZE ? (
              <div className="project-filter-pagination" aria-label="Project results pages">
                <div className="project-filter-pagination-controls">
                  <button
                    type="button"
                    className="project-filter-page-button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === 'number' ? (
                      <button
                        key={item}
                        type="button"
                        className={`project-filter-page-button${currentPage === item ? ' project-filter-page-button-active' : ''}`}
                        aria-current={currentPage === item ? 'page' : undefined}
                        onClick={() => setCurrentPage(item)}
                        disabled={isLoading}
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
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            <div className="apartment-showcase-shell premium-surface" id="residences">
              <div className="apartment-showcase-head">
                <div className="apartment-showcase-copy">
                  <p className="section-label">{showcaseHeading.label}</p>
                  <h3>{showcaseHeading.title}</h3>
                  <span>{showcaseHeading.copy}</span>
                </div>

                {isShowcaseLoading ? <p className="project-filter-feedback">Refreshing apartments...</p> : null}
              </div>

              {showcaseError ? (
                <div className="project-filter-feedback project-filter-feedback-error" role="status">
                  <span>{showcaseError}</span>
                  <button type="button" className="project-filter-reset" onClick={retryFetch}>
                    Try again
                  </button>
                </div>
              ) : null}

              <div className="apartment-showcase-grid">
                {normalizedApartments.length ? (
                  normalizedApartments.map((apartment) => (
                    <article key={apartment.id} className="apartment-showcase-card premium-surface">
                      {apartment.primary_image ? (
                        <div className="apartment-showcase-media">
                          <img src={apartment.primary_image} alt={apartment.title} />
                          <div className="project-media-overlay" />
                        </div>
                      ) : (
                        <div className="apartment-showcase-media apartment-showcase-media-placeholder">
                          <span>{apartment.project_name.slice(0, 1)}</span>
                        </div>
                      )}

                      <div className="apartment-showcase-body">
                        <div className="apartment-showcase-topline">
                          <span>{apartment.locationName}</span>
                          <span>{apartment.company_name}</span>
                        </div>
                        <h3>{formatCurrency(apartment.price, apartment.currency)}</h3>
                        <strong>{apartment.title}</strong>
                        <p>{apartment.address}</p>
                        <div className="apartment-showcase-meta">
                          <span>{formatRooms(apartment.rooms)}</span>
                          <span>{apartment.areaLabel}</span>
                          <span>{apartment.project_name}</span>
                        </div>

                        <a href={`/apartments/${apartment.slug}`} className="apartment-showcase-link">
                          View residence
                        </a>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="empty-card premium-surface apartment-showcase-empty">
                    <p className="section-label">{hasActiveFilters ? 'No apartments match' : 'No live apartments'}</p>
                    <h3>{hasActiveFilters ? 'No apartments match these filters yet.' : 'No public apartments are available yet.'}</h3>
                    <p>
                      {hasActiveFilters
                        ? 'Clear or relax the filters above to bring matching apartments back into view.'
                        : 'Publish public apartments in the catalog and this section will begin showing random live homes.'}
                    </p>
                    {hasActiveFilters ? (
                      <button type="button" className="project-filter-reset project-filter-reset-inline" onClick={resetFilters}>
                        Clear filters
                      </button>
                    ) : null}
                  </article>
                )}
              </div>
            </div>
          </>
        ) : (
          <article className="empty-card premium-surface">
            <p className="section-label">Projects</p>
            <h3>No public projects are active yet.</h3>
            <p>As soon as catalog projects are published in the backend, this section will populate automatically.</p>
          </article>
        )}
      </div>
    </section>
  );
}
