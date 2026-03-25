import { ApartmentManager } from '@/components/catalog/apartment-manager';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { getApartments, getCatalogLookups } from '@/lib/api/catalog';

export default async function ApartmentsPage() {
  const [apartments, lookups] = await Promise.all([
    getApartments(),
    getCatalogLookups(),
  ]);

  return (
    <div className="catalog-page-grid">
      <DashboardHeader
        eyebrow="Catalog"
        title="Apartment management"
        description="Upload apartment media, assign payment options, and place each public apartment on the map for the buyer-facing search experience."
      />
      <ApartmentManager
        apartments={apartments.results}
        buildings={lookups.buildings}
        cities={lookups.cities}
        districts={lookups.districts}
        paymentOptions={lookups.payment_options}
        statuses={lookups.apartment_statuses}
      />
    </div>
  );
}
