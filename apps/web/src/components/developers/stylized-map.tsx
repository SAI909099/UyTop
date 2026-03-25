import type { ReactNode } from "react";

import { PremiumCard } from "@/components/ui/premium-card";
import type { MapPin } from "@/types/developers";

type StylizedMapProps = {
  eyebrow: string;
  title: string;
  description: string;
  pins: MapPin[];
  summary?: ReactNode;
};

export function StylizedMap({ eyebrow, title, description, pins, summary }: StylizedMapProps) {
  return (
    <PremiumCard className="stylized-map">
      <div className="stylized-map-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="map-status-pill">Stylized city map</span>
      </div>

      <div className="stylized-map-stage">
        <div className="stylized-map-surface">
          <div className="stylized-map-grid" />
          <div className="map-shape map-shape-one" />
          <div className="map-shape map-shape-two" />
          {pins.map((pin) => (
            <div
              key={pin.id}
              className={`map-plot map-plot-${pin.emphasis ?? "muted"}`}
              style={{ top: pin.top, left: pin.left }}
            >
              <span className="map-plot-dot" />
              <div className="map-plot-card">
                <strong>{pin.label}</strong>
                <span>
                  {pin.district}, {pin.city}
                </span>
                <small>{pin.caption}</small>
              </div>
            </div>
          ))}
        </div>
        {summary ? <div className="stylized-map-summary">{summary}</div> : null}
      </div>
    </PremiumCard>
  );
}
