import { notFound } from "next/navigation";

import { AvailabilitySummary } from "@/components/developers/availability-summary";
import { BrandHero } from "@/components/developers/brand-hero";
import { ProjectCard } from "@/components/developers/project-card";
import { StylizedMap } from "@/components/developers/stylized-map";
import { VerifiedBadge } from "@/components/developers/verified-badge";
import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getCompanyApartmentsLeft,
  getCompanyMapPins,
  getCompanyProjectCount,
} from "@/lib/content/developers";
import { getCatalogDeveloperBySlug } from "@/lib/api/catalog";
import { formatCompactNumber } from "@/lib/utils/format";
import { getProjectHref } from "@/lib/utils/routing";

type CompanyPageProps = {
  params: Promise<{ companySlug: string }>;
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companySlug } = await params;
  const company = await getCatalogDeveloperBySlug(companySlug);

  if (!company) {
    notFound();
  }

  const flagshipProject = company.projects[0];

  return (
    <main className="shell-page">
      <div className="site-shell">
        <BrandHero
          eyebrow="Developer company"
          title={`${company.name} company profile`}
          description={company.description}
          image={company.heroImage}
          imageAlt={company.name}
          caption={company.tagline}
          badges={
            <>
              {company.verified ? <VerifiedBadge /> : null}
              <span className="soft-pill">{getCompanyProjectCount(company)} active projects</span>
            </>
          }
          actions={
            <>
              <ButtonLink href={getProjectHref(flagshipProject)}>Explore projects</ButtonLink>
              <ButtonLink href="/developers" variant="secondary">
                Back to developers
              </ButtonLink>
            </>
          }
          aside={
            <div className="brand-aside-card">
              <div className="brand-lockup">
                <span className="brand-badge brand-badge-company">{company.logoLettermark}</span>
                <div>
                  <strong>{company.logoWordmark}</strong>
                  <span>{company.headquarters}</span>
                </div>
              </div>
              <p>{company.trustNote}</p>
            </div>
          }
        />

        <section className="section-block">
          <AvailabilitySummary
            items={[
              { label: "Projects", value: String(getCompanyProjectCount(company)), detail: "Live on UyTop" },
              { label: "Homes delivered", value: formatCompactNumber(company.homesDelivered), detail: "Since launch" },
              { label: "Apartments left", value: String(getCompanyApartmentsLeft(company)), detail: "Across all visible buildings" },
              { label: "Founded", value: String(company.foundedYear), detail: "Headquartered in Tashkent" },
            ]}
          />
        </section>

        <section className="section-block company-detail-grid">
          <PremiumCard className="narrative-card">
            <p className="eyebrow">About the company</p>
            <h3>Brand identity and trust posture</h3>
            <p>{company.shortDescription}</p>
            <p>{company.trustNote}</p>
          </PremiumCard>

          <StylizedMap
            eyebrow="Project map"
            title="All Dream House project locations"
            description="Each pin represents a project that can be opened into its own building-level availability flow."
            pins={getCompanyMapPins(company)}
            summary={
            <div className="map-summary-stack">
              <strong>{company.name}</strong>
              <p>{company.projects.length} residential projects currently visible on UyTop.</p>
              <ButtonLink href="/apartments" variant="secondary">Open apartment map</ButtonLink>
            </div>
          }
        />
        </section>

        <section className="section-block">
          <SectionHeading
            eyebrow="Projects"
            title={`Residential projects by ${company.name}`}
            description="Every project card keeps location, starting price, and building availability summary visible before you drill into the detail page."
          />

          <div className="project-grid">
            {company.projects.map((project) => (
              <ProjectCard key={project.id} company={company} project={project} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
