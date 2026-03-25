"use client";

import { useEffect, useState } from "react";

import type { ApartmentType } from "@/types/developers";

import { ApartmentTypeCard } from "./apartment-type-card";
import { ApartmentTypeModal } from "./apartment-type-modal";

type ApartmentBrowserProps = {
  apartments: ApartmentType[];
  buildingName: string;
  projectName: string;
};

export function ApartmentBrowser({ apartments, buildingName, projectName }: ApartmentBrowserProps) {
  const [selectedApartment, setSelectedApartment] = useState<ApartmentType | null>(null);

  useEffect(() => {
    if (!selectedApartment) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.setProperty("overflow", "hidden");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedApartment(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.removeProperty("overflow");
    };
  }, [selectedApartment]);

  return (
    <>
      <div className="apartment-grid">
        {apartments.map((apartment) => (
          <ApartmentTypeCard key={apartment.id} apartment={apartment} onOpen={setSelectedApartment} />
        ))}
      </div>

      {selectedApartment ? (
        <ApartmentTypeModal
          apartment={selectedApartment}
          buildingName={buildingName}
          projectName={projectName}
          onClose={() => setSelectedApartment(null)}
        />
      ) : null}
    </>
  );
}
