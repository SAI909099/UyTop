import { AdminDashboardOverview } from '@/components/dashboard/admin-dashboard-overview';
import {
  getApartmentsPage,
  getBuildingsPage,
  getCompaniesPage,
  getProjectsPage,
} from '@/lib/api/catalog';
import { getServerLocale, type LocaleCode } from '@/lib/i18n';
import type {
  ApiListResponse,
  CatalogApartment,
  CatalogBuilding,
  CatalogCompany,
  CatalogProject,
} from '@/types/api';

const PAGE_SIZE = 100;

const visibilityCopy: Record<LocaleCode, { public: string; private: string }> = {
  uz: {
    public: 'Ommaviy',
    private: 'Yopiq',
  },
  en: {
    public: 'Public',
    private: 'Private',
  },
  ru: {
    public: 'Публичный',
    private: 'Скрытый',
  },
};

const dashboardDataCopy: Record<
  LocaleCode,
  {
    companies: string;
    projects: string;
    buildings: string;
    apartments: string;
    projectNote: (count: number) => string;
    unassigned: string;
    unknown: string;
  }
> = {
  uz: {
    companies: 'Kompaniyalar',
    projects: 'Loyihalar',
    buildings: 'Binolar',
    apartments: 'Kvartiralar',
    projectNote: (count) => `${count} ta loyiha`,
    unassigned: 'Biriktirilmagan',
    unknown: 'Noma’lum',
  },
  en: {
    companies: 'Companies',
    projects: 'Projects',
    buildings: 'Buildings',
    apartments: 'Apartments',
    projectNote: (count) => `${count} projects`,
    unassigned: 'Unassigned',
    unknown: 'Unknown',
  },
  ru: {
    companies: 'Компании',
    projects: 'Проекты',
    buildings: 'Корпуса',
    apartments: 'Квартиры',
    projectNote: (count) => `${count} проектов`,
    unassigned: 'Не назначено',
    unknown: 'Неизвестно',
  },
};

function formatLabel(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: string | number, currency = 'USD') {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

async function loadAllPages<T>(loadPage: (page: number) => Promise<ApiListResponse<T>>) {
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

async function getDashboardSource() {
  const [companies, projects, buildings, apartments] = await Promise.all([
    loadAllPages<CatalogCompany>((page) => getCompaniesPage({ page, pageSize: PAGE_SIZE })),
    loadAllPages<CatalogProject>((page) => getProjectsPage({ page, pageSize: PAGE_SIZE })),
    loadAllPages<CatalogBuilding>((page) => getBuildingsPage({ page, pageSize: PAGE_SIZE })),
    loadAllPages<CatalogApartment>((page) => getApartmentsPage({ page, pageSize: PAGE_SIZE })),
  ]);

  return { companies, projects, buildings, apartments };
}

function buildStatusChart(apartments: CatalogApartment[]) {
  const counts = new Map<string, number>();

  apartments.forEach((apartment) => {
    const key = formatLabel(apartment.status);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 5);
}

function buildTopCompaniesChart(companies: CatalogCompany[], apartments: CatalogApartment[], locale: LocaleCode) {
  const copy = dashboardDataCopy[locale];
  const inventoryCounts = new Map<string, number>();
  const companyProjects = new Map<string, number>();

  companies.forEach((company) => {
    companyProjects.set(company.name, company.project_count ?? 0);
  });

  apartments.forEach((apartment) => {
    const companyName = apartment.company_name?.trim();
    if (!companyName) {
      return;
    }

    inventoryCounts.set(companyName, (inventoryCounts.get(companyName) ?? 0) + 1);
  });

  return [...inventoryCounts.entries()]
    .map(([label, value]) => ({
      label,
      value,
      note: copy.projectNote(companyProjects.get(label) ?? 0),
    }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 5);
}

function buildTableRows(apartments: CatalogApartment[], locale: LocaleCode) {
  const visibility = visibilityCopy[locale];
  const copy = dashboardDataCopy[locale];

  return [...apartments]
    .sort((left, right) => right.id - left.id)
    .slice(0, 8)
    .map((apartment) => ({
      apartment: apartment.title || apartment.apartment_number,
      project: apartment.project_name || apartment.building_name || copy.unassigned,
      company: apartment.company_name || copy.unknown,
      status: formatLabel(apartment.status),
      price: formatCurrency(apartment.price, apartment.currency),
      visibility: apartment.is_public ? visibility.public : visibility.private,
    }));
}

export default async function DashboardPage() {
  const locale = await getServerLocale();
  const copy = dashboardDataCopy[locale];
  const { companies, projects, buildings, apartments } = await getDashboardSource();

  return (
    <AdminDashboardOverview
      locale={locale}
      metrics={[
        { label: copy.companies, value: formatCompactNumber(companies.length) },
        { label: copy.projects, value: formatCompactNumber(projects.length) },
        { label: copy.buildings, value: formatCompactNumber(buildings.length) },
        { label: copy.apartments, value: formatCompactNumber(apartments.length) },
      ]}
      entityMix={[
        { label: copy.companies, value: companies.length },
        { label: copy.projects, value: projects.length },
        { label: copy.buildings, value: buildings.length },
        { label: copy.apartments, value: apartments.length },
      ]}
      apartmentStatuses={buildStatusChart(apartments)}
      topCompanies={buildTopCompaniesChart(companies, apartments, locale)}
      tableRows={buildTableRows(apartments, locale)}
    />
  );
}
