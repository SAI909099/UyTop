type AdminEnvironment = {
  apiBaseUrl: string;
  adminBypassEnabled: boolean;
  googleMapsApiKey: string;
};

export const env: AdminEnvironment = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api',
  adminBypassEnabled: process.env.NEXT_PUBLIC_ADMIN_BYPASS_AUTH === 'true',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
};
