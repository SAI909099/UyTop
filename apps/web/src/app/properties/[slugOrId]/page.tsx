import { notFound } from "next/navigation";

import { ListingCard } from "@/components/listings/listing-card";
import { MapPanel } from "@/components/listings/map-panel";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PremiumCard } from "@/components/ui/premium-card";
import { getFeaturedListings, getListingDetail } from "@/lib/api/client";
import { formatCurrency, formatDistance, titleize } from "@/lib/utils/format";
import { getPropertyIdFromParam } from "@/lib/utils/routing";

type PropertyPageProps = {
  params: Promise<{ slugOrId: string }>;
};

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slugOrId } = await params;
  const propertyId = getPropertyIdFromParam(slugOrId);

  if (!propertyId) {
    notFound();
  }

  const [listing, featuredListings] = await Promise.all([
    getListingDetail(propertyId),
    getFeaturedListings(),
  ]);

  const galleryImages = listing.images.length > 0 ? listing.images : featuredListings[0]?.images ?? [];

  return (
    <main className="detail-page">
      <div className="site-shell">
        <section className="detail-hero">
          <div className="gallery-grid">
            <img src={galleryImages[0]?.image_url} alt={listing.title} />
            <div className="gallery-side">
              {galleryImages.slice(1, 3).map((image) => (
                <img key={image.id} src={image.image_url} alt={listing.title} />
              ))}
            </div>
          </div>

          <PremiumCard>
            <div className="detail-summary">
              <div className="detail-meta">
                {listing.is_featured ? <Chip>Featured</Chip> : null}
                {listing.is_verified_owner ? <Chip>Verified owner</Chip> : null}
                <Chip>{titleize(listing.category)}</Chip>
              </div>
              <p className="eyebrow">{listing.city.name}{listing.district ? `, ${listing.district.name}` : ""}</p>
              <h1>{listing.title}</h1>
              <div className="detail-price">{formatCurrency(listing.price, listing.currency)}</div>
              <p>
                {listing.address}. A premium, launch-ready property presentation with clean facts, moderated trust, and direct owner contact options.
              </p>

              <div className="detail-facts">
                <PremiumCard>
                  <div className="detail-section">
                    <h3>{listing.rooms ?? "Flexible"}</h3>
                    <p>Rooms</p>
                  </div>
                </PremiumCard>
                <PremiumCard>
                  <div className="detail-section">
                    <h3>{listing.size_sqm ?? "TBC"}</h3>
                    <p>Sqm</p>
                  </div>
                </PremiumCard>
                <PremiumCard>
                  <div className="detail-section">
                    <h3>{listing.floor ?? "-"}</h3>
                    <p>Floor</p>
                  </div>
                </PremiumCard>
                <PremiumCard>
                  <div className="detail-section">
                    <h3>{listing.view_count}</h3>
                    <p>Views</p>
                  </div>
                </PremiumCard>
              </div>

              <div className="hero-search-footer">
                <ButtonLink href="/search" variant="secondary">Back to search</ButtonLink>
                <ButtonLink href="/owner/dashboard">Contact owner</ButtonLink>
              </div>
            </div>
          </PremiumCard>
        </section>

        <section className="detail-content">
          <div className="detail-main-column">
            <PremiumCard>
              <div className="detail-section">
                <p className="eyebrow">Overview</p>
                <h3>Property story</h3>
                <p>{listing.description}</p>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="detail-section">
                <p className="eyebrow">Amenities</p>
                <h3>Included features</h3>
                <div className="amenity-list">
                  {listing.amenities.map((amenity) => (
                    <Chip key={amenity.id}>{amenity.title}</Chip>
                  ))}
                </div>
              </div>
            </PremiumCard>

            <MapPanel
              listings={[
                {
                  id: listing.id,
                  slug: listing.slug,
                  title: listing.title,
                  purpose: listing.purpose,
                  category: listing.category,
                  price: listing.price,
                  currency: listing.currency,
                  city: listing.city.name,
                  district: listing.district?.name ?? null,
                  latitude: listing.latitude,
                  longitude: listing.longitude,
                  is_featured: listing.is_featured,
                  is_verified_owner: listing.is_verified_owner,
                  primary_image: listing.images[0]?.image_url ?? null,
                },
              ]}
              title="Exact location overview"
            />
          </div>

          <div className="detail-side-column">
            <PremiumCard>
              <div className="owner-contact-card">
                <p className="eyebrow">Verified owner block</p>
                <h3>{listing.owner_name}</h3>
                <p>{listing.is_verified_owner ? "Verified and moderation-cleared owner profile." : "Owner profile under standard review."}</p>
                <div className="amenity-list">
                  {listing.allow_phone ? <Chip>{listing.contact_phone}</Chip> : null}
                  {listing.allow_whatsapp ? <Chip>WhatsApp</Chip> : null}
                  {listing.allow_telegram ? <Chip>Telegram</Chip> : null}
                </div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="detail-section">
                <p className="eyebrow">Nearby places</p>
                <h3>Daily convenience</h3>
                <div className="nearby-list">
                  {listing.nearby_places.map((place) => (
                    <Chip key={place.id}>
                      {place.title} · {formatDistance(place.distance_meters)}
                    </Chip>
                  ))}
                </div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="detail-section">
                <p className="eyebrow">Mortgage</p>
                <h3>Financing preview</h3>
                <p>
                  A full mortgage calculator is planned for the next product phase. This section reserves the premium placement for financing guidance.
                </p>
              </div>
            </PremiumCard>
          </div>
        </section>

        <section className="section-block">
          <SectionBlockFeatured listings={featuredListings.filter((item) => item.id !== listing.id).slice(0, 3)} />
        </section>
      </div>
    </main>
  );
}

function SectionBlockFeatured({ listings }: { listings: Awaited<ReturnType<typeof getFeaturedListings>> }) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <>
      <div className="section-heading">
        <p className="eyebrow">You may also like</p>
        <h2>Curated alternatives in the same premium market</h2>
      </div>
      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
}
