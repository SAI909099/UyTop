import { env } from "@/lib/config/env";
import {
  getBuildingBySlug as getFallbackBuildingBySlug,
  getDeveloperBySlug as getFallbackDeveloperBySlug,
  getDevelopers as getFallbackDevelopers,
  getFeaturedDeveloper as getFallbackFeaturedDeveloper,
  getFeaturedProject as getFallbackFeaturedProject,
  getProjectBySlug as getFallbackProjectBySlug,
} from "@/lib/content/developers";
import type { ApartmentMapPreview, DeveloperCompany, DeveloperProjectLookup, MapPin, ProjectBuildingLookup } from "@/types/developers";

type LocationSummary = {
  id: number;
  name: string;
  slug: string;
};

type CatalogCompanyResponse = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  description?: string;
  logo_url: string;
  hero_image_url: string;
  founded_year: number | null;
  headquarters: string;
  trust_note: string;
  is_verified: boolean;
  project_count?: number;
  apartment_count?: number;
  projects?: CatalogProjectResponse[];
};

type CatalogProjectResponse = {
  id: number;
  company?: number | CatalogCompanyResponse;
  name: string;
  slug: string;
  headline: string;
  description?: string;
  location_label: string;
  address: string;
  city: LocationSummary;
  district: LocationSummary | null;
  starting_price: string;
  currency: string;
  delivery_window: string;
  hero_image_url: string;
  building_count?: number;
  buildings?: CatalogBuildingResponse[];
};

type CatalogBuildingResponse = {
  id: number;
  project?: number | CatalogProjectResponse;
  code: string;
  name: string;
  slug: string;
  status: string;
  handover: string;
  summary: string;
  total_floors: number | null;
  total_apartments: number;
  price_from: string;
  price_to: string;
  cover_image_url: string;
  apartments_left?: number;
  apartments?: CatalogApartmentResponse[];
};

type CatalogApartmentResponse = {
  id: number;
  building?: number;
  title: string;
  slug: string;
  apartment_number: string;
  description?: string;
  status: string;
  is_public: boolean;
  price: string;
  currency: string;
  rooms: number;
  size_sqm: string;
  floor: number;
  address: string;
  city: LocationSummary;
  district: LocationSummary | null;
  latitude: string;
  longitude: string;
  company_name?: string;
  project_name?: string;
  building_name?: string;
  building_code?: string;
  primary_image?: string | null;
  images?: { image_url: string }[];
  payment_options?: { payment_type: string; notes: string }[];
};

type ApiListResponse<T> = {
  count: number;
  results: T[];
  next: string | null;
  previous: string | null;
};

