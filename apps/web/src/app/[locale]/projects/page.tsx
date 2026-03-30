import { HomePrimaryNav } from '@/components/home/home-nav';
import { ProjectHub } from '@/components/projects/project-hub';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import {
  getPublicBuildings,
  getPublicCatalogLookups,
  getPublicCompaniesPage,
  getPublicProjects,
} from '@/lib/api/public';
import type {
  PublicBuildingSummary,
  PaginatedResponse,
  ProjectPriceBounds,
  PublicCatalogLookups,
  PublicCompany,
  PublicProject,
} from '@/types/home';

const PAGE_SIZE = 100;

type ProjectsPageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ctaLabels: Record<LocaleCode, string> = {
  uz: 'Jonli xarita',
  en: 'Open live map',
  ru: 'Открыть карту',
};

function emptyLookups(): PublicCatalogLookups {
  return {
    project_delivery_years: [],
    project_price_bounds: { min: 0, max: 0 },
    project_room_counts: [],
  };
}

async function loadAllPages<T>(loadPage: (page: number) => Promise<PaginatedResponse<T>>) {
  const firstPage = await loadPage(1);
  const totalPages = Math.max(1, Math.ceil(firstPage.count / PAGE_SIZE));

  if (totalPages === 1) {
    return firstPage.results;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => loadPage(index + 2)),
  );

  return firstPage.results.concat(remainingPages.flatMap((page) => page.results));
}

async function loadProjects(): Promise<PublicProject[]> {
  try {
    return await loadAllPages((page) => getPublicProjects({ page, pageSize: PAGE_SIZE }));
  } catch {
    return [];
  }
}

async function loadCompanies(): Promise<PublicCompany[]> {
  try {
    return await loadAllPages((page) => getPublicCompaniesPage({ page, pageSize: PAGE_SIZE }));
  } catch {
    return [];
  }
}

async function loadBuildings(): Promise<PublicBuildingSummary[]> {
  try {
    return await loadAllPages((page) => getPublicBuildings({ page, pageSize: PAGE_SIZE }));
  } catch {
    return [];
  }
}

function sortCompanies(companies: PublicCompany[]) {
  return [...companies].sort((left, right) => {
    if (left.is_verified !== right.is_verified) {
      return Number(right.is_verified) - Number(left.is_verified);
    }

    if (left.project_count !== right.project_count) {
      return right.project_count - left.project_count;
    }

    return left.name.localeCompare(right.name);
  });
}

function sortProjects(projects: PublicProject[]) {
  return [...projects].sort((left, right) => {
    if (left.building_count !== right.building_count) {
      return right.building_count - left.building_count;
    }

    const priceDifference = Number(right.starting_price) - Number(left.starting_price);
    if (priceDifference !== 0) {
      return priceDifference;
    }

    return left.name.localeCompare(right.name);
  });
}

function buildProjectCtaTargets(buildings: PublicBuildingSummary[]) {
  const sortedBuildings = [...buildings].sort((left, right) => {
    const leftLabel = `${left.code} ${left.name}`.trim();
    const rightLabel = `${right.code} ${right.name}`.trim();
    const labelDifference = leftLabel.localeCompare(rightLabel);

    if (labelDifference !== 0) {
      return labelDifference;
    }

    return left.id - right.id;
  });

  return sortedBuildings.reduce<Record<number, { buildingSlug: string; buildingName: string }>>((targets, building) => {
    if (targets[building.project]) {
      return targets;
    }

    targets[building.project] = {
      buildingSlug: building.slug,
      buildingName: building.name.trim() || building.code.trim() || building.slug,
    };

    return targets;
  }, {});
}

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const initialCompanyFilter = Array.isArray(resolvedSearchParams.company)
    ? resolvedSearchParams.company[0]
    : resolvedSearchParams.company;
  const [projects, companies, lookups, buildings] = await Promise.allSettled([
    loadProjects(),
    loadCompanies(),
    getPublicCatalogLookups(),
    loadBuildings(),
  ]);

  const projectResults = projects.status === 'fulfilled' ? sortProjects(projects.value) : [];
  const companyResults = companies.status === 'fulfilled' ? sortCompanies(companies.value) : [];
  const lookupResults = lookups.status === 'fulfilled' ? lookups.value : emptyLookups();
  const projectCtaTargets = buildings.status === 'fulfilled' ? buildProjectCtaTargets(buildings.value) : {};

  return (
    <>
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={ctaLabels[locale]}
      />
      <ProjectHub
        locale={locale}
        projects={projectResults}
        companies={companyResults}
        deliveryYears={lookupResults.project_delivery_years}
        priceBounds={lookupResults.project_price_bounds as ProjectPriceBounds}
        roomCounts={lookupResults.project_room_counts}
        projectCtaTargets={projectCtaTargets}
        initialCompanyFilter={initialCompanyFilter}
      />
    </>
  );
}
