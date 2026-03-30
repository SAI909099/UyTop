import { env } from '@/lib/config/env';
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_HEADER, normalizeLocale } from '@/lib/i18n';
import type {
  PublicCompanyQuery,
  PublicCompanyDetail,
  PublicBuildingDetail,
  PublicBuildingQuery,
  PublicBuildingSummary,
  PublicApartmentQuery,
  HomepageData,
  PaginatedResponse,
  PublicApartmentDetail,
  PublicApartmentSummary,
  PublicCatalogLookups,
  PublicCompany,
  PublicMapApartment,
  PublicProject,
  PublicProjectQuery,
} from '@/types/home';

async function fetchPublicApi<T>(path: string, init?: RequestInit): Promise<T> {
  const locale = await resolveLocale();
  const target =
    typeof window === 'undefined'
      ? `${env.apiBaseUrl}${path}`
      : `/api/public-proxy${path}`;

  const response = await fetch(target, {
    ...init,
    headers: {
      Accept: 'application/json',
      [LOCALE_HEADER]: locale,
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Public API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function getBrowserCookie(name: string) {
  if (typeof document === 'undefined') {
    return '';
  }

  const value = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return value ? decodeURIComponent(value) : '';
}

async function resolveLocale() {
  if (typeof window !== 'undefined') {
    return normalizeLocale(getBrowserCookie(LOCALE_COOKIE_NAME));
  }

  const { cookies, headers } = await import('next/headers');
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);

  if (headerLocale) {
    return normalizeLocale(headerLocale);
  }

  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE);
}

function emptyResponse<T>(): PaginatedResponse<T> {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

function emptyLookups(): PublicCatalogLookups {
  return {
    project_delivery_years: [],
    project_price_bounds: {
      min: 0,
      max: 0,
    },
    project_room_counts: [],
  };
}

export function getPublicCompanies(init?: RequestInit) {
  return fetchPublicApi<PaginatedResponse<PublicCompany>>('/catalog/companies', init);
}

export function getPublicCompaniesPage(params: PublicCompanyQuery = {}, init?: RequestInit) {
  const query = buildQuery({
    page: params.page,
    page_size: params.pageSize,
  });

  return fetchPublicApi<PaginatedResponse<PublicCompany>>(`/catalog/companies${query}`, init);
}

export async function getHomepageData(): Promise<HomepageData> {
  const [companiesResult, projectsResult, showcaseApartmentsResult, lookupsResult] =
    await Promise.allSettled([
      getPublicCompanies(),
      getPublicProjects({ sort: 'featured', pageSize: 20 }),
      getPublicApartments({ pageSize: 3, random: true }),
      getPublicCatalogLookups(),
    ]);

  const companies = companiesResult.status === 'fulfilled' ? companiesResult.value : emptyResponse<PublicCompany>();
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : emptyResponse<PublicProject>();
  const showcaseApartments =
    showcaseApartmentsResult.status === 'fulfilled'
      ? showcaseApartmentsResult.value
      : emptyResponse<PublicApartmentSummary>();
  const lookups = lookupsResult.status === 'fulfilled' ? lookupsResult.value : emptyLookups();

  return {
    companies: companies.results,
    companiesCount: companies.count,
    projects: projects.results,
    projectsCount: projects.count,
    projectDeliveryYears: lookups.project_delivery_years,
    projectPriceBounds: lookups.project_price_bounds,
    projectRoomCounts: lookups.project_room_counts,
    showcaseApartments: showcaseApartments.results,
    showcaseApartmentsCount: showcaseApartments.count,
  };
}

export function getPublicProjects(params: PublicProjectQuery = {}, init?: RequestInit) {
  const query = buildQuery({
    company: params.company,
    min_price: params.minPrice,
    max_price: params.maxPrice,
    delivery_year: params.deliveryYear,
    address_query: params.addressQuery,
    rooms: params.rooms?.join(','),
    sort: params.sort,
    page: params.page,
    page_size: params.pageSize,
  });

  return fetchPublicApi<PaginatedResponse<PublicProject>>(`/catalog/projects${query}`, init);
}

export function getPublicCatalogLookups(init?: RequestInit) {
  return fetchPublicApi<PublicCatalogLookups>('/catalog/lookups', init);
}

export function getPublicBuildings(params: PublicBuildingQuery = {}, init?: RequestInit) {
  const query = buildQuery({
    project: params.project,
    page: params.page,
    page_size: params.pageSize,
  });

  return fetchPublicApi<PaginatedResponse<PublicBuildingSummary>>(`/catalog/buildings${query}`, init);
}

export function getPublicApartments(params: PublicApartmentQuery = {}, init?: RequestInit) {
  const query = buildQuery({
    min_price: params.minPrice,
    max_price: params.maxPrice,
    delivery_year: params.deliveryYear,
    address_query: params.addressQuery,
    rooms: params.rooms?.join(','),
    sort: params.sort,
    page: params.page,
    page_size: params.pageSize,
    random: params.random ? '1' : undefined,
  });

  return fetchPublicApi<PaginatedResponse<PublicApartmentSummary>>(`/catalog/apartments${query}`, init);
}

type PublicMapApartmentOptions = {
  suppressErrors?: boolean;
};

export async function getPublicMapApartments(
  options: PublicMapApartmentOptions = {},
): Promise<PaginatedResponse<PublicMapApartment>> {
  try {
    return await fetchPublicApi<PaginatedResponse<PublicMapApartment>>('/catalog/map/apartments');
  } catch (error) {
    if (options.suppressErrors) {
      return emptyResponse<PublicMapApartment>();
    }

    throw error;
  }
}

export function getPublicApartmentDetail(slug: string): Promise<PublicApartmentDetail> {
  return fetchPublicApi<PublicApartmentDetail>(`/catalog/apartments/${slug}`);
}

export function getPublicCompanyDetail(slug: string): Promise<PublicCompanyDetail> {
  return fetchPublicApi<PublicCompanyDetail>(`/catalog/companies/${slug}`);
}

export function getPublicBuildingDetail(slug: string): Promise<PublicBuildingDetail> {
  return fetchPublicApi<PublicBuildingDetail>(`/catalog/buildings/${slug}`);
}
