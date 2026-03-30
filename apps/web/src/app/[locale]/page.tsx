import { HomeLanding } from '@/components/home/home-landing';
import { getHomepageData } from '@/lib/api/public';
import type { LocaleCode, PublicProject } from '@/types/home';

type HomePageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
};

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function sortProjects(projects: PublicProject[]) {
  return [...projects].sort((left, right) => {
    if (left.building_count !== right.building_count) {
      return right.building_count - left.building_count;
    }

    const priceDifference = numeric(right.starting_price) - numeric(left.starting_price);
    if (priceDifference !== 0) {
      return priceDifference;
    }

    return left.name.localeCompare(right.name);
  });
}

export default async function LocalizedHomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const { companiesCount, projects, projectsCount, showcaseApartmentsCount } = await getHomepageData();

  const featuredProjects = sortProjects(projects).slice(0, 3);
  const totalPublishedApartments = showcaseApartmentsCount;
  const averageProjectEntry =
    featuredProjects.length > 0
      ? Math.round(featuredProjects.reduce((sum, project) => sum + numeric(project.starting_price), 0) / featuredProjects.length)
      : 0;
  const liveAreas = new Set(
    featuredProjects.map((project) => project.district?.name ?? project.city.name).filter(Boolean),
  ).size;

  return (
    <HomeLanding
      locale={locale}
      companiesCount={companiesCount}
      projectsCount={projectsCount}
      totalPublishedApartments={totalPublishedApartments}
      liveAreas={liveAreas}
      averageProjectEntry={averageProjectEntry}
      featuredProjects={featuredProjects}
    />
  );
}
