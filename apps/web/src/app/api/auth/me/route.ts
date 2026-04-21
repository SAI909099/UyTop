import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAMES, type AuthenticatedUser } from '@/lib/auth';
import { getCurrentUserFromBackend, refreshWithBackend } from '@/lib/auth-api';
import {
  clearAuthCookies,
  getRequestLocaleFromRequest,
  setAccessTokenCookie,
  setAuthUserCookie,
  setRefreshTokenCookie,
} from '@/lib/auth-server';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;
    const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refresh)?.value;
    const locale = getRequestLocaleFromRequest(request, cookieStore);

    if (accessToken) {
      const currentUser = await getCurrentUserFromBackend(accessToken, locale);
      if (currentUser.response.ok) {
        const user = currentUser.payload as AuthenticatedUser;
        setAuthUserCookie(cookieStore, user);
        return NextResponse.json({ user });
      }
    }

    if (!refreshToken) {
      clearAuthCookies(cookieStore);
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const refreshed = await refreshWithBackend(refreshToken, locale);

    if (!refreshed.response.ok) {
      clearAuthCookies(cookieStore);
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const refreshedPayload = refreshed.payload as { access: string; refresh?: string };
    setAccessTokenCookie(cookieStore, refreshedPayload.access);

    if (refreshedPayload.refresh) {
      setRefreshTokenCookie(cookieStore, refreshedPayload.refresh);
    }

    const currentUser = await getCurrentUserFromBackend(refreshedPayload.access, locale);

    if (!currentUser.response.ok) {
      clearAuthCookies(cookieStore);
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const user = currentUser.payload as AuthenticatedUser;
    setAuthUserCookie(cookieStore, user);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Authentication service is unavailable.' }, { status: 502 });
  }
}
