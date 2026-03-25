import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ONE_DAY = 60 * 60 * 24;

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = String(body.identifier ?? '').trim();
  const password = String(body.password ?? '');

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Email/phone and password are required.' }, { status: 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
  const authResponse = await fetch(`${apiBaseUrl}/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
    cache: 'no-store',
  });

  const payload = await authResponse.json().catch(() => ({}));

  if (!authResponse.ok) {
    const message =
      typeof payload?.detail === 'string'
        ? payload.detail
        : typeof payload?.identifier?.[0] === 'string'
          ? payload.identifier[0]
          : 'Invalid credentials.';
    return NextResponse.json({ error: message }, { status: authResponse.status });
  }

  if (payload?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Only admin accounts can access the admin panel.' }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: ONE_DAY,
  });
  cookieStore.set('admin_access_token', payload.access, {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: ONE_DAY,
  });
  cookieStore.set('admin_refresh_token', payload.refresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: ONE_DAY * 7,
  });
  cookieStore.set('admin_email', payload.user.email, {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: ONE_DAY,
  });

  return NextResponse.json({ ok: true });
}
