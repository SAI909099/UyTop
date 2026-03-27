import { HomeLiveMap } from '@/components/home/home-live-map';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicMapApartments } from '@/lib/api/public';

export default async function LiveMapPage() {
  const mapApartments = await getPublicMapApartments();

  return (
    <main className="map-screen-page">
      <HomePrimaryNav />

      <section className="map-screen-shell">
        <HomeLiveMap items={mapApartments.results} variant="fullscreen" />
      </section>
    </main>
  );
}
