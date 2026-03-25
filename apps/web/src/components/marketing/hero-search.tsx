import { Button } from "@/components/ui/button";

export function HeroSearch() {
  return (
    <form action="/search" className="hero-search-card">
      <div className="search-grid">
        <label>
          <span>Purpose</span>
          <select name="purpose" defaultValue="sale">
            <option value="sale">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue="">
            <option value="">All categories</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>
        <label>
          <span>Price up to</span>
          <input type="number" name="price_max" placeholder="500000" />
        </label>
        <label>
          <span>Rooms</span>
          <input type="number" name="rooms_min" placeholder="3+" />
        </label>
      </div>
      <div className="hero-search-footer">
        <p>Search premium homes, investment-grade apartments, land, and commercial assets with refined filters.</p>
        <Button type="submit">Search Properties</Button>
      </div>
    </form>
  );
}
