import { ApartmentMapExperience } from "@/components/developers/apartment-map-experience";
import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCatalogApartmentMap, getCatalogFeaturedDeveloper } from "@/lib/api/catalog";

export default async function ApartmentsPage() {
  const [apartments, developer] = await Promise.all([
    getCatalogApartmentMap(),
    getCatalogFeaturedDeveloper(),
  ]);

  return (
    <main className="shell-page">
      <div className="site-shell">
        <section className="page-intro premium-page-intro">
          <div>
            <p className="eyebrow">Apartment map</p>
            <h1>Search apartments on a live map with price pins.</h1>
            <p className="hero-lead">
              Each pin represents a public apartment from the developer catalog, with price-led scanning inspired by hotel search experiences.
            </p>
          </div>
          <PremiumCard className="intro-aside-card">
            <strong>{apartments.length}</strong>
            <p>Public apartments currently visible on the map.</p>
            {developer ? <ButtonLink href={`/developers/${developer.slug}`}>Open {developer.name}</ButtonLink> : null}
          </PremiumCard>
        </section>

        <section className="section-block">
          <SectionHeading
            eyebrow="Map browse"
            title="Apartment-level discovery with real coordinates"
            description="The map is now driven by backend apartment records, including price, room count, size, and building context."
          />
          <ApartmentMapExperience apartments={apartments} />
        </section>
      </div>
    </main>
  );
}
