import { redirect } from 'next/navigation';

import { buildLocalizedPath, getServerLocale } from '@/lib/i18n';

type BuildingDetailRedirectProps = {
  params: Promise<{
    projectSlug: string;
    buildingSlug: string;
  }>;
};

export default async function BuildingDetailRedirect({ params }: BuildingDetailRedirectProps) {
  const locale = await getServerLocale();
  const { buildingSlug, projectSlug } = await params;
  redirect(buildLocalizedPath(locale, `/projects/${projectSlug}/buildings/${buildingSlug}`));
}
