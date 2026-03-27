type HomePrimaryNavProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function HomePrimaryNav({
  ctaHref = "/projects",
  ctaLabel = "Explore launches",
}: HomePrimaryNavProps) {
  return (
    <nav className="home-nav">
      <div className="site-shell home-nav-inner">
        <a href="/" className="brand-lockup">
          <span className="brand-mark">UT</span>
          <span>
            <strong>UyTop</strong>
            <small>Where vision meets residence</small>
          </span>
        </a>

        <div className="home-nav-links">
          <a href="/map">Live map</a>
          <a href="/projects">Projects</a>
          <a href="/developers">Developers</a>
          <a href="/residences">Residences</a>
        </div>

        <a href={ctaHref} className="button button-primary">
          {ctaLabel}
        </a>
      </div>
    </nav>
  );
}
