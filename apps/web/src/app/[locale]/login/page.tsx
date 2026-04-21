import { redirect } from 'next/navigation';

import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getVerifiedServerAuthUser } from '@/lib/auth-server';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const authUser = await getVerifiedServerAuthUser();

  if (authUser) {
    redirect(buildLocalizedPath(locale, '/'));
  }

  return (
    <AuthPageShell locale={locale} mode="login">
      <LoginForm locale={locale} />
    </AuthPageShell>
  );
}
