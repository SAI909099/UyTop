import { DeveloperHub } from '@/components/developers/developer-hub';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicCompaniesPage } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import type { PaginatedResponse, PublicCompany } from '@/types/home';

const PAGE_SIZE = 100;

type DeveloperHubPageProps = {
  params: Promise<{
    locale: LocaleCode;
  }>;
};

const ctaLabels: Record<LocaleCode, string> = {
  uz: 'Jonli xarita',
  en: 'Open live map',
  ru: 'Открыть карту',
};

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

async function getDeveloperHubCompanies(): Promise<PublicCompany[]> {
  try {
    const companies = await loadAllPages((page) => getPublicCompaniesPage({ page, pageSize: PAGE_SIZE }));
    return sortCompanies(companies);
  } catch {
    return [];
  }
}

export default async function DeveloperHubPage({ params }: DeveloperHubPageProps) {
  const { locale } = await params;
  const companies = await getDeveloperHubCompanies();

  return (
    <>
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={ctaLabels[locale]}
      />
      <DeveloperHub locale={locale} companies={companies} />
    </>
  );
}
