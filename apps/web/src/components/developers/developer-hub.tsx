"use client";

import { useDeferredValue, useState } from 'react';

import { formatCompactNumber } from '@/lib/utils/format';
import type { DeveloperHubCompany } from '@/types/home';

type DeveloperHubProps = {
  companies: DeveloperHubCompany[];
};

type ExperienceFilter = 'all' | '10_plus' | '5_to_9' | 'under_5';
type PortfolioFilter = 'all' | '10_plus' | '5_to_9' | '1_to_4';

const experienceOptions: Array<{ value: ExperienceFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: '10_plus', label: '10+ Years' },
  { value: '5_to_9', label: '5-9 Years' },
  { value: 'under_5', label: 'Under 5' },
];

const portfolioOptions: Array<{ value: PortfolioFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: '10_plus', label: '10+ Projects' },
  { value: '5_to_9', label: '5-9 Projects' },
  { value: '1_to_4', label: '1-4 Projects' },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getRegion(company: DeveloperHubCompany) {
  return company.headquarters.trim();
}

function getCompanyNote(company: DeveloperHubCompany) {
  return company.trust_note || company.tagline || company.short_description || 'Verified developer profile';
}

function getExperienceLabel(company: DeveloperHubCompany) {
  if (!company.experience_years || company.experience_years < 1) {
    return 'Experience pending';
  }

  return `${company.experience_years}+ years`;
}

function matchesExperienceFilter(company: DeveloperHubCompany, filter: ExperienceFilter) {
  if (filter === 'all') {
    return true;
  }

  const years = company.experience_years;
  if (!years || years < 1) {
    return false;
  }

  if (filter === '10_plus') {
    return years >= 10;
  }

  if (filter === '5_to_9') {
    return years >= 5 && years <= 9;
  }

  return years < 5;
}

function matchesPortfolioFilter(company: DeveloperHubCompany, filter: PortfolioFilter) {
  if (filter === 'all') {
    return true;
  }

  if (filter === '10_plus') {
    return company.project_count >= 10;
  }

  if (filter === '5_to_9') {
    return company.project_count >= 5 && company.project_count <= 9;
  }

  return company.project_count >= 1 && company.project_count <= 4;
}

function DeveloperHubCard({ company }: { company: DeveloperHubCompany }) {
  const region = getRegion(company) || 'Region pending';

  return (
    <article className="developer-hub-card premium-surface" aria-label={company.name}>
      <div className="developer-hub-card-topline">
        <span className={`developer-hub-card-mark${company.logo_url ? ' developer-hub-card-mark-logo' : ''}`}>
          {company.logo_url ? <img src={company.logo_url} alt={`${company.name} logo`} loading="lazy" /> : initials(company.name)}
        </span>

        <div className="developer-hub-card-head">
          <div>
            <strong>{company.name}</strong>
            <span>{region}</span>
          </div>
          <span className={`developer-hub-card-badge${company.is_verified ? ' developer-hub-card-badge-verified' : ''}`}>
            {company.is_verified ? 'Verified' : 'Public'}
          </span>
        </div>
      </div>

      <p className="developer-hub-card-note">{getCompanyNote(company)}</p>

      <div className="developer-hub-card-meta">
        <div>
          <span>Experience</span>
          <strong>{getExperienceLabel(company)}</strong>
        </div>
        <div>
          <span>Projects</span>
          <strong>{formatCompactNumber(company.project_count)}</strong>
        </div>
        <div>
          <span>Live apartments</span>
          <strong>{formatCompactNumber(company.apartment_count)}</strong>
        </div>
      </div>
    </article>
  );
}

