import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  for (const key of ['admin_session', 'admin_access_token', 'admin_refresh_token', 'admin_email']) {
    cookieStore.delete(key);
  }

  return NextResponse.json({ ok: true });
}
