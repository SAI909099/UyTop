import type { ListingSummary } from "@/types/api";
import type { DeveloperCompany, DeveloperProject, ProjectBuilding } from "@/types/developers";

export function getPropertyHref(listing: Pick<ListingSummary, "id" | "slug">) {
  return `/properties/${listing.id}-${listing.slug}`;
}

export function getPropertyIdFromParam(slugOrId: string) {
  const [firstChunk] = slugOrId.split("-");
  const id = Number(firstChunk);
  return Number.isNaN(id) ? null : id;
}

export function getDeveloperHref(company: Pick<DeveloperCompany, "slug">) {
  return `/developers/${company.slug}`;
}

export function getProjectHref(project: Pick<DeveloperProject, "slug">) {
  return `/projects/${project.slug}`;
}

export function getBuildingHref(project: Pick<DeveloperProject, "slug">, building: Pick<ProjectBuilding, "slug">) {
  return `/projects/${project.slug}/buildings/${building.slug}`;
}
