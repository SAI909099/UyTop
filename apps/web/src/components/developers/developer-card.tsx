import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import {
  getCompanyApartmentsLeft,
  getCompanyProjectCount,
} from "@/lib/content/developers";
import { getDeveloperHref, getProjectHref } from "@/lib/utils/routing";
import type { DeveloperCompany } from "@/types/developers";

import { VerifiedBadge } from "./verified-badge";

type DeveloperCardProps = {
  developer: DeveloperCompany;
};

export function DeveloperCard({ developer }: DeveloperCardProps) {
  const flagshipProject = developer.projects[0];

  return (
    <PremiumCard className="developer-card">
      <div className="developer-card-image">
        <img src={developer.heroImage} alt={developer.name} />
      </div>
      <div className="developer-card-body">
        <div className="developer-card-topline">
          <div className="brand-lockup">
            <span className="brand-badge brand-badge-company">{developer.logoLettermark}</span>
            <div>
              <strong>{developer.logoWordmark}</strong>
              <span>{developer.headquarters}</span>
            </div>
          </div>
          {developer.verified ? <VerifiedBadge /> : null}
        </div>

        <div className="developer-card-copy">
          <p className="eyebrow">Developer company</p>
          <h3>{developer.name}</h3>
          <p>{developer.shortDescription}</p>
        </div>

        <div className="developer-stat-row">
          <div>
            <strong>{getCompanyProjectCount(developer)}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{getCompanyApartmentsLeft(developer)}</strong>
            <span>Apartments left</span>
          </div>
          <div>
            <strong>{developer.activeCities}</strong>
            <span>Active cities</span>
          </div>
        </div>

        <div className="developer-card-feature">
          <span>Flagship project</span>
          <strong>{flagshipProject.name}</strong>
          <small>{flagshipProject.locationLabel}</small>
        </div>

        <div className="card-actions">
          <ButtonLink href={getDeveloperHref(developer)}>Open company</ButtonLink>
          <ButtonLink href={getProjectHref(flagshipProject)} variant="secondary">
            View flagship project
          </ButtonLink>
        </div>
      </div>
    </PremiumCard>
  );
}
