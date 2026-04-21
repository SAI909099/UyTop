import 'server-only';

import { cookies, headers } from 'next/headers';

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_HEADER, normalizeLocale, type LocaleCode } from '@/lib/i18n';

import { getCurrentUserFromBackend } from './auth-api';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAMES, type AuthResponse, type AuthenticatedUser } from './auth';

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

type CookieWriter = CookieReader & {
  set(name: string, value: string, options?: Record<string, unknown>): unknown;
};

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

function serializeAuthUser(user: AuthenticatedUser) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
}

export function readAuthUserCookie(value?: string | null): AuthenticatedUser | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(decoded) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function setAccessTokenCookie(cookieStore: CookieWriter, accessToken: string) {
  cookieStore.set(AUTH_COOKIE_NAMES.access, accessToken, authCookieOptions(AUTH_COOKIE_MAX_AGE.access));
}

export function setRefreshTokenCookie(cookieStore: CookieWriter, refreshToken: string) {
  cookieStore.set(AUTH_COOKIE_NAMES.refresh, refreshToken, authCookieOptions(AUTH_COOKIE_MAX_AGE.refresh));
}

export function setAuthUserCookie(cookieStore: CookieWriter, user: AuthenticatedUser) {
  cookieStore.set(AUTH_COOKIE_NAMES.user, serializeAuthUser(user), authCookieOptions(AUTH_COOKIE_MAX_AGE.user));
}

export function setAuthCookies(cookieStore: CookieWriter, payload: AuthResponse) {
  setAccessTokenCookie(cookieStore, payload.access);
  setRefreshTokenCookie(cookieStore, payload.refresh);
  setAuthUserCookie(cookieStore, payload.user);
}

export function clearAuthCookies(cookieStore: CookieWriter) {
  const cleared = authCookieOptions(0);
  cookieStore.set(AUTH_COOKIE_NAMES.access, '', cleared);
  cookieStore.set(AUTH_COOKIE_NAMES.refresh, '', cleared);
  cookieStore.set(AUTH_COOKIE_NAMES.user, '', cleared);
}

export function getRequestLocaleFromRequest(request: Request, cookieStore: CookieReader): LocaleCode {
  return normalizeLocale(request.headers.get(LOCALE_HEADER) ?? cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE);
}

export async function getServerRequestLocale() {
  const headerStore = await headers();
  const cookieStore = await cookies();
  return normalizeLocale(headerStore.get(LOCALE_HEADER) ?? cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE);
}

export async function getServerAuthUser() {
  const cookieStore = await cookies();
  return readAuthUserCookie(cookieStore.get(AUTH_COOKIE_NAMES.user)?.value);
}

export async function getVerifiedServerAuthUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;

  if (!accessToken) {
    return null;
  }

  const locale = await getServerRequestLocale();
  const { response, payload } = await getCurrentUserFromBackend(accessToken, locale);
  return response.ok ? (payload as AuthenticatedUser) : null;
}
