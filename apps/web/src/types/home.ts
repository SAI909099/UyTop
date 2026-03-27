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

export type PublicCompanyQuery = {
  page?: number;
  pageSize?: number;
};

export type PublicCompanyDetail = PublicCompany & {
  description: string;
  founded_year: number | null;
  is_active: boolean;
  projects: PublicProject[];
};

export type DeveloperHubCompany = PublicCompany & {
  founded_year: number | null;
  experience_years: number | null;
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

export type PublicBuildingSummary = {
  id: number;
  project: number;
  code: string;
  name: string;
  slug: string;
  status: string;
  handover: string;
  summary: string;
  total_floors: number | null;
  total_apartments: number | null;
  price_from: string;
  price_to: string;
  cover_image_url: string;
  apartments_left: number;
};

export type PublicBuildingDetail = Omit<PublicBuildingSummary, 'project'> & {
  is_active: boolean;
  project: PublicProject;
  apartments: PublicApartmentSummary[];
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

export type PublicBuildingQuery = {
  project?: number;
  page?: number;
  pageSize?: number;
};

export type PublicApartmentQuery = {
  minPrice?: number;
  maxPrice?: number;
  deliveryYear?: number | null;
  addressQuery?: string;
  rooms?: number[];
  sort?: PublicApartmentSort;
  page?: number;
  pageSize?: number;
  random?: boolean;
};

export type PublicApartmentSort = 'newest' | 'price_asc' | 'price_desc';

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
  city: LocationRef;
  district: LocationRef | null;
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
};
