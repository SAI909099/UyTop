import { redirect } from 'next/navigation';

import { buildLocalizedPath, getServerLocale } from '@/lib/i18n';

type DeveloperProfileRedirectProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DeveloperProfileRedirect({ params }: DeveloperProfileRedirectProps) {
  const locale = await getServerLocale();
  const { slug } = await params;
  redirect(buildLocalizedPath(locale, `/developers/${slug}`));
}
