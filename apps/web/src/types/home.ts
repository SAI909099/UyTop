export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ProjectPriceBounds = {
  min: number;
  max: number;
};

export type LocationRef = {
  id: number;
  name: string;
  slug: string;
};

export type PublicCompany = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  logo_url: string;
  hero_image_url: string;
  headquarters: string;
  trust_note: string;
  is_verified: boolean;
  project_count: number;
  apartment_count: number;
};

export type PublicProject = {
  id: number;
  company: number;
  name: string;
  slug: string;
  headline: string;
  location_label: string;
  address: string;
  city: LocationRef;
  district: LocationRef | null;
  starting_price: string;
  currency: string;
  delivery_window: string;
  hero_image_url: string;
  building_count: number;
};

export type PublicProjectSort = 'featured' | 'price_asc' | 'price_desc' | 'delivery_asc';

export type PublicProjectQuery = {
  company?: number;
  minPrice?: number;
  maxPrice?: number;
  deliveryYear?: number | null;
  addressQuery?: string;
  rooms?: number[];
  sort?: PublicProjectSort;
  page?: number;
  pageSize?: number;
};

export type PublicApartmentQuery = {
  minPrice?: number;
  maxPrice?: number;
  deliveryYear?: number | null;
  addressQuery?: string;
  rooms?: number[];
  page?: number;
  pageSize?: number;
  random?: boolean;
};

export type PublicCatalogLookups = {
  project_delivery_years: number[];
  project_price_bounds: ProjectPriceBounds;
  project_room_counts: number[];
};

export type PaymentOption = {
  payment_type: string;
  notes: string;
};

export type PublicApartmentImage = {
  id: number;
  image_url: string;
  storage_key: string;
  sort_order: number;
  is_primary: boolean;
};

export type PublicMapApartment = {
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
  payment_options: PaymentOption[];
};

export type PublicApartmentDetail = {
  id: number;
  building: number;
  title: string;
  slug: string;
  apartment_number: string;
  description: string;
  status: string;
  is_public: boolean;
  price: string;
  currency: string;
  rooms: number;
  size_sqm: string;
  floor: number;
  address: string;
  city: LocationRef;
  district: LocationRef | null;
  latitude: string;
  longitude: string;
  company_name: string;
  project_name: string;
  building_name: string;
  building_code: string;
  primary_image: string | null;
  images: PublicApartmentImage[];
  payment_options: PaymentOption[];
};

export type PublicApartmentSummary = PublicApartmentDetail;

export type HomepageData = {
  companies: PublicCompany[];
  companiesCount: number;
  projects: PublicProject[];
  projectsCount: number;
  projectDeliveryYears: number[];
  projectPriceBounds: ProjectPriceBounds;
  projectRoomCounts: number[];
  showcaseApartments: PublicApartmentSummary[];
  showcaseApartmentsCount: number;
  mapApartments: PublicMapApartment[];
  mapApartmentsCount: number;
};
