import { redirect } from 'next/navigation';

import { buildLocalizedPath, getServerLocale } from '@/lib/i18n';

export default async function DevelopersRedirect() {
  const locale = await getServerLocale();
  redirect(buildLocalizedPath(locale, '/developers'));
}
