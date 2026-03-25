import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import type { ApartmentType } from "@/types/developers";

type ApartmentTypeCardProps = {
  apartment: ApartmentType;
  onOpen: (apartment: ApartmentType) => void;
};

export function ApartmentTypeCard({ apartment, onOpen }: ApartmentTypeCardProps) {
  return (
    <article className="apartment-card">
      <div className="apartment-card-image">
        <img src={apartment.coverImage} alt={apartment.title} />
      </div>
      <div className="apartment-card-body">
        <div className="apartment-card-topline">
          <span>{apartment.rooms} rooms</span>
          <span>{apartment.sizeSqm}</span>
        </div>
        <h3>{apartment.title}</h3>
        <p>{apartment.summary}</p>

        <div className="apartment-card-meta">
          <div>
            <span>{apartment.priceLabel}</span>
            <strong>{formatCurrency(apartment.price)}</strong>
          </div>
          <div>
            <span>Units left</span>
            <strong>{apartment.remainingUnits}</strong>
          </div>
          <div>
            <span>Orientation</span>
            <strong>{apartment.orientation}</strong>
          </div>
        </div>

        <Button type="button" variant="secondary" onClick={() => onOpen(apartment)}>
          Open layout details
        </Button>
      </div>
    </article>
  );
}
