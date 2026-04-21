import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { blacklistWithBackend } from '@/lib/auth-api';
import { AUTH_COOKIE_NAMES } from '@/lib/auth';
import { clearAuthCookies, getRequestLocaleFromRequest } from '@/lib/auth-server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refresh)?.value;
  const locale = getRequestLocaleFromRequest(request, cookieStore);

  if (refreshToken) {
    try {
      await blacklistWithBackend(refreshToken, locale);
    } catch {
      // Clearing the local session is still more important than surfacing upstream logout failures.
    }
  }

  clearAuthCookies(cookieStore);
  return NextResponse.json({ ok: true });
}
