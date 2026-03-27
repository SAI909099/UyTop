"use client";

import { useState } from 'react';

import { formatCurrency, formatLabel, formatRooms } from '@/lib/utils/format';
import type { PublicApartmentSummary, PublicBuildingDetail } from '@/types/home';

type BuildingFloorExplorerProps = {
  building: PublicBuildingDetail;
};

type FloorOption = {
  key: string;
  label: string;
  floor: number | null;
};

const PUBLIC_UNIT_STATUSES = new Set(['available', 'reserved']);

function sortUnits(apartments: PublicApartmentSummary[]) {
  return [...apartments].sort((left, right) => right.floor - left.floor || Number(left.price) - Number(right.price));
}

function getVisibleUnits(building: PublicBuildingDetail) {
  return sortUnits(
    building.apartments.filter(
      (apartment) => apartment.is_public && PUBLIC_UNIT_STATUSES.has(apartment.status.toLowerCase()),
    ),
  );
}

function getFloorOptions(building: PublicBuildingDetail, units: PublicApartmentSummary[]): FloorOption[] {
  const distinctFloors = [...new Set(units.map((apartment) => apartment.floor).filter((floor) => floor > 0))].sort(
    (left, right) => right - left,
  );

  if (distinctFloors.length) {
    return [{ key: 'all', label: 'All floors', floor: null }, ...distinctFloors.map((floor) => ({ key: `floor-${floor}`, label: `Floor ${floor}`, floor }))];
  }

  if (building.total_floors && building.total_floors > 0) {
    return [
      { key: 'all', label: 'All floors', floor: null },
      ...Array.from({ length: building.total_floors }, (_, index) => {
        const floor = building.total_floors! - index;
        return {
          key: `floor-${floor}`,
          label: `Floor ${floor}`,
          floor,
        };
      }),
    ];
  }

  return [{ key: 'all', label: 'All floors', floor: null }];
}

function getDiagramFloors(building: PublicBuildingDetail, floorOptions: FloorOption[]) {
  const explicitFloors = floorOptions
    .map((option) => option.floor)
    .filter((floor): floor is number => floor !== null)
    .slice(0, 8);

  if (explicitFloors.length) {
    return explicitFloors;
  }

  if (building.total_floors && building.total_floors > 0) {
    const visibleCount = Math.min(building.total_floors, 8);
    return Array.from({ length: visibleCount }, (_, index) => building.total_floors! - index);
  }

  return [4, 3, 2, 1];
}

export function BuildingFloorExplorer({ building }: BuildingFloorExplorerProps) {
  const units = getVisibleUnits(building);
  const floorOptions = getFloorOptions(building, units);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedOption = floorOptions[selectedIndex] ?? floorOptions[0];
  const selectedUnits = selectedOption?.floor === null ? units : units.filter((unit) => unit.floor === selectedOption.floor);
  const previewUnits = selectedUnits.slice(0, 8);
  const hiddenCount = Math.max(0, selectedUnits.length - previewUnits.length);
  const diagramFloors = getDiagramFloors(building, floorOptions);

  return (
    <section className="building-floor-explorer">
      <div className="building-floor-explorer-head">
        <div>
          <p className="section-label">Floor studio</p>
          <h2 className="building-floor-explorer-title">Slide through the stack and inspect live unit availability.</h2>
        </div>
        <div className="building-floor-explorer-badge">{selectedOption.label}</div>
      </div>

      <div className="building-floor-signal-row">
        <span>{building.total_floors ? `${building.total_floors} floors` : 'Floor count pending'}</span>
        <span>{building.total_apartments ? `${building.total_apartments} total units` : 'Unit count pending'}</span>
        <span>{building.apartments_left} public units available</span>
      </div>

      <div className="building-floor-slider-shell">
        <div className="building-floor-slider-head">
          <span>Floors selector</span>
          <strong>{selectedUnits.length} matching units</strong>
        </div>
        <input
          className="building-floor-slider"
          type="range"
          min={0}
          max={Math.max(floorOptions.length - 1, 0)}
          step={1}
          value={selectedIndex}
          aria-label="Select a floor"
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
        />
        <div className="building-floor-slider-scale">
          <span>All</span>
          <span>{floorOptions[floorOptions.length - 1]?.floor ? `Floor ${floorOptions[floorOptions.length - 1].floor}` : 'Lower'}</span>
          <span>{floorOptions[1]?.floor ? `Floor ${floorOptions[1].floor}` : 'Top'}</span>
        </div>
      </div>

      <div className="building-diagram-panel">
        <div className="building-diagram-head">
          <span>Technical floor diagram</span>
          <strong>{selectedOption.floor === null ? 'Portfolio view' : selectedOption.label}</strong>
        </div>

        <div className="building-diagram-canvas" aria-hidden="true">
          <div className="building-diagram-gridline building-diagram-gridline-vertical" />
          <div className="building-diagram-gridline building-diagram-gridline-horizontal" />

          <div className="building-diagram-stack">
            {diagramFloors.map((floor) => {
              const isSelected = selectedOption.floor === null ? previewUnits.some((unit) => unit.floor === floor) : selectedOption.floor === floor;

              return (
                <div
                  key={floor}
                  className={`building-diagram-floor${isSelected ? ' building-diagram-floor-active' : ''}`}
                >
                  <span className="building-diagram-floor-label">{floor}</span>
                  <div className="building-diagram-floor-plan">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="building-diagram-caption">
            <p>
              {selectedOption.floor === null
                ? 'A stylized stack view of the active building levels.'
                : `A stylized diagram view focused on ${selectedOption.label.toLowerCase()}.`}
            </p>
            <span>This is an interface diagram, not an uploaded architectural drawing.</span>
          </div>
        </div>
      </div>

      <div className="building-units-shell" id="available-units">
        <div className="building-units-head">
          <div>
            <p className="section-label">Available units</p>
            <h3>{selectedOption.label === 'All floors' ? 'Public units across the tower.' : `${selectedOption.label} availability.`}</h3>
          </div>
          {hiddenCount > 0 ? <span className="building-units-more">+{hiddenCount} more units on this selection</span> : null}
        </div>

        {previewUnits.length ? (
          <div className="building-units-grid">
            {previewUnits.map((unit) => (
              <article key={unit.id} className="building-unit-card">
                <div className="building-unit-card-head">
                  <strong>{unit.apartment_number}</strong>
                  <span>{formatLabel(unit.status)}</span>
                </div>
                <p>{unit.title}</p>
                <div className="building-unit-card-meta">
                  <span>{formatRooms(unit.rooms)}</span>
                  <span>{unit.size_sqm} sqm</span>
                  <span>Floor {unit.floor}</span>
                </div>
                <strong className="building-unit-card-price">{formatCurrency(unit.price, unit.currency)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <article className="building-units-empty">
            <h3>No public units are currently shown for this floor selection.</h3>
            <p>Move the slider to another level or switch back to all floors to review the currently published units.</p>
          </article>
        )}
      </div>
    </section>
  );
}
