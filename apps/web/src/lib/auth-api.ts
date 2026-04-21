import 'server-only';

import { env } from '@/lib/config/env';
import { LOCALE_HEADER, type LocaleCode } from '@/lib/i18n';

import type { AuthResponse, AuthenticatedUser } from './auth';

type JsonPayload = Record<string, unknown>;

async function requestJson<T>(path: string, locale: LocaleCode, init: RequestInit) {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set(LOCALE_HEADER, locale);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => ({}))) as T | JsonPayload;
  return { response, payload };
}

export function loginWithBackend(identifier: string, password: string, locale: LocaleCode) {
  return requestJson<AuthResponse>('/auth/token/', locale, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
  });
}

export function registerWithBackend(
  payload: {
    email: string;
    phone_number: string;
    password: string;
    first_name: string;
    last_name: string;
  },
  locale: LocaleCode,
) {
  return requestJson<AuthResponse>('/auth/register/', locale, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      role: 'user',
    }),
  });
}

export function refreshWithBackend(refresh: string, locale: LocaleCode) {
  return requestJson<{ access: string; refresh?: string }>('/auth/token/refresh/', locale, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });
}

export function blacklistWithBackend(refresh: string, locale: LocaleCode) {
  return requestJson<{ detail?: string } | JsonPayload>('/auth/token/blacklist/', locale, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });
}

export function getCurrentUserFromBackend(accessToken: string, locale: LocaleCode) {
  return requestJson<AuthenticatedUser>('/auth/me/', locale, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
