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

export function getCompanies() {
  return apiFetch<ApiListResponse<CatalogCompany>>('/catalog/companies');
}

export function getProjects(companyId?: number) {
  return apiFetch<ApiListResponse<CatalogProject>>(`/catalog/projects${companyId ? `?company=${companyId}` : ''}`);
}

export function getBuildings(projectId?: number) {
  return apiFetch<ApiListResponse<CatalogBuilding>>(`/catalog/buildings${projectId ? `?project=${projectId}` : ''}`);
}

export function getApartments(params: { companyId?: number; projectId?: number; buildingId?: number } = {}) {
  const query = new URLSearchParams();
  if (params.companyId) query.set('company', String(params.companyId));
  if (params.projectId) query.set('project', String(params.projectId));
  if (params.buildingId) query.set('building', String(params.buildingId));
  return apiFetch<ApiListResponse<CatalogApartment>>(`/catalog/apartments${query.size ? `?${query.toString()}` : ''}`);
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

export function createProject(payload: unknown) {
  return apiMutate<CatalogProject>('/catalog/projects', 'POST', payload);
}

export function updateProject(slug: string, payload: unknown) {
  return apiMutate<CatalogProject>(`/catalog/projects/${slug}`, 'PATCH', payload);
}

export function createBuilding(payload: unknown) {
  return apiMutate<CatalogBuilding>('/catalog/buildings', 'POST', payload);
}

export function updateBuilding(slug: string, payload: unknown) {
  return apiMutate<CatalogBuilding>(`/catalog/buildings/${slug}`, 'PATCH', payload);
}

export function createApartment(payload: unknown) {
  return apiMutate<CatalogApartment>('/catalog/apartments', 'POST', payload);
}

export function updateApartment(slug: string, payload: unknown) {
  return apiMutate<CatalogApartment>(`/catalog/apartments/${slug}`, 'PATCH', payload);
}

export async function uploadCatalogImage(file: File) {
  const formData = new FormData();
  formData.set('file', file);
  return apiMutate<CatalogImageUpload>('/catalog/uploads/images', 'POST', formData);
}
