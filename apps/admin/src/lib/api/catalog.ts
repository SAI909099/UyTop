import { apiFetch, apiMutate } from '@/lib/api/client';
import type {
  ApiListResponse,
  CatalogApartment,
  CatalogBuilding,
  CatalogCompany,
  CatalogImageUpload,
  CatalogLookups,
  CatalogProject,
} from '@/types/api';

type PaginationParams = {
  page?: number;
  pageSize?: number;
};

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  return query.size ? `?${query.toString()}` : '';
}

export function getCompanies() {
  return apiFetch<ApiListResponse<CatalogCompany>>('/catalog/companies');
}

export function getCompaniesPage(params: PaginationParams = {}) {
  const query = buildQuery({
    page: params.page,
    page_size: params.pageSize,
  });

  return apiFetch<ApiListResponse<CatalogCompany>>(`/catalog/companies${query}`);
}

export function getProjects(companyId?: number) {
  return apiFetch<ApiListResponse<CatalogProject>>(`/catalog/projects${companyId ? `?company=${companyId}` : ''}`);
}

export function getProjectsPage(params: PaginationParams & { companyId?: number } = {}) {
  const query = buildQuery({
    company: params.companyId,
    page: params.page,
    page_size: params.pageSize,
  });

  return apiFetch<ApiListResponse<CatalogProject>>(`/catalog/projects${query}`);
}

export function getBuildings(projectId?: number) {
  return apiFetch<ApiListResponse<CatalogBuilding>>(`/catalog/buildings${projectId ? `?project=${projectId}` : ''}`);
}

export function getBuildingsPage(params: PaginationParams & { projectId?: number } = {}) {
  const query = buildQuery({
    project: params.projectId,
    page: params.page,
    page_size: params.pageSize,
  });

  return apiFetch<ApiListResponse<CatalogBuilding>>(`/catalog/buildings${query}`);
}

export function getApartments(params: { companyId?: number; projectId?: number; buildingId?: number } = {}) {
  const query = buildQuery({
    company: params.companyId,
    project: params.projectId,
    building: params.buildingId,
  });

  return apiFetch<ApiListResponse<CatalogApartment>>(`/catalog/apartments${query}`);
}

export function getApartmentsPage(
  params: { companyId?: number; projectId?: number; buildingId?: number; page?: number; pageSize?: number } = {},
) {
  const query = buildQuery({
    company: params.companyId,
    project: params.projectId,
    building: params.buildingId,
    page: params.page,
    page_size: params.pageSize,
  });

  return apiFetch<ApiListResponse<CatalogApartment>>(`/catalog/apartments${query}`);
}

export function getCompanyDetail(slug: string) {
  return apiFetch<CatalogCompany>(`/catalog/companies/${slug}`);
}

export function getProjectDetail(slug: string) {
  return apiFetch<CatalogProject>(`/catalog/projects/${slug}`);
}

export function getBuildingDetail(slug: string) {
  return apiFetch<CatalogBuilding>(`/catalog/buildings/${slug}`);
}

export function getApartmentDetail(slug: string) {
  return apiFetch<CatalogApartment>(`/catalog/apartments/${slug}`);
}

export function getCatalogLookups(params: { companyId?: number; projectId?: number; cityId?: number } = {}) {
  const query = new URLSearchParams();
  if (params.companyId) query.set('company', String(params.companyId));
  if (params.projectId) query.set('project', String(params.projectId));
  if (params.cityId) query.set('city', String(params.cityId));
  return apiFetch<CatalogLookups>(`/catalog/lookups${query.size ? `?${query.toString()}` : ''}`);
}

export function createCompany(payload: unknown) {
  return apiMutate<CatalogCompany>('/catalog/companies', 'POST', payload);
}

export function updateCompany(slug: string, payload: unknown) {
  return apiMutate<CatalogCompany>(`/catalog/companies/${slug}`, 'PATCH', payload);
}

export function archiveCompany(slug: string) {
  return updateCompany(slug, { is_active: false });
}

export function restoreCompany(slug: string) {
  return updateCompany(slug, { is_active: true });
}

export function createProject(payload: unknown) {
  return apiMutate<CatalogProject>('/catalog/projects', 'POST', payload);
}

export function updateProject(slug: string, payload: unknown) {
  return apiMutate<CatalogProject>(`/catalog/projects/${slug}`, 'PATCH', payload);
}

export function archiveProject(slug: string) {
  return updateProject(slug, { is_active: false });
}

export function restoreProject(slug: string) {
  return updateProject(slug, { is_active: true });
}

export function createBuilding(payload: unknown) {
  return apiMutate<CatalogBuilding>('/catalog/buildings', 'POST', payload);
}

export function updateBuilding(slug: string, payload: unknown) {
  return apiMutate<CatalogBuilding>(`/catalog/buildings/${slug}`, 'PATCH', payload);
}

export function archiveBuilding(slug: string) {
  return updateBuilding(slug, { is_active: false });
}

export function restoreBuilding(slug: string) {
  return updateBuilding(slug, { is_active: true });
}

export function createApartment(payload: unknown) {
  return apiMutate<CatalogApartment>('/catalog/apartments', 'POST', payload);
}

export function updateApartment(slug: string, payload: unknown) {
  return apiMutate<CatalogApartment>(`/catalog/apartments/${slug}`, 'PATCH', payload);
}

export function deleteApartment(slug: string) {
  return apiMutate<void>(`/catalog/apartments/${slug}`, 'DELETE');
}

export async function uploadCatalogImage(file: File) {
  const formData = new FormData();
  formData.set('file', file);
  return apiMutate<CatalogImageUpload>('/catalog/uploads/images', 'POST', formData);
}