async function fetchCatalog<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizePins(items: ApartmentMapPreview[], labelPrefix?: string): MapPin[] {
  if (items.length === 0) {
    return [];
  }

  const lats = items.map((item) => item.latitude);
  const lngs = items.map((item) => item.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return items.map((item, index) => {
    const topRatio = maxLat === minLat ? 0.5 : (maxLat - item.latitude) / (maxLat - minLat);
    const leftRatio = maxLng === minLng ? 0.5 : (item.longitude - minLng) / (maxLng - minLng);

    return {
      id: `pin-${item.id}`,
      label: labelPrefix ? `${labelPrefix} ${index + 1}` : item.projectName,
      city: "Tashkent",
      district: item.buildingName,
      top: `${18 + topRatio * 60}%`,
      left: `${12 + leftRatio * 74}%`,
      caption: `${item.projectName} · ${item.price} ${item.currency}`,
      emphasis: index === 0 ? "primary" : "muted",
    };
  });
}

function transformApartment(apartment: CatalogApartmentResponse) {
  return {
    id: String(apartment.id),
    slug: apartment.slug,
    title: apartment.title || apartment.apartment_number,
    summary: apartment.description || `${apartment.apartment_number} in ${apartment.building_name ?? "selected building"}.`,
    rooms: apartment.rooms,
    sizeSqm: `${apartment.size_sqm} sqm`,
    price: apartment.price,
    priceLabel: apartment.status === "reserved" ? "Reserved at" : "From",
    remainingUnits: apartment.status === "available" ? 1 : 0,
    floorRange: `Floor ${apartment.floor}`,
    orientation: apartment.payment_options?.map((option) => option.payment_type).join(" / ") || "Cash / credit / split payment",
    coverImage: apartment.primary_image || apartment.images?.[0]?.image_url || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    layoutImage: apartment.images?.[1]?.image_url || apartment.primary_image || "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  };
}

function transformBuilding(building: CatalogBuildingResponse, apartments: CatalogApartmentResponse[]) {
  const uniqueRooms = Array.from(new Set(apartments.map((apartment) => `${apartment.rooms} room`)));
  const sizes = apartments.map((apartment) => Number(apartment.size_sqm)).filter((value) => Number.isFinite(value));
  const minSize = sizes.length > 0 ? Math.min(...sizes) : 0;
  const maxSize = sizes.length > 0 ? Math.max(...sizes) : 0;
  const gallery = apartments.map((apartment) => apartment.primary_image).filter(Boolean) as string[];

  return {
    id: String(building.id),
    slug: building.slug,
    code: building.code,
    name: building.name,
    status: building.status,
    handover: building.handover,
    summary: building.summary,
    totalApartments: building.total_apartments,
    apartmentsLeft: building.apartments_left ?? apartments.filter((apartment) => apartment.status === "available").length,
    priceFrom: building.price_from,
    priceTo: building.price_to,
    areaRange: minSize && maxSize ? `${minSize}-${maxSize} sqm` : "Area on request",
    roomTypes: uniqueRooms.length > 0 ? uniqueRooms : ["Apartment"],
    coverImage: building.cover_image_url || gallery[0] || "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
    gallery: gallery.length > 0 ? gallery.slice(0, 3) : [building.cover_image_url].filter(Boolean),
    apartmentTypes: apartments.map(transformApartment),
  };
}

function transformProject(
  project: CatalogProjectResponse,
  company: CatalogCompanyResponse,
  buildings: CatalogBuildingResponse[] = [],
  mapApartments: ApartmentMapPreview[] = [],
) {
  const transformedBuildings = buildings.map((building) =>
    transformBuilding(
      building,
      (building.apartments as CatalogApartmentResponse[] | undefined) ?? [],
    ),
  );

  return {
    id: String(project.id),
    slug: project.slug,
    name: project.name,
    headline: project.headline,
    description: project.description ?? "",
    locationLabel: project.location_label,
    city: project.city.name,
    district: project.district?.name ?? project.city.name,
    address: project.address,
    startingPrice: project.starting_price,
    currency: project.currency,
    availabilitySummary: `${mapApartments.length} public apartments currently visible on the map.`,
    deliveryWindow: project.delivery_window,
    heroImage: project.hero_image_url || company.hero_image_url || "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=80",
    gallery: [project.hero_image_url, ...transformedBuildings.flatMap((building) => building.gallery)].filter(Boolean).slice(0, 3),
    mapPins: normalizePins(mapApartments),
    buildings: transformedBuildings,
    buildingCount: project.building_count ?? transformedBuildings.length,
    apartmentsLeftCount: mapApartments.filter((apartment) => apartment.status === "available").length,
  };
}

function transformCompany(
  company: CatalogCompanyResponse,
  projects: ReturnType<typeof transformProject>[],
): DeveloperCompany {
  const cities = new Set(projects.map((project) => project.city));

  return {
    id: String(company.id),
    slug: company.slug,
    name: company.name,
    logoLettermark: initials(company.name),
    logoWordmark: company.name,
    tagline: company.tagline || "Verified residential developer",
    shortDescription: company.short_description || company.description || "",
    description: company.description || company.short_description || "",
    trustNote: company.trust_note || "Verified developer profile with project and building visibility.",
    verified: company.is_verified,
    foundedYear: company.founded_year ?? 2018,
    headquarters: company.headquarters || "Tashkent",
    homesDelivered: company.apartment_count ?? 0,
    activeCities: cities.size || 1,
    heroImage: company.hero_image_url || company.logo_url || "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=80",
    projects,
    projectCount: company.project_count ?? projects.length,
    apartmentInventoryCount: company.apartment_count ?? projects.reduce((total, project) => total + (project.apartmentsLeftCount ?? 0), 0),
  };
}

export async function getCatalogApartmentMap(companyId?: string, projectId?: string): Promise<ApartmentMapPreview[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.set("company", companyId);
    if (projectId) params.set("project", projectId);
    const response = await fetchCatalog<ApiListResponse<{
      id: number;
      slug: string;
      title: string;
      price: string;
      currency: string;
      latitude: string;
      longitude: string;
      rooms: number;
      size_sqm: string;
      status: string;
      company_name: string;
      project_name: string;
      project_slug: string;
      building_name: string;
      building_slug: string;
      primary_image: string | null;
      payment_options: { payment_type: string; notes: string }[];
    }>>(`/catalog/map/apartments${params.size ? `?${params.toString()}` : ""}`);

    return response.results.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.title,
      price: item.price,
      currency: item.currency,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      rooms: item.rooms,
      sizeSqm: item.size_sqm,
      status: item.status,
      companyName: item.company_name,
      projectName: item.project_name,
      projectSlug: item.project_slug,
      buildingName: item.building_name,
      buildingSlug: item.building_slug,
      primaryImage: item.primary_image,
      paymentOptions: item.payment_options.map((option) => ({
        paymentType: option.payment_type,
        notes: option.notes,
      })),
    }));
  } catch {
    return [];
  }
}

