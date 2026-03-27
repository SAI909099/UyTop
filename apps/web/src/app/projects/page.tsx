import { HomePrimaryNav } from "@/components/home/home-nav";
import { ProjectHub } from "@/components/projects/project-hub";
import {
  getPublicCatalogLookups,
  getPublicCompaniesPage,
  getPublicProjects,
} from "@/lib/api/public";
import type {
  PaginatedResponse,
  ProjectPriceBounds,
  PublicCatalogLookups,
  PublicCompany,
  PublicProject,
} from "@/types/home";

const PAGE_SIZE = 100;

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

export default async function ProjectsPage() {
  const [projects, companies, lookups] = await Promise.allSettled([
    loadProjects(),
    loadCompanies(),
    getPublicCatalogLookups(),
  ]);

  const projectResults = projects.status === "fulfilled" ? sortProjects(projects.value) : [];
  const companyResults = companies.status === "fulfilled" ? sortCompanies(companies.value) : [];
  const lookupResults = lookups.status === "fulfilled" ? lookups.value : emptyLookups();

  return (
    <>
      <HomePrimaryNav ctaHref="/map" ctaLabel="Open live map" />
      <ProjectHub
        projects={projectResults}
        companies={companyResults}
        deliveryYears={lookupResults.project_delivery_years}
        priceBounds={lookupResults.project_price_bounds as ProjectPriceBounds}
        roomCounts={lookupResults.project_room_counts}
      />
    </>
  );
}
