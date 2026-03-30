import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER,
  buildLocalizedPath,
  getPathLocale,
  normalizeLocale,
} from '@/lib/i18n';

function isBypassedPath(pathname: string) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.[^/]+$/.test(pathname)
  );
}

function cookieOptions() {
  return {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax' as const,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const localeFromPath = getPathLocale(pathname);
  const requestHeaders = new Headers(request.headers);

  if (localeFromPath) {
    requestHeaders.set(LOCALE_HEADER, localeFromPath);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set(LOCALE_COOKIE_NAME, localeFromPath, cookieOptions());
    return response;
  }

  const preferredLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = buildLocalizedPath(preferredLocale, pathname);
  requestHeaders.set(LOCALE_HEADER, preferredLocale);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(LOCALE_COOKIE_NAME, preferredLocale, cookieOptions());
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
