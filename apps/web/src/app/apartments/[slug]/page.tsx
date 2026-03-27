import { ApartmentDetailView } from '@/components/apartments/apartment-detail-view';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicApartmentDetail } from '@/lib/api/public';
import type { PublicApartmentDetail } from '@/types/home';

type ApartmentDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function loadApartment(slug: string): Promise<PublicApartmentDetail | null> {
  try {
    return await getPublicApartmentDetail(slug);
  } catch {
    return null;
  }
}

function ApartmentDetailState() {
  return (
    <main className="apartment-detail-page-shell">
      <HomePrimaryNav ctaHref="/map" ctaLabel="Open live map" />

      <section className="apartment-detail-state-section">
        <div className="site-shell">
          <article className="premium-surface apartment-detail-state-card">
            <p className="section-label">Residence unavailable</p>
            <h1>The apartment detail could not be loaded.</h1>
            <p>
              The residence may be unpublished, the slug may be incorrect, or the public catalog request may have
              failed. The route stays stable and keeps the user inside the public web experience instead of crashing.
            </p>
            <div className="hero-actions">
              <a href="/map" className="button button-primary">
                Back to live map
              </a>
              <a href="/residences" className="button button-secondary">
                Browse residences
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default async function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { slug } = await params;
  const apartment = await loadApartment(slug);

  if (!apartment) {
    return <ApartmentDetailState />;
  }

  return (
    <main className="apartment-detail-page-shell">
      <HomePrimaryNav ctaHref="/map" ctaLabel="Open live map" />
      <ApartmentDetailView apartment={apartment} />
    </main>
  );
}