export async function getCatalogDevelopers(): Promise<DeveloperCompany[]> {
  try {
    const [companiesResponse, projectsResponse] = await Promise.all([
      fetchCatalog<ApiListResponse<CatalogCompanyResponse>>("/catalog/companies"),
      fetchCatalog<ApiListResponse<CatalogProjectResponse>>("/catalog/projects"),
    ]);

    return companiesResponse.results.map((company) => {
      const projects = projectsResponse.results
        .filter((project) => Number(project.company) === company.id)
        .map((project) => transformProject(project, company));
      return transformCompany(company, projects);
    });
  } catch {
    return getFallbackDevelopers();
  }
}

export async function getCatalogDeveloperBySlug(companySlug: string): Promise<DeveloperCompany | null> {
  try {
    const company = await fetchCatalog<CatalogCompanyResponse>(`/catalog/companies/${companySlug}`);
    const projectDetails = await Promise.all(
      (company.projects ?? []).map(async (project) => {
        const detail = await fetchCatalog<CatalogProjectResponse>(`/catalog/projects/${project.slug}`);
        const mapApartments = await getCatalogApartmentMap(String(company.id), String(detail.id));
        return transformProject(detail, company, detail.buildings ?? [], mapApartments);
      }),
    );

    return transformCompany(company, projectDetails);
  } catch {
    return getFallbackDeveloperBySlug(companySlug);
  }
}

export async function getCatalogFeaturedDeveloper() {
  const developer = await getCatalogDeveloperBySlug("dream-house");
  return developer ?? getFallbackFeaturedDeveloper();
}

export async function getCatalogFeaturedProject() {
  const lookup = await getCatalogProjectBySlug("riverside-signature");
  return lookup ?? getFallbackFeaturedProject();
}

export async function getCatalogProjectBySlug(projectSlug: string): Promise<DeveloperProjectLookup | null> {
  try {
    const detail = await fetchCatalog<CatalogProjectResponse>(`/catalog/projects/${projectSlug}`);
    const companySummary = typeof detail.company === "object" ? detail.company : null;
    if (!companySummary) {
      throw new Error("Missing company");
    }

    const mapApartments = await getCatalogApartmentMap(String(companySummary.id), String(detail.id));
    const project = transformProject(detail, companySummary, detail.buildings ?? [], mapApartments);
    const company = transformCompany(companySummary, [project]);
    return { company, project };
  } catch {
    return getFallbackProjectBySlug(projectSlug);
  }
}

export async function getCatalogBuildingBySlug(projectSlug: string, buildingSlug: string): Promise<ProjectBuildingLookup | null> {
  try {
    const projectLookup = await getCatalogProjectBySlug(projectSlug);
    if (!projectLookup) {
      return null;
    }

    const detail = await fetchCatalog<CatalogBuildingResponse>(`/catalog/buildings/${buildingSlug}`);
    const apartments = (detail.apartments as CatalogApartmentResponse[] | undefined) ?? [];
    const building = transformBuilding(detail, apartments);
    const project = {
      ...projectLookup.project,
      buildings: projectLookup.project.buildings.map((item) => (item.slug === building.slug ? building : item)),
    };
    return {
      company: projectLookup.company,
      project,
      building,
    };
  } catch {
    return getFallbackBuildingBySlug(projectSlug, buildingSlug);
  }
}
