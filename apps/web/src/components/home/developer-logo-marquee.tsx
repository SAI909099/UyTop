import type { PublicCompany } from '@/types/home';

type DeveloperLogoMarqueeProps = {
  companies: PublicCompany[];
};

function buildLoopCompanies(companies: PublicCompany[]) {
  if (!companies.length) {
    return [];
  }

  const repeatFactor = companies.length >= 6 ? 1 : Math.ceil(6 / companies.length);
  const seeded = Array.from({ length: repeatFactor }, () => companies).flat();

  return [...seeded, ...seeded];
}

export function DeveloperLogoMarquee({ companies }: DeveloperLogoMarqueeProps) {
  const logoCompanies = companies.filter((company) => company.logo_url?.trim());

  if (!logoCompanies.length) {
    return null;
  }

  const loopCompanies = buildLoopCompanies(logoCompanies);

  return (
    <section className="developer-logo-marquee premium-surface" aria-label="Verified developer logos">
      <div className="developer-logo-marquee-label">
        <p>Verified developers</p>
        <span>Admin-managed logos under the live map</span>
      </div>

      <div className="developer-logo-marquee-viewport">
        <div className="developer-logo-marquee-track">
          {loopCompanies.map((company, index) => (
            <article
              key={`${company.id}-${index}`}
              className="developer-logo-marquee-item"
              aria-label={company.name}
              title={company.name}
            >
              <div className="developer-logo-marquee-badge">
                <img src={company.logo_url} alt={`${company.name} logo`} loading="lazy" />
              </div>
              <span>{company.name}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
