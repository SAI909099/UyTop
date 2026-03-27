import { DeveloperHub } from '@/components/developers/developer-hub';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicCompanies, getPublicCompanyDetail } from '@/lib/api/public';
import type { DeveloperHubCompany, PublicCompany } from '@/types/home';

function sortCompanies(companies: PublicCompany[]) {
  return [...companies].sort((left, right) => {
    if (left.is_verified !== right.is_verified) {
      return Number(right.is_verified) - Number(left.is_verified);
    }

    if (left.project_count !== right.project_count) {
      return right.project_count - left.project_count;
    }

    return right.apartment_count - left.apartment_count;
  });
}

function getExperienceYears(foundedYear: number | null, currentYear: number) {
  if (!foundedYear || foundedYear > currentYear) {
    return null;
  }

  const experienceYears = currentYear - foundedYear;
  return experienceYears > 0 ? experienceYears : null;
}

async function getDeveloperHubCompanies(): Promise<DeveloperHubCompany[]> {
  let companies: PublicCompany[] = [];

  try {
    const response = await getPublicCompanies();
    companies = sortCompanies(response.results);
  } catch {
    return [];
  }

  const currentYear = new Date().getUTCFullYear();
  const detailResults = await Promise.allSettled(companies.map((company) => getPublicCompanyDetail(company.slug)));

  return companies.map((company, index) => {
    const detail = detailResults[index];
    const foundedYear = detail?.status === 'fulfilled' ? detail.value.founded_year : null;

    return {
      ...company,
      founded_year: foundedYear,
      experience_years: getExperienceYears(foundedYear, currentYear),
    };
  });
}

export default async function DeveloperHubPage() {
  const companies = await getDeveloperHubCompanies();

  return (
    <>
      <HomePrimaryNav ctaHref="/map" ctaLabel="Open live map" />
      <DeveloperHub companies={companies} />
    </>
  );
}
