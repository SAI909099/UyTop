export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ListingImage = {
  id: number;
  image_url: string;
  storage_key?: string;
  sort_order: number;
  is_primary: boolean;
};

export type LocationRef = {
  id: number;
  name: string;
  slug: string;
};

export type NearbyPlace = {
  id: number;
  place_type: string;
  title: string;
  distance_meters: number;
};

export type Amenity = {
  id: number;
  title: string;
  slug: string;
};

export type ListingSummary = {
  id: number;
  slug: string;
  title: string;
  purpose: string;
  category: string;
  price: string;
  currency: string;
  city: LocationRef;
  district: LocationRef | null;
  latitude: string;
  longitude: string;
  rooms: number | null;
  size_sqm: string | null;
  is_featured: boolean;
  is_verified_owner: boolean;
  status: string;
  moderation_status: string;
  owner_id: number;
  owner_name: string;
  images: ListingImage[];
  created_at: string;
  updated_at: string;
};

export type ListingDetail = ListingSummary & {
  description: string;
  address: string;
  condition: string;
  furnished: boolean;
  floor: number | null;
  total_floors: number | null;
  contact_phone: string;
  contact_whatsapp: string;
  contact_telegram: string;
  allow_phone: boolean;
  allow_whatsapp: boolean;
  allow_telegram: boolean;
  view_count: number;
  published_at: string | null;
  expires_at: string | null;
  sold_or_rented_at: string | null;
  amenities: Amenity[];
  nearby_places: NearbyPlace[];
};

export type MapListingPreview = {
  id: number;
  slug: string;
  title: string;
  purpose: string;
  category: string;
  price: string;
  currency: string;
  city: string;
  district: string | null;
  latitude: string;
  longitude: string;
  is_featured: boolean;
  is_verified_owner: boolean;
  primary_image: string | null;
};

export type AuthUser = {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified_owner: boolean;
};
