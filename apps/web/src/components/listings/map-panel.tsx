import { formatCurrency } from "@/lib/utils/format";
import type { MapListingPreview } from "@/types/api";

type MapPanelProps = {
  listings: MapListingPreview[];
  title?: string;
};

export function MapPanel({ listings, title = "Interactive discovery map" }: MapPanelProps) {
  return (
    <section className="map-panel">
      <div className="map-header">
        <div>
          <p className="eyebrow">Map</p>
          <h3>{title}</h3>
        </div>
        <span className="map-provider-pill">Subtle dimensional view</span>
      </div>
      <div className="map-surface">
        <div className="map-grid" />
        {listings.slice(0, 6).map((listing, index) => (
          <div
            key={listing.id}
            className={`map-marker ${index === 0 ? "map-marker-featured" : ""}`}
            style={{
              top: `${18 + (index % 3) * 22}%`,
              left: `${16 + (index * 13) % 62}%`,
            }}
          >
            <span>{formatCurrency(listing.price, listing.currency)}</span>
          </div>
        ))}
        <div className="map-overlay-card">
          <p>Visible inventory</p>
          <strong>{listings.length}</strong>
          <span>Listings within map bounds</span>
        </div>
      </div>
    </section>
  );
}
