import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_HEADER, normalizeLocale } from '@/lib/i18n';

async function forward(request: Request, path: string[]) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('admin_access_token')?.value;
  const locale = normalizeLocale(
    request.headers.get(LOCALE_HEADER) ?? cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE,
  );
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
  const upstreamUrl = new URL(`${apiBaseUrl}/${path.join('/')}`);

  const incomingUrl = new URL(request.url);
  upstreamUrl.search = incomingUrl.search;

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set(LOCALE_HEADER, locale);

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (process.env.NEXT_PUBLIC_ADMIN_BYPASS_AUTH === 'true') {
    headers.set('X-Admin-Bypass', 'true');
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(upstreamUrl, init);
  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return forward(request, resolved.path);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return forward(request, resolved.path);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return forward(request, resolved.path);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return forward(request, resolved.path);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return forward(request, resolved.path);
}
