import { redirect } from 'next/navigation';

import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { getVerifiedServerAuthUser } from '@/lib/auth-server';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

type RegisterPageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  const authUser = await getVerifiedServerAuthUser();

  if (authUser) {
    redirect(buildLocalizedPath(locale, '/'));
  }

  return (
    <AuthPageShell locale={locale} mode="register">
      <RegisterForm locale={locale} />
    </AuthPageShell>
  );
}
