"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

import type { PublicCompany } from '@/types/home';

type DeveloperBrandRailProps = {
  companies: PublicCompany[];
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getCompanyNote(company: PublicCompany) {
  return company.trust_note || company.tagline || company.short_description || company.headquarters || 'Verified developer';
}

function DeveloperBrandRailCard({ company }: { company: PublicCompany }) {
  return (
    <article className="developer-brand-rail-item" aria-label={company.name}>
      <div className="developer-brand-rail-item-head">
        <span className={`developer-brand-rail-mark${company.logo_url ? ' developer-brand-rail-mark-logo' : ''}`}>
          {company.logo_url ? (
            <img src={company.logo_url} alt={`${company.name} logo`} loading="lazy" />
          ) : (
            initials(company.name)
          )}
        </span>

        <div className="developer-brand-rail-item-copy">
          <strong>{company.name}</strong>
          <span>{company.headquarters || 'Public developer profile'}</span>
        </div>
      </div>

      <p>{getCompanyNote(company)}</p>

      <div className="developer-brand-rail-meta">
        <span>{company.project_count} projects</span>
        <span>{company.apartment_count} apartments</span>
        <span>{company.is_verified ? 'Verified' : 'Public'}</span>
      </div>
    </article>
  );
}

export function DeveloperBrandRail({ companies }: DeveloperBrandRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateOverflow = () => {
      cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const viewportWidth = viewportRef.current?.clientWidth ?? 0;
        const contentWidth = measureRef.current?.scrollWidth ?? 0;

        setHasOverflow(viewportWidth > 0 && contentWidth > viewportWidth + 24);
      });
    };

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    if (measureRef.current) {
      observer.observe(measureRef.current);
    }

    window.addEventListener('resize', updateOverflow);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', updateOverflow);
    };
  }, [companies, prefersReducedMotion]);

  const isAnimated = hasOverflow && !prefersReducedMotion;

  const loopCompanies = useMemo(
    () => (isAnimated ? [...companies, ...companies] : companies),
    [companies, isAnimated],
  );

  return (
    <div className="developer-brand-rail-shell premium-surface">
      <div className="developer-brand-rail-copy">
        <p className="section-label">Live developer roster</p>
        <h3>Verified brands move through the homepage in one continuous lane.</h3>
        <span>Hover to pause on desktop. If the row fits, it stays centered instead of faking motion.</span>
      </div>

      <div className="developer-brand-rail-measure" ref={measureRef} aria-hidden="true">
        <div className="developer-brand-rail-track">
          {companies.map((company) => (
            <DeveloperBrandRailCard key={`measure-${company.id}`} company={company} />
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`developer-brand-rail-viewport${!hasOverflow ? ' developer-brand-rail-viewport-static' : ''}${hasOverflow && !isAnimated ? ' developer-brand-rail-viewport-scroll' : ''}`}
      >
        <div className={`developer-brand-rail-track${isAnimated ? ' developer-brand-rail-track-animated' : !hasOverflow ? ' developer-brand-rail-track-static' : ''}`}>
          {loopCompanies.map((company, index) => (
            <DeveloperBrandRailCard key={`${company.id}-${index}`} company={company} />
          ))}
        </div>
      </div>
    </div>
  );
}
