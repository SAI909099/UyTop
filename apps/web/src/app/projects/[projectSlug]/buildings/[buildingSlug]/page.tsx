import { notFound } from "next/navigation";

import { ApartmentBrowser } from "@/components/developers/apartment-browser";
import { AvailabilitySummary } from "@/components/developers/availability-summary";
import { BrandHero } from "@/components/developers/brand-hero";
import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCatalogBuildingBySlug } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/utils/format";
import { getDeveloperHref, getProjectHref } from "@/lib/utils/routing";

type BuildingPageProps = {
  params: Promise<{ projectSlug: string; buildingSlug: string }>;
};

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { projectSlug, buildingSlug } = await params;
  const lookup = await getCatalogBuildingBySlug(projectSlug, buildingSlug);

  if (!lookup) {
    notFound();
  }

  const { company, project, building } = lookup;

  return (
    <main className="shell-page">
      <div className="site-shell">
        <BrandHero
          eyebrow={`${project.name} / ${building.name}`}
          title={`${building.name} detail page`}
          description={building.summary}
          image={building.coverImage}
          imageAlt={building.name}
          caption={`${building.status} · Handover ${building.handover}`}
          badges={
            <>
              <span className="soft-pill">{building.status}</span>
              <span className="soft-pill">{building.roomTypes.join(" / ")}</span>
            </>
          }
          actions={
            <>
              <ButtonLink href={getProjectHref(project)}>Back to project</ButtonLink>
              <ButtonLink href={getDeveloperHref(company)} variant="secondary">
                Contact {company.name}
              </ButtonLink>
            </>
          }
          aside={
            <div className="brand-aside-card">
              <p className="eyebrow">Building {building.code}</p>
              <strong>{building.apartmentsLeft} apartments left</strong>
              <p>
                {formatCurrency(building.priceFrom)} - {formatCurrency(building.priceTo)}
              </p>
            </div>
          }
        />

        <section className="section-block">
          <AvailabilitySummary
            items={[
              { label: "Status", value: building.status, detail: `Handover ${building.handover}` },
              { label: "Total apartments", value: String(building.totalApartments), detail: "In this building" },
              { label: "Apartments left", value: String(building.apartmentsLeft), detail: "Visible inventory" },
              { label: "Price range", value: `${formatCurrency(building.priceFrom)} - ${formatCurrency(building.priceTo)}`, detail: building.areaRange },
            ]}
          />
        </section>

        <section className="section-block building-detail-grid">
          <div className="project-gallery-grid">
            {building.gallery.map((image, index) => (
              <img key={`${building.id}-${index}`} src={image} alt={building.name} />
            ))}
          </div>

          <PremiumCard className="narrative-card">
            <p className="eyebrow">Room types</p>
            <h3>{building.roomTypes.join(", ")}</h3>
            <p>
              This building keeps its own availability, room mix, and apartment-type plans visible so buyers can compare
              inventory without jumping back to generic listing results.
            </p>
            <div className="room-pill-list">
              {building.roomTypes.map((roomType) => (
                <span key={roomType} className="room-pill">
                  {roomType}
                </span>
              ))}
            </div>
          </PremiumCard>
        </section>

        <section className="section-block">
          <SectionHeading
            eyebrow="Apartment types"
            title="Open apartment photos, layouts, room count, square meter, and price"
            description="Cards stay visible for scanning while the modal reveals the richer plan and inventory view."
          />
          <ApartmentBrowser apartments={building.apartmentTypes} buildingName={building.name} projectName={project.name} />
        </section>

        <section className="section-block">
          <PremiumCard className="cta-strip">
            <div>
              <p className="eyebrow">Contact and booking</p>
              <h3>Book a visit or request the current price sheet</h3>
              <p>
                The page keeps the final action simple: stay in the building context, review the apartment types,
                then contact the developer team when you are ready.
              </p>
            </div>
            <div className="hero-actions">
              <ButtonLink href={getDeveloperHref(company)}>Contact {company.name}</ButtonLink>
              <ButtonLink href={getProjectHref(project)} variant="secondary">
                View all buildings
              </ButtonLink>
            </div>
          </PremiumCard>
        </section>
      </div>
    </main>
  );
}
