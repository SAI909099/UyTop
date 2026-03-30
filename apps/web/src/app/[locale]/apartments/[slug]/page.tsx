import { ApartmentDetailView } from '@/components/apartments/apartment-detail-view';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicApartmentDetail } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import type { PublicApartmentDetail } from '@/types/home';

type ApartmentDetailPageProps = {
  params: Promise<{
    locale: LocaleCode;
    slug: string;
  }>;
};

const pageCopy = {
  uz: {
    cta: 'Jonli xarita',
    unavailable: 'Uy mavjud emas',
    title: 'Kvartira tafsilotini yuklab bo‘lmadi.',
    copy: 'Uy e’lon qilinmagan bo‘lishi mumkin yoki ommaviy katalog so‘rovi muvaffaqiyatsiz tugagan.',
    backToMap: 'Xaritaga qaytish',
    browseResidences: 'Uylarni ko‘rish',
  },
  en: {
    cta: 'Open live map',
    unavailable: 'Residence unavailable',
    title: 'The apartment detail could not be loaded.',
    copy: 'The residence may be unpublished, the slug may be incorrect, or the public catalog request may have failed.',
    backToMap: 'Back to live map',
    browseResidences: 'Browse residences',
  },
  ru: {
    cta: 'Открыть карту',
    unavailable: 'Квартира недоступна',
    title: 'Не удалось загрузить детали квартиры.',
    copy: 'Квартира может быть снята с публикации или запрос к публичному каталогу завершился ошибкой.',
    backToMap: 'Назад к карте',
    browseResidences: 'Смотреть квартиры',
  },
} as const;

async function loadApartment(slug: string): Promise<PublicApartmentDetail | null> {
  try {
    return await getPublicApartmentDetail(slug);
  } catch {
    return null;
  }
}

function ApartmentDetailState({ locale }: { locale: LocaleCode }) {
  const copy = pageCopy[locale];

  return (
    <main className="apartment-detail-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={copy.cta}
      />

      <section className="apartment-detail-state-section">
        <div className="site-shell">
          <article className="premium-surface apartment-detail-state-card">
            <p className="section-label">{copy.unavailable}</p>
            <h1>{copy.title}</h1>
            <p>{copy.copy}</p>
            <div className="hero-actions">
              <a href={buildLocalizedPath(locale, '/map')} className="button button-primary">
                {copy.backToMap}
              </a>
              <a href={buildLocalizedPath(locale, '/residences')} className="button button-secondary">
                {copy.browseResidences}
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default async function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { locale, slug } = await params;
  const apartment = await loadApartment(slug);

  if (!apartment) {
    return <ApartmentDetailState locale={locale} />;
  }

  return (
    <main className="apartment-detail-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={pageCopy[locale].cta}
      />
      <ApartmentDetailView locale={locale} apartment={apartment} />
    </main>
  );
}