export function DeveloperHub({ companies }: DeveloperHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioFilter>('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const regionOptions = ['all', ...new Set(companies.map(getRegion).filter(Boolean))];
  const verifiedCount = companies.filter((company) => company.is_verified).length;
  const representedRegions = new Set(companies.map(getRegion).filter(Boolean)).size;
  const totalPortfolioCount = companies.reduce((sum, company) => sum + company.project_count, 0);
  const visibleCompanies = companies.filter((company) => {
    const region = getRegion(company);
    const searchTarget = [company.name, company.tagline, company.short_description, company.headquarters]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !deferredSearchQuery || searchTarget.includes(deferredSearchQuery);
    const matchesRegion = regionFilter === 'all' || region === regionFilter;

    return (
      matchesSearch &&
      matchesRegion &&
      matchesExperienceFilter(company, experienceFilter) &&
      matchesPortfolioFilter(company, portfolioFilter)
    );
  });

  const hasActiveFilters =
    searchQuery.trim().length > 0 || experienceFilter !== 'all' || portfolioFilter !== 'all' || regionFilter !== 'all';

  function resetFilters() {
    setSearchQuery('');
    setExperienceFilter('all');
    setPortfolioFilter('all');
    setRegionFilter('all');
  }

  return (
    <main className="developer-hub-page">
      <section className="developer-hub-hero">
        <div className="developer-hub-layer developer-hub-layer-one" />
        <div className="developer-hub-layer developer-hub-layer-two" />

        <div className="site-shell developer-hub-hero-grid">
          <div className="developer-hub-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Developer hub
            </p>
            <h1>
              Our
              <span className="hero-title-accent"> Developer Partners.</span>
            </h1>
            <p className="developer-hub-lead">
              A premium directory for comparing verified builders, scanning trust signals, and narrowing the active
              public roster with search and segmented portfolio filters.
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

          <aside className="developer-hub-spotlight premium-surface">
            <p className="section-label">Live roster snapshot</p>
            <h2>Professional, expensive, and built for direct comparison.</h2>
            <div className="developer-hub-spotlight-grid">
              <article>
                <span>Active developers</span>
                <strong>{formatCompactNumber(companies.length)}</strong>
              </article>
              <article>
                <span>Verified brands</span>
                <strong>{formatCompactNumber(verifiedCount)}</strong>
              </article>
              <article>
                <span>Regions represented</span>
                <strong>{formatCompactNumber(representedRegions)}</strong>
              </article>
              <article>
                <span>Published portfolio</span>
                <strong>{formatCompactNumber(totalPortfolioCount)}</strong>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="developer-hub-tools-section">
        <div className="site-shell">
          <div className="developer-hub-tools premium-surface">
            <label className="developer-hub-search-shell" htmlFor="developer-hub-search">
              <span>Search developers</span>
              <input
                id="developer-hub-search"
                className="developer-hub-search-input"
                type="search"
                value={searchQuery}
                placeholder="Developer, tagline, note, or region"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="developer-hub-filter-grid">
              <div className="developer-hub-filter-group">
                <span className="developer-hub-filter-label">Experience</span>
                <div className="developer-hub-segment-row">
                  {experienceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`developer-hub-segment${experienceFilter === option.value ? ' developer-hub-segment-active' : ''}`}
                      aria-pressed={experienceFilter === option.value}
                      onClick={() => setExperienceFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="developer-hub-filter-group">
                <span className="developer-hub-filter-label">Region</span>
                <div className="developer-hub-segment-row developer-hub-segment-row-scroll">
                  {regionOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`developer-hub-segment${regionFilter === option ? ' developer-hub-segment-active' : ''}`}
                      aria-pressed={regionFilter === option}
                      onClick={() => setRegionFilter(option)}
                    >
                      {option === 'all' ? 'All' : option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="developer-hub-filter-group">
                <span className="developer-hub-filter-label">Portfolio</span>
                <div className="developer-hub-segment-row">
                  {portfolioOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`developer-hub-segment${portfolioFilter === option.value ? ' developer-hub-segment-active' : ''}`}
                      aria-pressed={portfolioFilter === option.value}
                      onClick={() => setPortfolioFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="developer-hub-results-head">
            <div>
              <p className="section-label">Developer directory</p>
              <h2 className="developer-hub-results-title">
                {visibleCompanies.length} {visibleCompanies.length === 1 ? 'builder matches' : 'builders match'}
              </h2>
              <p className="developer-hub-results-copy">
                Portfolio uses the currently published project count from the live public catalog. It is not a
                completed-project claim.
              </p>
            </div>

            {hasActiveFilters ? (
              <button type="button" className="developer-hub-reset" onClick={resetFilters}>
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="developer-hub-grid">
            {visibleCompanies.length ? (
              visibleCompanies.map((company) => <DeveloperHubCard key={company.id} company={company} />)
            ) : (
              <article className="empty-card premium-surface developer-hub-empty">
                <p className="section-label">No matches</p>
                <h3>No developers match the current search and filters.</h3>
                <p>Try widening the region or portfolio buckets, or clear the search to bring the full roster back.</p>
                {hasActiveFilters ? (
                  <button type="button" className="developer-hub-reset developer-hub-reset-inline" onClick={resetFilters}>
                    Reset directory
                  </button>
                ) : null}
              </article>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
