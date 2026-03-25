export type MapPin = {
  id: string;
  label: string;
  city: string;
  district: string;
  top: string;
  left: string;
  caption: string;
  emphasis?: "primary" | "muted";
};

export type ApartmentType = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  rooms: number;
  sizeSqm: string;
  price: string;
  priceLabel: string;
  remainingUnits: number;
  floorRange: string;
  orientation: string;
  coverImage: string;
  layoutImage: string;
};

export type ProjectBuilding = {
  id: string;
  slug: string;
  code: string;
  name: string;
  status: string;
  handover: string;
  summary: string;
  totalApartments: number;
  apartmentsLeft: number;
  priceFrom: string;
  priceTo: string;
  areaRange: string;
  roomTypes: string[];
  coverImage: string;
  gallery: string[];
  apartmentTypes: ApartmentType[];
};

export type DeveloperProject = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  locationLabel: string;
  city: string;
  district: string;
  address: string;
  startingPrice: string;
  currency: string;
  availabilitySummary: string;
  deliveryWindow: string;
  heroImage: string;
  gallery: string[];
  mapPins: MapPin[];
  buildings: ProjectBuilding[];
  buildingCount?: number;
  apartmentsLeftCount?: number;
};

export type DeveloperCompany = {
  id: string;
  slug: string;
  name: string;
  logoLettermark: string;
  logoWordmark: string;
  tagline: string;
  shortDescription: string;
  description: string;
  trustNote: string;
  verified: boolean;
  foundedYear: number;
  headquarters: string;
  homesDelivered: number;
  activeCities: number;
  heroImage: string;
  projects: DeveloperProject[];
  projectCount?: number;
  apartmentInventoryCount?: number;
};

export type ApartmentMapPreview = {
  id: string;
  slug: string;
  title: string;
  price: string;
  currency: string;
  latitude: number;
  longitude: number;
  rooms: number;
  sizeSqm: string;
  status: string;
  companyName: string;
  projectName: string;
  projectSlug: string;
  buildingName: string;
  buildingSlug: string;
  primaryImage: string | null;
  paymentOptions: {
    paymentType: string;
    notes: string;
  }[];
};

export type DeveloperProjectLookup = {
  company: DeveloperCompany;
  project: DeveloperProject;
};

export type ProjectBuildingLookup = {
  company: DeveloperCompany;
  project: DeveloperProject;
  building: ProjectBuilding;
};
