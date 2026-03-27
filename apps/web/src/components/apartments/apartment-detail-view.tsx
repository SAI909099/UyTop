import { ApartmentLocationMap } from '@/components/apartments/apartment-location-map';
import { formatCurrency, formatLabel, formatRooms } from '@/lib/utils/format';
import type { PublicApartmentDetail } from '@/types/home';

type ApartmentDetailViewProps = {
  apartment: PublicApartmentDetail;
};

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function getLocationLabel(apartment: PublicApartmentDetail) {
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

function getGalleryImages(apartment: PublicApartmentDetail) {
  const sources = [
    apartment.primary_image,
    ...apartment.images
      .sort((left, right) => Number(right.is_primary) - Number(left.is_primary) || left.sort_order - right.sort_order)
      .map((image) => image.image_url),
  ];

  return sources.filter((value, index, items): value is string => Boolean(value?.trim()) && items.indexOf(value) === index);
}

export function ApartmentDetailView({ apartment }: ApartmentDetailViewProps) {
  const locationLabel = getLocationLabel(apartment);
  const galleryImages = getGalleryImages(apartment);
  const leadImage = galleryImages[0] ?? null;
  const statusLabel = formatLabel(apartment.status);
  const sizeValue = numeric(apartment.size_sqm);
  const sizeLabel = sizeValue > 0 ? `${sizeValue.toFixed(0)} sqm` : 'Area pending';
  const latitude = Number(apartment.latitude);
  const longitude = Number(apartment.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const description =
    apartment.description.trim() ||
    `${apartment.title} is part of ${apartment.project_name} and keeps the project, building, and location context visible in one quiet-luxury detail view.`;
  const snapshotItems = [
    { label: 'Price', value: formatCurrency(apartment.price, apartment.currency) },
    { label: 'Status', value: statusLabel },
    { label: 'Rooms', value: formatRooms(apartment.rooms) },
    { label: 'Area', value: sizeLabel },
    { label: 'Floor', value: Number.isFinite(apartment.floor) ? String(apartment.floor) : 'Pending' },
    { label: 'District', value: apartment.district?.name ?? apartment.city.name },
  ];

  return (
    <>
      <section className="apartment-detail-hero">
        <div className="apartment-detail-hero-layer apartment-detail-hero-layer-one" />
        <div className="apartment-detail-hero-layer apartment-detail-hero-layer-two" />
        <div className="site-shell apartment-detail-hero-grid">
          <div className="apartment-detail-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Apartment detail
            </p>

            <div className="apartment-detail-breadcrumbs" aria-label="Residence context">
              <span>{apartment.company_name}</span>
              <span>{apartment.project_name}</span>
              <span>{apartment.building_name}</span>
            </div>

            <div className="apartment-detail-title-stack">
              <h1>{apartment.title}</h1>
              <div className="apartment-detail-price-pill">{formatCurrency(apartment.price, apartment.currency)}</div>
            </div>

            <p className="apartment-detail-lead">
              {apartment.title} sits in {locationLabel}, inside {apartment.project_name}, and keeps verified
              residential context visible beside the imagery instead of burying it below the fold.
            </p>

            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Open live map
              </a>
              <a href="/residences" className="button button-secondary">
                More residences
              </a>
              <a href="/" className="button button-ghost">
                Back to homepage
              </a>
            </div>

            <div className="apartment-detail-tag-row">
              <span>{statusLabel}</span>
              <span>{locationLabel}</span>
              <span>{apartment.apartment_number}</span>
              <span>{apartment.building_code}</span>
            </div>
          </div>

          <article className="apartment-detail-gallery premium-surface">
            <div className="apartment-detail-gallery-lead">
              {leadImage ? (
                <img src={leadImage} alt={apartment.title} />
              ) : (
                <div className="apartment-detail-gallery-placeholder">{getInitials(apartment.project_name || apartment.title)}</div>
              )}

              <div className="apartment-detail-gallery-overlay" />
              <div className="apartment-detail-gallery-topline">
                <p className="section-label">Quiet luxury residence</p>
                <span>{statusLabel}</span>
              </div>
              <div className="apartment-detail-gallery-caption">
                <strong>{apartment.project_name}</strong>
                <span>
                  {apartment.building_name} · {locationLabel}
                </span>
              </div>
            </div>

            {galleryImages.length > 1 ? (
              <div className="apartment-detail-gallery-strip">
                {galleryImages.slice(1, 5).map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="apartment-detail-gallery-thumb">
                    <img src={imageUrl} alt={`${apartment.title} view ${index + 2}`} />
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="apartment-detail-snapshot-strip">
        <div className="site-shell apartment-detail-snapshot-grid">
          {snapshotItems.map((item) => (
            <article key={item.label} className="apartment-detail-snapshot-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="apartment-detail-content-section">
        <div className="site-shell apartment-detail-content-grid">
          <article className="premium-surface apartment-detail-story-card">
            <p className="section-label">Residence overview</p>
            <h2 className="apartment-detail-section-title">Every core apartment signal stays readable beside the visuals.</h2>
            <p className="section-copy">{description}</p>

            <div className="apartment-detail-identity-grid">
              <div>
                <span>Apartment number</span>
                <strong>{apartment.apartment_number}</strong>
              </div>
              <div>
                <span>Building</span>
                <strong>{apartment.building_name}</strong>
              </div>
              <div>
                <span>Building code</span>
                <strong>{apartment.building_code}</strong>
              </div>
              <div>
                <span>Developer</span>
                <strong>{apartment.company_name}</strong>
              </div>
              <div>
                <span>Project</span>
                <strong>{apartment.project_name}</strong>
              </div>
              <div>
                <span>Address</span>
                <strong>{apartment.address}</strong>
              </div>
            </div>
          </article>

          <article className="premium-surface apartment-detail-payment-card">
            <p className="section-label">Payment options</p>
            <h2 className="apartment-detail-section-title">Ways to structure the purchase.</h2>
            <p className="section-copy">
              Financing notes come directly from the published catalog record, so the public page reflects the live
              apartment configuration rather than placeholder marketing copy.
            </p>

            {apartment.payment_options.length ? (
              <div className="apartment-detail-payment-grid">
                {apartment.payment_options.map((option) => (
                  <article key={`${option.payment_type}-${option.notes}`} className="apartment-detail-payment-item">
                    <strong>{formatLabel(option.payment_type)}</strong>
                    <p>{option.notes.trim() || 'Details for this payment path will be confirmed with the developer.'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="apartment-detail-empty-state">
                <h3>No payment paths have been published yet.</h3>
                <p>The residence stays visible, but financing labels will appear here once the catalog data is updated.</p>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="apartment-detail-location-section">
        <div className="site-shell apartment-detail-location-grid">
          <article className="premium-surface apartment-detail-location-copy">
            <p className="section-label">Location and address</p>
            <h2 className="apartment-detail-section-title">Map-first context remains part of the detail page.</h2>
            <p className="section-copy">
              {apartment.address} in {locationLabel}. The detail route keeps the address, project, and building identity
              visible next to the map instead of sending users back into search to rebuild context.
            </p>

            <div className="apartment-detail-location-meta">
              <div>
                <span>City</span>
                <strong>{apartment.city.name}</strong>
              </div>
              <div>
                <span>District</span>
                <strong>{apartment.district?.name ?? 'Not specified'}</strong>
              </div>
              <div>
                <span>Coordinates</span>
                <strong>
                  {hasCoordinates ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Location pin unavailable'}
                </strong>
              </div>
            </div>
          </article>

          <article className="premium-surface apartment-detail-map-card">
            {hasCoordinates ? (
              <ApartmentLocationMap
                latitude={latitude}
                longitude={longitude}
                title={apartment.title}
                locationLabel={locationLabel}
              />
            ) : (
              <div className="apartment-location-map-fallback">
                <p>Map coordinates are not published for this residence yet.</p>
                <span>{locationLabel}</span>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="cta-section apartment-detail-cta-section">
        <div className="site-shell cta-shell premium-surface">
          <p className="section-label">Continue browsing</p>
          <h2 className="section-title">Return to discovery without losing the premium detail treatment.</h2>
          <p className="section-copy">
            Jump back into the live map, revisit the homepage residences, or keep this route as the shareable detail
            page for a single apartment.
          </p>
          <div className="cta-actions">
            <a href="/map" className="button button-primary">
              Back to live map
            </a>
            <a href="/residences" className="button button-secondary">
              Browse more residences
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
