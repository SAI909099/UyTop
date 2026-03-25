import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { formatCurrency } from "@/lib/utils/format";
import { getBuildingHref } from "@/lib/utils/routing";
import type { DeveloperProject, ProjectBuilding } from "@/types/developers";

type BuildingCardProps = {
  project: DeveloperProject;
  building: ProjectBuilding;
};

export function BuildingCard({ project, building }: BuildingCardProps) {
  return (
    <PremiumCard className="building-card">
      <div className="building-card-image">
        <img src={building.coverImage} alt={building.name} />
        <div className="building-card-code">Building {building.code}</div>
      </div>

      <div className="building-card-body">
        <div className="building-card-topline">
          <span>{building.status}</span>
          <span>{building.handover}</span>
        </div>
        <h3>{building.name}</h3>
        <p>{building.summary}</p>

        <div className="building-metric-row">
          <div>
            <strong>{building.apartmentsLeft}</strong>
            <span>Apartments left</span>
          </div>
          <div>
            <strong>{building.totalApartments}</strong>
            <span>Total homes</span>
          </div>
          <div>
            <strong>{building.areaRange}</strong>
            <span>Area range</span>
          </div>
        </div>

        <div className="building-price-line">
          <span>Price range</span>
          <strong>
            {formatCurrency(building.priceFrom)} - {formatCurrency(building.priceTo)}
          </strong>
        </div>

        <div className="room-pill-list">
          {building.roomTypes.map((roomType) => (
            <span key={roomType} className="room-pill">
              {roomType}
            </span>
          ))}
        </div>

        <ButtonLink href={getBuildingHref(project, building)}>View building details</ButtonLink>
      </div>
    </PremiumCard>
  );
}
