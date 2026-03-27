'use client';

import { useMemo, useState } from 'react';

import { formatCurrency, formatLabel, formatRooms } from '@/lib/utils/format';
import type { PublicApartmentDetail } from '@/types/home';

export type ComparisonResidence = {
  apartment: PublicApartmentDetail;
  heroThumb: string | null;
  locationLabel: string;
  handoverLabel: string;
  pricePerSqm: number | null;
  areaLabel: string;
  priceValue: number | null;
};

type ApartmentComparisonMatrixProps = {
  residences: ComparisonResidence[];
  notices: string[];
};

type ComparisonSort = 'best_value' | 'lowest_price' | 'highest_price' | 'lowest_floor' | 'highest_floor';

type MatrixRow = {
  label: string;
  renderValue: (residence: ComparisonResidence) => string;
  emphasize?: boolean;
};

const SORT_OPTIONS: Array<{ id: ComparisonSort; label: string }> = [
  { id: 'best_value', label: 'Best value' },
  { id: 'lowest_price', label: 'Lowest price' },
  { id: 'highest_price', label: 'Highest price' },
  { id: 'lowest_floor', label: 'Lowest floor' },
  { id: 'highest_floor', label: 'Highest floor' },
];

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function compareNullableNumbers(left: number | null, right: number | null, direction: 'asc' | 'desc') {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return direction === 'asc' ? left - right : right - left;
}

function sortResidences(residences: ComparisonResidence[], sort: ComparisonSort) {
  return [...residences].sort((left, right) => {
    if (sort === 'best_value') {
      const bestValueDifference = compareNullableNumbers(left.pricePerSqm, right.pricePerSqm, 'asc');
      if (bestValueDifference !== 0) {
        return bestValueDifference;
      }
    }

    if (sort === 'lowest_price') {
      const priceDifference = compareNullableNumbers(left.priceValue, right.priceValue, 'asc');
      if (priceDifference !== 0) {
        return priceDifference;
      }
    }

    if (sort === 'highest_price') {
      const priceDifference = compareNullableNumbers(left.priceValue, right.priceValue, 'desc');
      if (priceDifference !== 0) {
        return priceDifference;
      }
    }

    if (sort === 'lowest_floor') {
      const floorDifference = left.apartment.floor - right.apartment.floor;
      if (floorDifference !== 0) {
        return floorDifference;
      }
    }

    if (sort === 'highest_floor') {
      const floorDifference = right.apartment.floor - left.apartment.floor;
      if (floorDifference !== 0) {
        return floorDifference;
      }
    }

    if (left.priceValue !== right.priceValue) {
      return compareNullableNumbers(left.priceValue, right.priceValue, 'asc');
    }

    return left.apartment.title.localeCompare(right.apartment.title);
  });
}

function getBestValueSlug(residences: ComparisonResidence[], hasMixedCurrencies: boolean) {
  if (hasMixedCurrencies) {
    return null;
  }

  const bestValue = residences.reduce<number | null>((winner, residence) => {
    if (!residence.pricePerSqm || residence.pricePerSqm <= 0) {
      return winner;
    }

    if (winner === null || residence.pricePerSqm < winner) {
      return residence.pricePerSqm;
    }

    return winner;
  }, null);

  if (bestValue === null) {
    return null;
  }

  return residences.find((residence) => residence.pricePerSqm === bestValue)?.apartment.slug ?? null;
}

function getPriceSpreadLabel(residences: ComparisonResidence[]) {
  const validPrices = residences
    .map((residence) => residence.priceValue)
    .filter((price): price is number => typeof price === 'number' && price > 0);

  if (validPrices.length < 2) {
    return 'Unavailable';
  }

  const spread = Math.max(...validPrices) - Math.min(...validPrices);
  return spread > 0 ? formatCurrency(spread, residences[0]?.apartment.currency) : 'Tight range';
}

