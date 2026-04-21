import { getServerAuthUser } from '@/lib/auth-server';
import { buildLocalizedPath, getServerLocale, type LocaleCode, webDictionary } from '@/lib/i18n';

import { HomeAuthControls } from '../auth/home-auth-controls';

import { HomeLanguageSwitcher } from './home-language-switcher';

type HomePrimaryNavProps = {
  ctaHref?: string;
  ctaLabel?: string;
  locale?: LocaleCode;
};

export async function HomePrimaryNav({
  ctaHref,
  ctaLabel,
  locale: localeProp,
}: HomePrimaryNavProps) {
  const locale = localeProp ?? (await getServerLocale());
  const dictionary = webDictionary[locale];
  const authUser = await getServerAuthUser();
  const resolvedCtaHref = ctaHref ?? buildLocalizedPath(locale, '/projects');

  return (
    <nav className="home-nav">
      <div className="site-shell home-nav-inner">
        <a href={buildLocalizedPath(locale, '/')} className="brand-lockup">
          <span className="brand-mark">UT</span>
          <span>
            <strong>UyTop</strong>
            <small>{dictionary.brandLine}</small>
          </span>
        </a>

        <div className="home-nav-links">
          <a href={buildLocalizedPath(locale, '/map')}>{dictionary.nav.map}</a>
          <a href={buildLocalizedPath(locale, '/projects')}>{dictionary.nav.projects}</a>
          <a href={buildLocalizedPath(locale, '/developers')}>{dictionary.nav.developers}</a>
          <a href={buildLocalizedPath(locale, '/residences')}>{dictionary.nav.residences}</a>
        </div>

        <div className="home-nav-actions">
          <HomeLanguageSwitcher locale={locale} label={dictionary.nav.language} />
          <HomeAuthControls
            locale={locale}
            initialUser={authUser}
            labels={{
              login: dictionary.nav.login,
              register: dictionary.nav.register,
              logout: dictionary.nav.logout,
              account: dictionary.nav.account,
              signingOut: dictionary.nav.signingOut,
            }}
          />
          <a href={resolvedCtaHref} className="landing-button landing-button-primary home-nav-cta">
            {ctaLabel ?? dictionary.nav.cta}
          </a>
        </div>
      </div>
    </nav>
  );
}
