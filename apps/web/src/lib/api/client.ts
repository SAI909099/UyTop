import { cookies } from "next/headers";

import { env } from "@/lib/config/env";
import { fallbackListingDetail, fallbackListings, fallbackMapListings } from "@/lib/api/mock-data";
import type { AuthUser, ListingDetail, ListingSummary, MapListingPreview, PaginatedResponse } from "@/types/api";

async function apiFetch<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getFeaturedListings() {
  try {
    const data = await apiFetch<PaginatedResponse<ListingSummary>>("/listings?featured=true&page_size=4");
    return data.results.length > 0 ? data.results : fallbackListings.slice(0, 3);
  } catch {
    return fallbackListings.slice(0, 3);
  }
}

export async function getSearchListings(queryString: string) {
  try {
    return await apiFetch<PaginatedResponse<ListingSummary>>(`/listings${queryString ? `?${queryString}` : ""}`);
  } catch {
    return {
      count: fallbackListings.length,
      next: null,
      previous: null,
      results: fallbackListings,
    };
  }
}

export async function getMapListings(queryString: string) {
  try {
    return await apiFetch<PaginatedResponse<MapListingPreview>>(`/map/listings${queryString ? `?${queryString}` : ""}`);
  } catch {
    return {
      count: fallbackMapListings.length,
      next: null,
      previous: null,
      results: fallbackMapListings,
    };
  }
}

export async function getListingDetail(id: number) {
  try {
    return await apiFetch<ListingDetail>(`/listings/${id}`);
  } catch {
    return {
      ...fallbackListingDetail,
      id,
      slug: `${id}-${fallbackListingDetail.slug}`,
    };
  }
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("uytop_access_token")?.value ?? env.demoOwnerToken;
}

export async function getCurrentUser(token: string) {
  return apiFetch<AuthUser>("/auth/me/", { token });
}

export async function getOwnerDashboardListings(token: string) {
  return apiFetch<PaginatedResponse<ListingSummary>>("/listings?owned_by=me", { token });
}
