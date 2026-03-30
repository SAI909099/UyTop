import { ApartmentComparisonMatrix, type ComparisonResidence } from '@/components/apartments/apartment-comparison-matrix';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicApartmentDetail, getPublicBuildings } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import type { PublicApartmentDetail, PublicBuildingSummary } from '@/types/home';

const MAX_COMPARE_ITEMS = 4;
const BUILDING_PAGE_SIZE = 100;

type ComparePageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ParsedCompareSlugs = {
  slugs: string[];
  duplicateCount: number;
  overflowCount: number;
};

type CompareStateProps = {
  locale: LocaleCode;
  eyebrow: string;
  title: string;
  description: string;
  notices: string[];
  singleResidence?: ComparisonResidence | null;
};

const compareCopy = {
  uz: {
    cta: 'Jonli xarita',
    setup: 'Taqqoslash sozlamasi',
    setupTitle: 'Taqqoslash uchun 2-4 ta kvartira slug qo‘shing.',
    setupCopy: 'Taqqoslash matritsasini ko‘rish uchun route ni `/compare?slugs=slug-a,slug-b` ko‘rinishida oching.',
    unavailable: 'Taqqoslash mavjud emas',
    unavailableTitle: 'Taqqoslash uchun kamida ikkita e’lon qilingan kvartira kerak.',
    unavailableCopy: 'Taqqoslash uchun yetarli jonli kvartiralar yuklanmadi. Yana slug qo‘shib qayta yuklang.',
    viewLoadedApartment: 'Yuklangan kvartirani ko‘rish',
    browseResidences: 'Uylarni ko‘rish',
    openLiveMap: 'Jonli xarita',
    backHome: 'Bosh sahifa',
  },
  en: {
    cta: 'Open live map',
    setup: 'Comparison setup',
    setupTitle: 'Add 2 to 4 apartment slugs to compare.',
    setupCopy: 'Open this route with a query like `/compare?slugs=slug-a,slug-b` to render a live side-by-side apartment matrix.',
    unavailable: 'Comparison unavailable',
    unavailableTitle: 'Need at least two published apartments to compare.',
    unavailableCopy: 'The route could not load enough live apartments to build a useful matrix. Add more valid public apartment slugs and reload the comparison.',
    viewLoadedApartment: 'View loaded apartment',
    browseResidences: 'Browse residences',
    openLiveMap: 'Open live map',
    backHome: 'Back to homepage',
  },
  ru: {
    cta: 'Открыть карту',
    setup: 'Настройка сравнения',
    setupTitle: 'Добавьте от 2 до 4 slug квартир для сравнения.',
    setupCopy: 'Откройте route вида `/compare?slugs=slug-a,slug-b`, чтобы показать живую матрицу сравнения.',
    unavailable: 'Сравнение недоступно',
    unavailableTitle: 'Для сравнения нужны минимум две опубликованные квартиры.',
    unavailableCopy: 'Не удалось загрузить достаточно живых квартир для полезной матрицы. Добавьте ещё slug и перезагрузите сравнение.',
    viewLoadedApartment: 'Открыть загруженную квартиру',
    browseResidences: 'Смотреть квартиры',
    openLiveMap: 'Открыть карту',
    backHome: 'На главную',
  },
} as const;

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function parseCompareSlugs(value: string | string[] | undefined): ParsedCompareSlugs {
  const rawSlugs = (Array.isArray(value) ? value : [value ?? ''])
    .flatMap((part) => part.split(','))
    .map((part) => part.trim())
    .filter(Boolean);

  const uniqueSlugs: string[] = [];
  const seen = new Set<string>();

  rawSlugs.forEach((slug) => {
    if (seen.has(slug)) {
      return;
    }

    seen.add(slug);
    uniqueSlugs.push(slug);
  });

  return {
    slugs: uniqueSlugs.slice(0, MAX_COMPARE_ITEMS),
    duplicateCount: rawSlugs.length - uniqueSlugs.length,
    overflowCount: Math.max(uniqueSlugs.length - MAX_COMPARE_ITEMS, 0),
  };
}

function getLocationLabel(apartment: PublicApartmentDetail) {
  return apartment.district ? `${apartment.district.name}, ${apartment.city.name}` : apartment.city.name;
}

function getHeroThumb(apartment: PublicApartmentDetail) {
  return apartment.primary_image || apartment.images[0]?.image_url || null;
}

function getAreaLabel(apartment: PublicApartmentDetail) {
  const areaValue = numeric(apartment.size_sqm);
  if (areaValue <= 0) {
    return 'Area pending';
  }
  return `${Number.isInteger(areaValue) ? areaValue.toFixed(0) : areaValue.toFixed(1)} sqm`;
}

function getPricePerSqm(apartment: PublicApartmentDetail) {
  const priceValue = numeric(apartment.price);
  const areaValue = numeric(apartment.size_sqm);
  if (priceValue <= 0 || areaValue <= 0) {
    return null;
  }
  return priceValue / areaValue;
}

