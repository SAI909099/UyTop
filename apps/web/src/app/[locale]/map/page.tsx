import { MapExplorer } from '@/components/home/map-explorer';
import { getPublicMapApartments } from '@/lib/api/public';
import type { LocaleCode } from '@/lib/i18n';

type LiveMapPageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
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

export default async function LiveMapPage({ params, searchParams }: LiveMapPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const mapApartments = await getPublicMapApartments({ suppressErrors: true });
  const autoLocate = hasLocateIntent(resolvedSearchParams?.locate);

  return (
    <main className="map-explorer-page">
      <MapExplorer items={mapApartments.results} locale={locale} autoLocate={autoLocate} />
    </main>
  );
}
