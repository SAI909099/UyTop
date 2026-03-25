import { ListingCard } from "@/components/listings/listing-card";
import { MapPanel } from "@/components/listings/map-panel";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMapListings, getSearchListings } from "@/lib/api/client";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildQueryString(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value) {
      query.set(key, value);
    }
  }

  if (!query.has("north")) {
    query.set("north", "41.50");
    query.set("south", "41.20");
    query.set("east", "69.42");
    query.set("west", "69.10");
  }

  return query.toString();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const queryString = buildQueryString(resolvedParams);
  const [listingsResponse, mapResponse] = await Promise.all([
    getSearchListings(queryString),
    getMapListings(queryString),
  ]);

  return (
    <main className="search-page">
      <div className="site-shell">
        <div className="page-hero">
          <SectionHeading
            eyebrow="Search"
            title="Map-first property discovery with premium decision support"
            description="Two-column exploration keeps location context, listing quality, and quick fact comparison visible at all times."
          />
          <p className="page-subtext">{listingsResponse.count} listings available</p>
        </div>

        <form action="/search" className="premium-card filters-panel">
          <div className="filters-grid">
            <label>
              <span>Purpose</span>
              <select name="purpose" defaultValue={typeof resolvedParams.purpose === "string" ? resolvedParams.purpose : ""}>
                <option value="">All</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </label>
            <label>
              <span>Category</span>
              <select name="category" defaultValue={typeof resolvedParams.category === "string" ? resolvedParams.category : ""}>
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>
            <label>
              <span>Price min</span>
              <input name="price_min" defaultValue={typeof resolvedParams.price_min === "string" ? resolvedParams.price_min : ""} />
            </label>
            <label>
              <span>Price max</span>
              <input name="price_max" defaultValue={typeof resolvedParams.price_max === "string" ? resolvedParams.price_max : ""} />
            </label>
            <label>
              <span>Sort</span>
              <select name="sort" defaultValue={typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest"}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price ascending</option>
                <option value="price_desc">Price descending</option>
                <option value="relevance">Relevance</option>
              </select>
            </label>
          </div>
          <div className="hero-search-footer">
            <div className="filters-pills">
              <Chip>Map + list hybrid</Chip>
              <Chip>Premium cards</Chip>
              <Chip>Verified-owner emphasis</Chip>
            </div>
            <Button type="submit">Update search</Button>
          </div>
        </form>

        <div className="search-layout">
          <section className="results-column">
            {listingsResponse.results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} compact />
            ))}
          </section>

          <MapPanel listings={mapResponse.results} title="Visible map inventory" />
        </div>
      </div>
    </main>
  );
}
