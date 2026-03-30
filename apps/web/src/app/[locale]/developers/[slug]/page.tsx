import { DeveloperProfileView } from '@/components/developers/developer-profile-view';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicCompanyDetail } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import type { PublicCompanyDetail } from '@/types/home';

type DeveloperProfilePageProps = {
  params: Promise<{
    locale: LocaleCode;
    slug: string;
  }>;
};

const pageCopy = {
  uz: {
    cta: 'Jonli xarita',
    unavailable: 'Developer mavjud emas',
    title: 'So‘ralgan developer profilini yuklab bo‘lmadi.',
    copy: 'Developer e’lon qilinmagan bo‘lishi mumkin yoki ommaviy katalog so‘rovi muvaffaqiyatsiz tugagan.',
    backToDevelopers: 'Developerlarga qaytish',
    backHome: 'Bosh sahifa',
  },
  en: {
    cta: 'Open live map',
    unavailable: 'Developer unavailable',
    title: 'The requested developer profile could not be loaded.',
    copy: 'The company may be unpublished or the public catalog request may have failed.',
    backToDevelopers: 'Back to developers',
    backHome: 'Back to homepage',
  },
  ru: {
    cta: 'Открыть карту',
    unavailable: 'Застройщик недоступен',
    title: 'Не удалось загрузить профиль выбранного застройщика.',
    copy: 'Компания может быть снята с публикации или запрос к публичному каталогу завершился ошибкой.',
    backToDevelopers: 'Назад к застройщикам',
    backHome: 'На главную',
  },
} as const;

async function loadCompany(slug: string): Promise<PublicCompanyDetail | null> {
  try {
    return await getPublicCompanyDetail(slug);
  } catch {
    return null;
  }
}

function DeveloperProfileState({ locale }: { locale: LocaleCode }) {
  const copy = pageCopy[locale];

  return (
    <main className="developer-profile-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={copy.cta}
      />

      <section className="developer-profile-state-section">
        <div className="site-shell">
          <article className="premium-surface developer-profile-state-card">
            <p className="section-label">{copy.unavailable}</p>
            <h1>{copy.title}</h1>
            <p>{copy.copy}</p>
            <div className="hero-actions">
              <a href={buildLocalizedPath(locale, '/developers')} className="button button-primary">
                {copy.backToDevelopers}
              </a>
              <a href={buildLocalizedPath(locale, '/')} className="button button-secondary">
                {copy.backHome}
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default async function DeveloperProfilePage({ params }: DeveloperProfilePageProps) {
  const { locale, slug } = await params;
  const company = await loadCompany(slug);

  if (!company) {
    return <DeveloperProfileState locale={locale} />;
  }

  return (
    <main className="developer-profile-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={pageCopy[locale].cta}
      />
      <DeveloperProfileView locale={locale} company={company} />
    </main>
  );
}