const MATRIX_ROWS: MatrixRow[] = [
  {
    label: 'Price',
    renderValue: (residence) => formatCurrency(residence.apartment.price, residence.apartment.currency),
    emphasize: true,
  },
  {
    label: 'Price / sqm',
    renderValue: (residence) =>
      residence.pricePerSqm ? `${formatCurrency(residence.pricePerSqm, residence.apartment.currency)} / sqm` : 'Unavailable',
    emphasize: true,
  },
  {
    label: 'Delivery',
    renderValue: (residence) => residence.handoverLabel,
  },
  {
    label: 'Location',
    renderValue: (residence) => residence.locationLabel,
  },
  {
    label: 'Floor',
    renderValue: (residence) => String(residence.apartment.floor),
  },
  {
    label: 'Rooms',
    renderValue: (residence) => formatRooms(residence.apartment.rooms),
  },
  {
    label: 'Area',
    renderValue: (residence) => residence.areaLabel,
  },
  {
    label: 'Status',
    renderValue: (residence) => formatLabel(residence.apartment.status),
  },
];

export function ApartmentComparisonMatrix({ residences, notices }: ApartmentComparisonMatrixProps) {
  const [sort, setSort] = useState<ComparisonSort>('best_value');
  const sortedResidences = useMemo(() => sortResidences(residences, sort), [residences, sort]);
  const hasMixedCurrencies = new Set(sortedResidences.map((residence) => residence.apartment.currency)).size > 1;
  const bestValueSlug = useMemo(
    () => getBestValueSlug(sortedResidences, hasMixedCurrencies),
    [sortedResidences, hasMixedCurrencies],
  );
  const bestValueResidence = bestValueSlug
    ? sortedResidences.find((residence) => residence.apartment.slug === bestValueSlug) ?? null
    : null;
  const currentSortLabel = SORT_OPTIONS.find((option) => option.id === sort)?.label ?? 'Best value';
  const gridStyle = {
    gridTemplateColumns: `220px repeat(${sortedResidences.length}, minmax(248px, 1fr))`,
  };

  return (
    <>
      <section className="compare-matrix-hero">
        <div className="compare-matrix-layer compare-matrix-layer-one" />
        <div className="compare-matrix-layer compare-matrix-layer-two" />

        <div className="site-shell compare-matrix-hero-grid">
          <div className="compare-matrix-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Apartment comparison matrix
            </p>
            <h1>Compare your top picks with a cleaner, higher-signal side-by-side view.</h1>
            <p className="compare-matrix-lead">
              The matrix keeps price, value density, delivery timing, and floor context aligned in one premium screen,
              so users can make a choice without flipping between separate apartment detail pages.
            </p>

            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Open live map
              </a>
              <a href="/residences" className="button button-secondary">
                Browse residences
              </a>
              <a href="/" className="button button-ghost">
                Back to homepage
              </a>
            </div>
          </div>

          <article className="premium-surface compare-matrix-spotlight">
            <p className="section-label">Matrix snapshot</p>
            <div className="compare-matrix-spotlight-grid">
              <div>
                <span>Comparing</span>
                <strong>{sortedResidences.length} apartments</strong>
              </div>
              <div>
                <span>Best value</span>
                <strong>
                  {bestValueResidence && bestValueResidence.pricePerSqm
                    ? `${formatCurrency(bestValueResidence.pricePerSqm, bestValueResidence.apartment.currency)} / sqm`
                    : hasMixedCurrencies
                      ? 'Mixed currencies'
                      : 'Unavailable'}
                </strong>
              </div>
              <div>
                <span>Price spread</span>
                <strong>{hasMixedCurrencies ? 'Mixed currencies' : getPriceSpreadLabel(sortedResidences)}</strong>
              </div>
              <div>
                <span>Column order</span>
                <strong>{currentSortLabel}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="compare-matrix-section">
        <div className="site-shell">
          <div className="premium-surface compare-matrix-toolbar">
            <div className="compare-matrix-toolbar-head">
              <div>
                <p className="section-label">Column controls</p>
                <h2>Sort the columns without breaking the side-by-side read.</h2>
              </div>

              <div className="compare-matrix-sort-group" role="group" aria-label="Comparison sort">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`compare-matrix-sort-button ${sort === option.id ? 'is-active' : ''}`}
                    onClick={() => setSort(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="compare-matrix-note-list" aria-live="polite">
              {hasMixedCurrencies ? (
                <span className="compare-matrix-note">
                  Best-value highlighting is disabled because the compared apartments use mixed currencies.
                </span>
              ) : bestValueResidence ? (
                <span className="compare-matrix-note">
                  Gold highlighting marks the strongest price per sqm in the current comparison set.
                </span>
              ) : (
                <span className="compare-matrix-note">
                  Price-per-sqm highlighting will appear when each apartment has valid price and area data.
                </span>
              )}

              {notices.map((notice) => (
                <span key={notice} className="compare-matrix-note">
                  {notice}
                </span>
              ))}
            </div>
          </div>

          <article className="premium-surface compare-matrix-shell">
            <div className="compare-matrix-scroll">
              <div className="compare-matrix-grid" style={gridStyle}>
                <div className="compare-matrix-corner">
                  <span>Metrics</span>
                  <strong>Compare data points</strong>
                </div>

                {sortedResidences.map((residence, index) => {
                  const isBestValue = residence.apartment.slug === bestValueSlug;

                  return (
                    <article
                      key={residence.apartment.slug}
                      className={`compare-matrix-column-head ${isBestValue ? 'is-best-value' : ''}`}
                    >
                      <div className="compare-matrix-column-media">
                        {residence.heroThumb ? (
                          <img src={residence.heroThumb} alt={residence.apartment.title} />
                        ) : (
                          <div className="compare-matrix-column-placeholder">
                            {getInitials(residence.apartment.project_name || residence.apartment.title)}
                          </div>
                        )}
                      </div>

                      <div className="compare-matrix-column-copy">
                        <span>Residence {index + 1}</span>
                        <h3>{residence.apartment.title}</h3>
                        <p>
                          {residence.apartment.project_name} · {residence.apartment.building_name}
                        </p>
                      </div>

                      <div className="compare-matrix-column-tags">
                        <span>{residence.areaLabel}</span>
                        <span>{formatRooms(residence.apartment.rooms)}</span>
                        <span>{residence.locationLabel}</span>
                      </div>

                      <div className="compare-matrix-column-actions">
                        {isBestValue ? <span className="compare-matrix-best-pill">Best value / sqm</span> : null}
                        <a href={`/apartments/${residence.apartment.slug}`} className="button button-secondary">
                          View apartment
                        </a>
                      </div>
                    </article>
                  );
                })}

                {MATRIX_ROWS.map((row) => (
                  <FragmentRow
                    key={row.label}
                    row={row}
                    residences={sortedResidences}
                    bestValueSlug={bestValueSlug}
                  />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

type FragmentRowProps = {
  row: MatrixRow;
  residences: ComparisonResidence[];
  bestValueSlug: string | null;
};

function FragmentRow({ row, residences, bestValueSlug }: FragmentRowProps) {
  return (
    <>
      <div className="compare-matrix-row-label">
        <span>Data point</span>
        <strong>{row.label}</strong>
      </div>

      {residences.map((residence) => {
        const isBestValue = residence.apartment.slug === bestValueSlug;

        return (
          <div key={`${row.label}-${residence.apartment.slug}`} className={`compare-matrix-cell ${isBestValue ? 'is-best-value' : ''}`}>
            <span className={row.emphasize ? 'compare-matrix-cell-emphasis' : ''}>{row.renderValue(residence)}</span>
          </div>
        );
      })}
    </>
  );
}
