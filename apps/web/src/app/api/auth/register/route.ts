import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { extractErrorMessage, normalizeFieldErrors, type AuthResponse } from '@/lib/auth';
import { registerWithBackend } from '@/lib/auth-api';
import { getRequestLocaleFromRequest, setAuthCookies } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email = String(body.email ?? '').trim();
    const phoneNumber = String(body.phone_number ?? '').trim();
    const password = String(body.password ?? '');
    const firstName = String(body.first_name ?? '').trim();
    const lastName = String(body.last_name ?? '').trim();

    if (!email || !phoneNumber || !password) {
      return NextResponse.json(
        {
          error: 'Registration data is incomplete.',
          fieldErrors: {
            ...(email ? {} : { email: 'Required.' }),
            ...(phoneNumber ? {} : { phone_number: 'Required.' }),
            ...(password ? {} : { password: 'Required.' }),
          },
        },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const locale = getRequestLocaleFromRequest(request, cookieStore);
    const { response, payload } = await registerWithBackend(
      {
        email,
        phone_number: phoneNumber,
        password,
        first_name: firstName,
        last_name: lastName,
      },
      locale,
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractErrorMessage(payload, 'Failed to create account.'),
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
