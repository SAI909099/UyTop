import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <a href="/" className="brand-mark">
          <span className="brand-badge">UT</span>
          <span>
            <strong>UyTop</strong>
            <small>Developer-led residential discovery</small>
          </span>
        </a>

        <nav className="main-nav">
          <a href="/">Home</a>
          <a href="/developers">Developers</a>
          <a href="/apartments">Apartment Map</a>
          <a href="/developers/dream-house">Dream House</a>
        </nav>

        <div className="header-actions">
          <ButtonLink href="/developers" variant="ghost">
            All developers
          </ButtonLink>
          <ButtonLink href="/projects/riverside-signature">Open flagship project</ButtonLink>
        </div>
      </div>
    </header>
  );
}
