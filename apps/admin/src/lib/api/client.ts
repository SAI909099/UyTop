import { env } from '@/lib/config/env';

function getBrowserCookie(name: string) {
  if (typeof document === 'undefined') {
    return '';
  }

  const value = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return value ? decodeURIComponent(value) : '';
}

async function getServerAccessToken() {
  if (typeof window !== 'undefined') {
    return '';
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('admin_access_token')?.value ?? '';
}

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isServer = typeof window === 'undefined';
  const requestUrl = isServer ? `${env.apiBaseUrl}${path}` : `/api/admin-proxy${path}`;
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Accept', 'application/json');
  }

  const token = options.token || (isServer ? await getServerAccessToken() : getBrowserCookie('admin_access_token'));
  if (isServer && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (isServer && env.adminBypassEnabled) {
    headers.set('X-Admin-Bypass', 'true');
  }

  const response = await fetch(requestUrl, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      typeof payload?.detail === 'string'
        ? payload.detail
        : typeof payload?.error === 'string'
          ? payload.error
          : `API request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function apiMutate<T>(path: string, method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', body?: unknown) {
  return apiFetch<T>(path, {
    method,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
  });
}
