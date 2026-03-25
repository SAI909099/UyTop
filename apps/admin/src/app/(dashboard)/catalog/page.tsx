import Link from 'next/link';

import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card } from '@/components/ui/card';
import { getApartments, getBuildings, getCompanies, getProjects } from '@/lib/api/catalog';

export default async function CatalogOverviewPage() {
  const [companies, projects, buildings, apartments] = await Promise.all([
    getCompanies(),
    getProjects(),
    getBuildings(),
    getApartments(),
  ]);

  const stats = [
    { label: 'Companies', value: companies.count, href: '/companies' },
    { label: 'Projects', value: projects.count, href: '/projects' },
    { label: 'Buildings', value: buildings.count, href: '/buildings' },
    { label: 'Apartments', value: apartments.count, href: '/apartments' },
  ];

  return (
    <div className="catalog-page-grid">
      <DashboardHeader
        eyebrow="Catalog workspace"
        title="Developer upload workspace"
        description="Create companies, projects, buildings, and apartments, then push public apartments onto the map experience."
      />

      <section className="catalog-stats-grid">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="catalog-stat-card">
              <p>{stat.label}</p>
              <h2>{stat.value}</h2>
              <Link href={stat.href}>Open {stat.label.toLowerCase()}</Link>
            </div>
          </Card>
        ))}
      </section>

      <Card>
        <div className="catalog-overview-list">
          <div>
            <strong>1. Create the company</strong>
            <p>Start with the developer company profile, logo, hero image, trust note, and brand description.</p>
          </div>
          <div>
            <strong>2. Add the project and buildings</strong>
            <p>Attach each project to a company, then add buildings with handover, prices, and floor totals.</p>
          </div>
          <div>
            <strong>3. Add apartments and map location</strong>
            <p>Upload apartment media, set payment options, and place each public apartment on the map with coordinates.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