function buildResidences(
  apartments: PublicApartmentDetail[],
  buildingLookup: Map<number, PublicBuildingSummary>,
): ComparisonResidence[] {
  return apartments.map((apartment) => ({
    apartment,
    heroThumb: getHeroThumb(apartment),
    locationLabel: getLocationLabel(apartment),
    handoverLabel: buildingLookup.get(apartment.building)?.handover?.trim() || 'Not published',
    pricePerSqm: getPricePerSqm(apartment),
    areaLabel: getAreaLabel(apartment),
    priceValue: numeric(apartment.price) > 0 ? numeric(apartment.price) : null,
  }));
}

function buildNotices(parsed: ParsedCompareSlugs, failedCount: number) {
  const notices: string[] = [];

  if (parsed.duplicateCount > 0) {
    notices.push(
      `${parsed.duplicateCount} duplicate apartment slug${parsed.duplicateCount === 1 ? '' : 's'} were removed from the comparison.`,
    );
  }

  if (parsed.overflowCount > 0) {
    notices.push(
      `${parsed.overflowCount} extra apartment${parsed.overflowCount === 1 ? '' : 's'} were ignored because the matrix supports up to 4 columns.`,
    );
  }

  if (failedCount > 0) {
    notices.push(
      `${failedCount} apartment${failedCount === 1 ? '' : 's'} could not be loaded from the live public catalog.`,
    );
  }

  return notices;
}

async function loadApartments(slugs: string[]) {
  const results = await Promise.allSettled(slugs.map((slug) => getPublicApartmentDetail(slug)));

  return {
    apartments: results
      .filter((result): result is PromiseFulfilledResult<PublicApartmentDetail> => result.status === 'fulfilled')
      .map((result) => result.value),
    failedCount: results.filter((result) => result.status === 'rejected').length,
  };
}

async function loadBuildingLookup(buildingIds: number[]) {
  const uniqueIds = [...new Set(buildingIds.filter((buildingId) => Number.isFinite(buildingId) && buildingId > 0))];
  const pendingIds = new Set(uniqueIds);
  const lookup = new Map<number, PublicBuildingSummary>();

  if (!pendingIds.size) {
    return lookup;
  }

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && pendingIds.size > 0) {
    let response;

    try {
      response = await getPublicBuildings({ page, pageSize: BUILDING_PAGE_SIZE });
    } catch {
      break;
    }

    totalPages = Math.max(1, Math.ceil(response.count / BUILDING_PAGE_SIZE));

    response.results.forEach((building) => {
      if (!pendingIds.has(building.id)) {
        return;
      }

      lookup.set(building.id, building);
      pendingIds.delete(building.id);
    });

    page += 1;
  }

  return lookup;
}

function CompareState({ locale, eyebrow, title, description, notices, singleResidence = null }: CompareStateProps) {
  const copy = compareCopy[locale];

  return (
    <main className="compare-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={copy.cta}
      />

      <section className="compare-state-section">
        <div className="site-shell">
          <article className="premium-surface compare-state-card">
            <p className="section-label">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>

            {notices.length ? (
              <div className="compare-state-notes">
                {notices.map((notice) => (
                  <span key={notice}>{notice}</span>
                ))}
              </div>
            ) : null}

            <div className="hero-actions">
              {singleResidence ? (
                <a href={buildLocalizedPath(locale, `/apartments/${singleResidence.apartment.slug}`)} className="button button-primary">
                  {copy.viewLoadedApartment}
                </a>
              ) : (
                <a href={buildLocalizedPath(locale, '/residences')} className="button button-primary">
                  {copy.browseResidences}
                </a>
              )}
              <a href={buildLocalizedPath(locale, '/map')} className="button button-secondary">
                {copy.openLiveMap}
              </a>
              <a href={buildLocalizedPath(locale, '/')} className="button button-ghost">
                {copy.backHome}
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const parsed = parseCompareSlugs(resolvedSearchParams.slugs);
  const copy = compareCopy[locale];

  if (parsed.slugs.length < 2) {
    return (
      <CompareState
        locale={locale}
        eyebrow={copy.setup}
        title={copy.setupTitle}
        description={copy.setupCopy}
        notices={buildNotices(parsed, 0)}
      />
    );
  }

  const { apartments, failedCount } = await loadApartments(parsed.slugs);
  const buildingLookup = await loadBuildingLookup(apartments.map((apartment) => apartment.building));
  const residences = buildResidences(apartments, buildingLookup);
  const notices = buildNotices(parsed, failedCount);

  if (residences.length < 2) {
    return (
      <CompareState
        locale={locale}
        eyebrow={copy.unavailable}
        title={copy.unavailableTitle}
        description={copy.unavailableCopy}
        notices={notices}
        singleResidence={residences[0] ?? null}
      />
    );
  }

  return (
    <main className="compare-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={copy.cta}
      />
      <ApartmentComparisonMatrix locale={locale} residences={residences} notices={notices} />
    </main>
  );
}
