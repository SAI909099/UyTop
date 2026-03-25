"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import type { ApartmentType } from "@/types/developers";

type ApartmentTypeModalProps = {
  apartment: ApartmentType;
  buildingName: string;
  projectName: string;
  onClose: () => void;
};

export function ApartmentTypeModal({
  apartment,
  buildingName,
  projectName,
  onClose,
}: ApartmentTypeModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apartment-type-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{projectName}</p>
            <h3 id="apartment-type-title">{apartment.title}</h3>
            <p>
              {buildingName} · {apartment.floorRange}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="modal-content-grid">
          <div className="modal-image-stack">
            <img src={apartment.coverImage} alt={apartment.title} />
            <img src={apartment.layoutImage} alt={`${apartment.title} layout`} />
          </div>

          <div className="modal-details">
            <p>{apartment.summary}</p>

            <div className="modal-metric-list">
              <div>
                <span>Room count</span>
                <strong>{apartment.rooms} rooms</strong>
              </div>
              <div>
                <span>Square meter</span>
                <strong>{apartment.sizeSqm}</strong>
              </div>
              <div>
                <span>Price</span>
                <strong>{formatCurrency(apartment.price)}</strong>
              </div>
              <div>
                <span>Apartments left</span>
                <strong>{apartment.remainingUnits}</strong>
              </div>
              <div>
                <span>Floor range</span>
                <strong>{apartment.floorRange}</strong>
              </div>
              <div>
                <span>Orientation</span>
                <strong>{apartment.orientation}</strong>
              </div>
            </div>

            <div className="modal-callout">
              <strong>Layout insight</strong>
              <p>
                This type is presented as a premium planning card so buyers can compare size, layout image, and
                inventory without losing building context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
