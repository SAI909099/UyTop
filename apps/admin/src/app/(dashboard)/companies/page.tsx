import { CompanyManager } from '@/components/catalog/company-manager';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { getCompanies } from '@/lib/api/catalog';

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="catalog-page-grid">
      <DashboardHeader
        eyebrow="Catalog"
        title="Company management"
        description="Create the developer company first, then use it as the parent for projects, buildings, and apartments."
      />
      <CompanyManager companies={companies.results} />
    </div>
  );
}
