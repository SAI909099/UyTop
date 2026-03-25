import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { getProjectApartmentsLeft } from "@/lib/content/developers";
import { formatCurrency } from "@/lib/utils/format";
import { getProjectHref } from "@/lib/utils/routing";
import type { DeveloperCompany, DeveloperProject } from "@/types/developers";

import { VerifiedBadge } from "./verified-badge";

type ProjectCardProps = {
  company: DeveloperCompany;
  project: DeveloperProject;
  showCompany?: boolean;
};

export function ProjectCard({ company, project, showCompany = false }: ProjectCardProps) {
  return (
    <PremiumCard className="project-card">
      <div className="project-card-image">
        <img src={project.heroImage} alt={project.name} />
      </div>
      <div className="project-card-body">
        <div className="project-card-topline">
          <p>{project.locationLabel}</p>
          {company.verified ? <VerifiedBadge label="Verified" /> : null}
        </div>
        <h3>{project.name}</h3>
        <p>{project.headline}</p>

        <div className="project-card-metrics">
          <div>
            <span>Starting from</span>
            <strong>{formatCurrency(project.startingPrice, project.currency)}</strong>
          </div>
          <div>
            <span>Buildings</span>
            <strong>{project.buildingCount ?? project.buildings.length}</strong>
          </div>
          <div>
            <span>Apartments left</span>
            <strong>{getProjectApartmentsLeft(project)}</strong>
          </div>
        </div>

        <div className="project-card-footer">
          <div>
            <span>Delivery window</span>
            <strong>{project.deliveryWindow}</strong>
            {showCompany ? <small>{company.name}</small> : null}
          </div>
          <ButtonLink href={getProjectHref(project)}>Explore project</ButtonLink>
        </div>
      </div>
    </PremiumCard>
  );
}
