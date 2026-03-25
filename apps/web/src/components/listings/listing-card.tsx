import { Chip } from "@/components/ui/chip";
import { PremiumCard } from "@/components/ui/premium-card";
import { formatCurrency, titleize } from "@/lib/utils/format";
import { getPropertyHref } from "@/lib/utils/routing";
import type { ListingSummary } from "@/types/api";

type ListingCardProps = {
  listing: ListingSummary;
  compact?: boolean;
};

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  return (
    <PremiumCard>
      <a href={getPropertyHref(listing)} className={`listing-card ${compact ? "listing-card-compact" : ""}`}>
        <div className="listing-image-wrap">
          <img
            src={listing.images[0]?.image_url ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"}
            alt={listing.title}
            className="listing-image"
          />
          <div className="listing-badges">
            {listing.is_featured ? <Chip>Featured</Chip> : null}
            {listing.is_verified_owner ? <Chip>Verified owner</Chip> : null}
          </div>
        </div>
        <div className="listing-copy">
          <div className="listing-topline">
            <p>{titleize(listing.category)} for {listing.purpose}</p>
            <span>{listing.city.name}</span>
          </div>
          <h3>{listing.title}</h3>
          <strong>{formatCurrency(listing.price, listing.currency)}</strong>
          <div className="listing-facts">
            <span>{listing.rooms ? `${listing.rooms} rooms` : "Flexible plan"}</span>
            <span>{listing.size_sqm ? `${listing.size_sqm} sqm` : "Area on request"}</span>
            <span>{listing.district?.name ?? listing.city.name}</span>
          </div>
          <div className="listing-owner-row">
            <span>{listing.owner_name}</span>
            <span>{titleize(listing.moderation_status)}</span>
          </div>
        </div>
      </a>
    </PremiumCard>
  );
}
