import { redirect } from 'next/navigation';

import { buildLocalizedPath, getServerLocale } from '@/lib/i18n';

type ApartmentDetailRedirectProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ApartmentDetailRedirect({ params }: ApartmentDetailRedirectProps) {
  const locale = await getServerLocale();
  const { slug } = await params;
  redirect(buildLocalizedPath(locale, `/apartments/${slug}`));
}
