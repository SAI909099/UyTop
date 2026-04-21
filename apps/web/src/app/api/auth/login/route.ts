import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { extractErrorMessage, normalizeFieldErrors, type AuthResponse } from '@/lib/auth';
import { loginWithBackend } from '@/lib/auth-api';
import { getRequestLocaleFromRequest, setAuthCookies } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const identifier = String(body.identifier ?? '').trim();
    const password = String(body.password ?? '');

    if (!identifier || !password) {
      return NextResponse.json(
        {
          error: 'Authentication data is incomplete.',
          fieldErrors: {
            ...(identifier ? {} : { identifier: 'Required.' }),
            ...(password ? {} : { password: 'Required.' }),
          },
        },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const locale = getRequestLocaleFromRequest(request, cookieStore);
    const { response, payload } = await loginWithBackend(identifier, password, locale);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractErrorMessage(payload, 'Failed to sign in.'),
          fieldErrors: normalizeFieldErrors(payload),
        },
        { status: response.status },
      );
    }

    setAuthCookies(cookieStore, payload as AuthResponse);
    return NextResponse.json({ ok: true, user: (payload as AuthResponse).user });
  } catch {
    return NextResponse.json({ error: 'Authentication service is unavailable.' }, { status: 502 });
  }
}
