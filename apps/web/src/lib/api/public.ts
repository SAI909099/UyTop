import { env } from '@/lib/config/env';
import type {
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
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Public API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
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

export async function getHomepageData(): Promise<HomepageData> {
  const [companiesResult, projectsResult, showcaseApartmentsResult, apartmentsResult, lookupsResult] =
    await Promise.allSettled([
      fetchPublicApi<PaginatedResponse<PublicCompany>>('/catalog/companies'),
      getPublicProjects({ sort: 'featured', pageSize: 20 }),
      getPublicApartments({ pageSize: 3, random: true }),
      fetchPublicApi<PaginatedResponse<PublicMapApartment>>('/catalog/map/apartments'),
      getPublicCatalogLookups(),
    ]);

  const companies = companiesResult.status === 'fulfilled' ? companiesResult.value : emptyResponse<PublicCompany>();
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : emptyResponse<PublicProject>();
  const showcaseApartments =
    showcaseApartmentsResult.status === 'fulfilled'
      ? showcaseApartmentsResult.value
      : emptyResponse<PublicApartmentSummary>();
  const mapApartments =
    apartmentsResult.status === 'fulfilled' ? apartmentsResult.value : emptyResponse<PublicMapApartment>();
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
    mapApartments: mapApartments.results,
    mapApartmentsCount: mapApartments.count,
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

export function getPublicApartments(params: PublicApartmentQuery = {}, init?: RequestInit) {
  const query = buildQuery({
    min_price: params.minPrice,
    max_price: params.maxPrice,
    delivery_year: params.deliveryYear,
    address_query: params.addressQuery,
    rooms: params.rooms?.join(','),
    page: params.page,
    page_size: params.pageSize,
    random: params.random ? '1' : undefined,
  });

  return fetchPublicApi<PaginatedResponse<PublicApartmentSummary>>(`/catalog/apartments${query}`, init);
}

export async function getPublicMapApartments(): Promise<PaginatedResponse<PublicMapApartment>> {
  try {
    return await fetchPublicApi<PaginatedResponse<PublicMapApartment>>('/catalog/map/apartments');
  } catch {
    return emptyResponse<PublicMapApartment>();
  }
}

export function getPublicApartmentDetail(slug: string): Promise<PublicApartmentDetail> {
  return fetchPublicApi<PublicApartmentDetail>(`/catalog/apartments/${slug}`);
}
