import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAMES } from '@/lib/auth';
import { env } from '@/lib/config/env';
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_HEADER, normalizeLocale } from '@/lib/i18n';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;
  const locale = normalizeLocale(
    request.headers.get(LOCALE_HEADER) ?? cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE,
  );
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const upstreamHeaders = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    [LOCALE_HEADER]: locale,
  });

  if (accessToken) {
    upstreamHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const userAgent = request.headers.get('user-agent');
  if (userAgent) {
    upstreamHeaders.set('User-Agent', userAgent);
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    upstreamHeaders.set('X-Forwarded-For', forwardedFor);
  }

  const response = await fetch(`${env.apiBaseUrl}/presence/heartbeat`, {
    method: 'POST',
    headers: upstreamHeaders,
    body: JSON.stringify({
      session_key: String(body.session_key ?? ''),
      current_path: String(body.current_path ?? '/'),
    }),
    cache: 'no-store',
  });

  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
