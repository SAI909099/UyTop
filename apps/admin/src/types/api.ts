export type ApiListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type LookupOption = {
  id: number;
  name: string;
  slug: string;
};

export type ProjectLookupOption = LookupOption & {
  company_id: number;
};

export type BuildingLookupOption = LookupOption & {
  project_id: number;
  code: string;
};

export type PaymentOptionLookup = {
  value: string;
  label: string;
};

export type CatalogLookups = {
  companies: LookupOption[];
  projects: ProjectLookupOption[];
  buildings: BuildingLookupOption[];
  cities: LookupOption[];
  districts: Array<LookupOption & { city_id: number }>;
  payment_options: PaymentOptionLookup[];
  building_statuses: PaymentOptionLookup[];
  apartment_statuses: PaymentOptionLookup[];
};

export type CatalogCompany = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  founded_year: number | null;
  headquarters: string;
  trust_note: string;
  is_verified: boolean;
  is_active: boolean;
  project_count?: number;
  apartment_count?: number;
};

export type CatalogProject = {
  id: number;
  company: number;
  name: string;
  slug: string;
  headline: string;
  description?: string;
  location_label: string;
  address: string;
  city: LookupOption;
  district: LookupOption | null;
  starting_price: string;
  currency: string;
  delivery_window: string;
  hero_image_url: string;
  building_count?: number;
};

export type CatalogBuilding = {
  id: number;
  project: number;
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
  is_active?: boolean;
};

export type CatalogPaymentOption = {
  payment_type: string;
  notes: string;
};

export type CatalogImage = {
  id?: number;
  image_url: string;
  storage_key?: string;
  sort_order?: number;
  is_primary?: boolean;
};

export type CatalogApartment = {
  id: number;
  building: number;
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
  city: LookupOption;
  district: LookupOption | null;
  latitude: string;
  longitude: string;
  company_name?: string;
  project_name?: string;
  building_name?: string;
  building_code?: string;
  primary_image?: string | null;
  payment_options: CatalogPaymentOption[];
  images?: CatalogImage[];
};

export type CatalogImageUpload = {
  image_url: string;
  storage_key: string;
};
