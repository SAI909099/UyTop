export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",
  mapProvider: process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "google-maps",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  demoOwnerToken: process.env.WEB_DEMO_OWNER_TOKEN ?? "",
};
