import { BuildingManager } from '@/components/catalog/building-manager';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { getBuildings, getCatalogLookups } from '@/lib/api/catalog';

export default async function BuildingsPage() {
  const [buildings, lookups] = await Promise.all([
    getBuildings(),
    getCatalogLookups(),
  ]);

  return (
    <div className="catalog-page-grid">
      <DashboardHeader
        eyebrow="Catalog"
        title="Building management"
        description="Create each building under its project and define availability-ready metadata like handover, floors, and price range."
      />
      <BuildingManager
        projects={lookups.projects}
        buildings={buildings.results}
        statuses={lookups.building_statuses}
      />
    </div>
  );
}
