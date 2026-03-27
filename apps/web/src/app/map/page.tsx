import { HomeLiveMap } from '@/components/home/home-live-map';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicMapApartments } from '@/lib/api/public';

type LiveMapPageProps = {
  searchParams?: Promise<{
    locate?: string | string[];
  }>;
};

function hasLocateIntent(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.includes('1') || value.includes('true');
  }

  return value === '1' || value === 'true';
}

export default async function LiveMapPage({ searchParams }: LiveMapPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const mapApartments = await getPublicMapApartments({ suppressErrors: true });
  const autoLocate = hasLocateIntent(resolvedSearchParams?.locate);

  return (
    <main className="map-screen-page">
      <HomePrimaryNav ctaHref="/" ctaLabel="Back home" />

      <section className="map-screen-shell">
        <HomeLiveMap items={mapApartments.results} variant="fullscreen" autoLocate={autoLocate} />
      </section>
    </main>
  );
}
