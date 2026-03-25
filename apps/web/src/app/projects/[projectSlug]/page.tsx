import { notFound } from "next/navigation";

import { AvailabilitySummary } from "@/components/developers/availability-summary";
import { BrandHero } from "@/components/developers/brand-hero";
import { BuildingCard } from "@/components/developers/building-card";
import { StylizedMap } from "@/components/developers/stylized-map";
import { VerifiedBadge } from "@/components/developers/verified-badge";
import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProjectApartmentCount, getProjectApartmentsLeft } from "@/lib/content/developers";
import { getCatalogProjectBySlug } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/utils/format";
import { getDeveloperHref, getBuildingHref } from "@/lib/utils/routing";

type ProjectPageProps = {
  params: Promise<{ projectSlug: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectSlug } = await params;
  const lookup = await getCatalogProjectBySlug(projectSlug);

  if (!lookup) {
    notFound();
  }

  const { company, project } = lookup;
  const leadBuilding = project.buildings[0];

  return (
    <main className="shell-page">
      <div className="site-shell">
        <BrandHero
          eyebrow={`${company.name} project`}
          title={project.name}
          description={project.headline}
          image={project.heroImage}
          imageAlt={project.name}
          caption={project.locationLabel}
          badges={
            <>
              <VerifiedBadge />
              <span className="soft-pill">{project.deliveryWindow}</span>
            </>
          }
          actions={
            <>
              <ButtonLink href={getBuildingHref(project, leadBuilding)}>Open Building A</ButtonLink>
              <ButtonLink href={getDeveloperHref(company)} variant="secondary">
                Back to company
              </ButtonLink>
            </>
          }
          aside={
            <div className="brand-aside-card">
              <p className="eyebrow">Starting from</p>
              <strong>{formatCurrency(project.startingPrice, project.currency)}</strong>
              <p>{project.availabilitySummary}</p>
            </div>
          }
        />

        <section className="section-block">
          <AvailabilitySummary
            items={[
              { label: "Starting price", value: formatCurrency(project.startingPrice, project.currency), detail: "Project entry price" },
              { label: "Buildings", value: String(project.buildings.length), detail: "Separate release blocks" },
              { label: "Total apartments", value: String(getProjectApartmentCount(project)), detail: "Across all buildings" },
              { label: "Apartments left", value: String(getProjectApartmentsLeft(project)), detail: "Available right now" },
            ]}
          />
        </section>

        <section className="section-block project-detail-grid">
          <div className="project-gallery-grid">
            {project.gallery.map((image, index) => (
              <img key={`${project.id}-${index}`} src={image} alt={project.name} />
            ))}
          </div>

          <PremiumCard className="narrative-card">
            <p className="eyebrow">Project overview</p>
            <h3>{project.locationLabel}</h3>
            <p>{project.description}</p>
            <p>{project.address}</p>
          </PremiumCard>
        </section>

        <section className="section-block company-detail-grid">
          <StylizedMap
            eyebrow="Location map"
            title="Project location"
            description="The map shows the project position in its city context while the page keeps all building-level information within easy reach."
            pins={project.mapPins}
            summary={
              <div className="map-summary-stack">
                <strong>{project.name}</strong>
                <p>{project.address}</p>
                <span className="soft-pill">{project.availabilitySummary}</span>
                <ButtonLink href="/apartments" variant="secondary">Browse apartments on map</ButtonLink>
              </div>
            }
          />

          <PremiumCard className="narrative-card">
            <p className="eyebrow">Availability summary</p>
            <h3>Buildings A, B, and C</h3>
            <p>
              Each building has its own price range, apartments-left count, and apartment type mix. Buyers can move
              from this project overview into a building-specific page without losing pricing context.
            </p>
          </PremiumCard>
        </section>

        <section className="section-block">
          <SectionHeading
            eyebrow="Buildings"
            title="Explore each building separately"
            description="Every building card shows its own price range, apartment count, and room-type mix before you open the apartment-type explorer."
          />
          <div className="building-grid">
            {project.buildings.map((building) => (
              <BuildingCard key={building.id} project={project} building={building} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
