import { ResidencesHub } from '@/components/apartments/residences-hub';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicApartments } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import type { PaginatedResponse, PublicApartmentSort, PublicApartmentSummary } from '@/types/home';

const PAGE_SIZE = 12;
const DEFAULT_SORT: PublicApartmentSort = 'newest';
const VALID_SORTS: PublicApartmentSort[] = ['newest', 'price_asc', 'price_desc'];

type ResidencesPageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ctaLabels: Record<LocaleCode, string> = {
  uz: 'Jonli xarita',
  en: 'Open live map',
  ru: 'Открыть карту',
};

type DirectoryParams = {
  q: string;
  sort: PublicApartmentSort;
  page: number;
};

function emptyResponse(): PaginatedResponse<PublicApartmentSummary> {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function parseSort(value: string): PublicApartmentSort {
  return VALID_SORTS.includes(value as PublicApartmentSort) ? (value as PublicApartmentSort) : DEFAULT_SORT;
}

function parsePage(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function loadResidences(params: DirectoryParams) {
  try {
    const response = await getPublicApartments({
      addressQuery: params.q || undefined,
      sort: params.sort,
      page: params.page,
      pageSize: PAGE_SIZE,
    });

    const totalPages = Math.max(1, Math.ceil(response.count / PAGE_SIZE));
    if (params.page > totalPages) {
      const lastPageResponse = await getPublicApartments({
        addressQuery: params.q || undefined,
        sort: params.sort,
        page: totalPages,
        pageSize: PAGE_SIZE,
      });

      return {
        response: lastPageResponse,
        currentPage: totalPages,
        hasError: false,
      };
    }

    return {
      response,
      currentPage: params.page,
      hasError: false,
    };
  } catch {
    return {
      response: emptyResponse(),
      currentPage: 1,
      hasError: true,
    };
  }
}

export default async function ResidencesPage({ params, searchParams }: ResidencesPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const directoryParams: DirectoryParams = {
    q: getParamValue(resolvedSearchParams.q).trim(),
    sort: parseSort(getParamValue(resolvedSearchParams.sort)),
    page: parsePage(getParamValue(resolvedSearchParams.page)),
  };

  const { response, currentPage, hasError } = await loadResidences(directoryParams);

  return (
    <>
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={ctaLabels[locale]}
      />
      <ResidencesHub
        locale={locale}
        residences={response.results}
        totalCount={response.count}
        searchQuery={directoryParams.q}
        sort={directoryParams.sort}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        hasError={hasError}
      />
    </>
  );
}
