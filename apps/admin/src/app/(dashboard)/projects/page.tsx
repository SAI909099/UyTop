import { ProjectManager } from '@/components/catalog/project-manager';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { getCatalogLookups, getCompanies, getProjects } from '@/lib/api/catalog';

export default async function ProjectsPage() {
  const [companies, projects, lookups] = await Promise.all([
    getCompanies(),
    getProjects(),
    getCatalogLookups(),
  ]);

  return (
    <div className="catalog-page-grid">
      <DashboardHeader
        eyebrow="Catalog"
        title="Project management"
        description="Attach each residential project to a company and fill in the project-level location, starting price, and delivery information."
      />
      <ProjectManager
        companies={companies.results}
        projects={projects.results}
        cities={lookups.cities}
        districts={lookups.districts}
      />
    </div>
  );
}
