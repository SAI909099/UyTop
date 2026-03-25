import { cookies } from 'next/headers';

export type AdminSession = {
  email: string;
  role: 'admin';
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const bypassEnabled = process.env.ADMIN_BYPASS_AUTH === 'true';
  const token = cookieStore.get('admin_session');
  const email = cookieStore.get('admin_email')?.value;

  if (token?.value && email) {
    return {
      email,
      role: 'admin',
    };
  }

  if (bypassEnabled) {
    return {
      email: 'dev-admin@uytop.local',
      role: 'admin',
    };
  }

  return null;
}
