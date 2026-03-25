import { DeveloperCard } from "@/components/developers/developer-card";
import { VerifiedBadge } from "@/components/developers/verified-badge";
import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCatalogDevelopers, getCatalogFeaturedDeveloper } from "@/lib/api/catalog";
import { getDeveloperHref } from "@/lib/utils/routing";

export default async function DevelopersPage() {
  const developers = await getCatalogDevelopers();
  const featuredDeveloper = await getCatalogFeaturedDeveloper();

  return (
    <main className="shell-page">
      <div className="site-shell">
        <section className="page-intro premium-page-intro">
          <div>
            <p className="eyebrow">Developers</p>
            <h1>Explore residential brands with verified project portfolios.</h1>
            <p className="hero-lead">
              Compare developer identity, live project count, and active inventory before you open a single
              building.
            </p>
          </div>
          {featuredDeveloper ? (
            <PremiumCard className="intro-aside-card">
              <VerifiedBadge />
              <h3>{featuredDeveloper.name}</h3>
              <p>{featuredDeveloper.shortDescription}</p>
              <ButtonLink href={getDeveloperHref(featuredDeveloper)}>Open Dream House</ButtonLink>
            </PremiumCard>
          ) : null}
        </section>

        <section className="section-block">
          <SectionHeading
            eyebrow="Company listing"
            title={`${developers.length} premium developer profiles ready to explore`}
            description="The listing page keeps the first decision simple: choose the developer brand that matches the product style, trust posture, and location footprint you want."
          />
          <div className="developer-grid">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
