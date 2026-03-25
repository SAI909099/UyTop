import { AvailabilitySummary } from "@/components/developers/availability-summary";
import { BuildingCard } from "@/components/developers/building-card";
import { DeveloperCard } from "@/components/developers/developer-card";
import { ProjectCard } from "@/components/developers/project-card";
import { StylizedMap } from "@/components/developers/stylized-map";
import { VerifiedBadge } from "@/components/developers/verified-badge";
import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCompanyApartmentsLeft, getCompanyMapPins } from "@/lib/content/developers";
import { getCatalogDevelopers, getCatalogFeaturedDeveloper, getCatalogFeaturedProject } from "@/lib/api/catalog";
import { formatCompactNumber } from "@/lib/utils/format";
import { getDeveloperHref, getProjectHref } from "@/lib/utils/routing";

const hierarchySteps = [
  {
    title: "Developer Company",
    description: "Begin with the brand, trust layer, delivery story, and all active projects in one place.",
  },
  {
    title: "Project",
    description: "Compare location, gallery, map, starting price, and availability summary before drilling deeper.",
  },
  {
    title: "Building",
    description: "Inspect Buildings A, B, and C separately with their own inventory, pricing band, and status.",
  },
  {
    title: "Apartment Types",
    description: "Open card-level layouts and photos without losing the building context or pricing hierarchy.",
  },
];

export default async function HomePage() {
  const developers = await getCatalogDevelopers();
  const featuredDeveloper = await getCatalogFeaturedDeveloper();
  const featuredProjectLookup = await getCatalogFeaturedProject();

  if (!featuredDeveloper || !featuredProjectLookup) {
    return null;
  }

  const { project: featuredProject } = featuredProjectLookup;

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="site-shell landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="eyebrow">Developer-led discovery</p>
            <div className="inline-badges">
              <VerifiedBadge />
              <span className="soft-pill">Projects, buildings, and apartment types in one premium flow</span>
            </div>
            <h1>Discover residential projects through the people who build them.</h1>
            <p className="hero-lead">
              UyTop now organizes discovery around real decision hierarchy: developer company, project, building,
              and apartment types. Buyers get trust signals, inventory visibility, and branded context from the
              first screen.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/developers">Explore developers</ButtonLink>
              <ButtonLink href="/apartments" variant="ghost">
                Apartment map
              </ButtonLink>
              <ButtonLink href={getDeveloperHref(featuredDeveloper)} variant="secondary">
                Open Dream House
              </ButtonLink>
            </div>

            <AvailabilitySummary
              items={[
                { label: "Verified developers", value: String(developers.length), detail: "Curated company profiles" },
                {
                  label: "Dream House inventory",
                  value: String(getCompanyApartmentsLeft(featuredDeveloper)),
                  detail: "Apartments currently visible",
                },
                {
                  label: "Homes delivered",
                  value: formatCompactNumber(featuredDeveloper.homesDelivered),
                  detail: "Across the active portfolio",
                },
              ]}
              className="landing-metric-grid"
            />
          </div>

          <div className="landing-hero-visual">
            <div className="hero-visual-main">
              <img src={featuredDeveloper.heroImage} alt={featuredDeveloper.name} />
            </div>

            <PremiumCard className="floating-brand-card">
              <div className="brand-lockup">
                <span className="brand-badge brand-badge-company">{featuredDeveloper.logoLettermark}</span>
                <div>
                  <strong>{featuredDeveloper.logoWordmark}</strong>
                  <span>{featuredDeveloper.tagline}</span>
                </div>
              </div>
              <div className="floating-card-divider" />
              <p className="eyebrow">Flagship project</p>
              <h3>{featuredProject.name}</h3>
              <p>{featuredProject.availabilitySummary}</p>
              <ButtonLink href={getProjectHref(featuredProject)} variant="secondary">
                Explore Riverside Signature
              </ButtonLink>
            </PremiumCard>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Developer directory"
            title="Premium developer profiles, not generic listing feeds"
            description="Each company card surfaces brand identity, trust, live project counts, and the next action into the deeper project flow."
          />
          <div className="developer-grid">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Dream House spotlight"
            title="A flagship residential launch designed around comparison and trust"
            description="The featured company path shows how users move from brand trust into project-level clarity and building-level inventory."
          />

          <div className="spotlight-layout">
            <ProjectCard company={featuredDeveloper} project={featuredProject} />
            <div className="building-grid building-grid-compact">
              {featuredProject.buildings.map((building) => (
                <BuildingCard key={building.id} project={featuredProject} building={building} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <div className="hierarchy-strip">
            {hierarchySteps.map((step, index) => (
              <PremiumCard key={step.title} className="hierarchy-card">
                <span className="hierarchy-index">0{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <StylizedMap
            eyebrow="Location view"
            title="Dream House project footprint across the city"
            description="The map layer stays realistic and launch-ready, while still focusing attention on project cards, brand identity, and inventory visibility."
            pins={getCompanyMapPins(featuredDeveloper)}
            summary={
              <div className="map-summary-stack">
                <strong>{featuredDeveloper.name}</strong>
                <p>{featuredDeveloper.trustNote}</p>
                <ButtonLink href={getDeveloperHref(featuredDeveloper)}>Open company profile</ButtonLink>
              </div>
            }
          />
        </div>
      </section>
    </main>
  );
}
