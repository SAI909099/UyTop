import { BuildingDetailView } from '@/components/buildings/building-detail-view';
import { HomePrimaryNav } from '@/components/home/home-nav';
import { getPublicBuildingDetail } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import type { PublicBuildingDetail } from '@/types/home';

type BuildingDetailPageProps = {
  params: Promise<{
    locale: LocaleCode;
    projectSlug: string;
    buildingSlug: string;
  }>;
};

const pageCopy = {
  uz: {
    cta: 'Jonli xarita',
    unavailable: 'Bino mavjud emas',
    title: 'So‘ralgan bino tafsilotini yuklab bo‘lmadi.',
    copy: 'Bino e’lon qilinmagan bo‘lishi mumkin yoki ichki route haqiqiy loyiha bilan mos emas.',
    backToMap: 'Xaritaga qaytish',
    backHome: 'Bosh sahifa',
  },
  en: {
    cta: 'Open live map',
    unavailable: 'Building unavailable',
    title: 'The requested building detail could not be loaded.',
    copy: 'The building may be unpublished, the nested route may not match the actual project relationship, or the public catalog request may have failed.',
    backToMap: 'Back to live map',
    backHome: 'Back to homepage',
  },
  ru: {
    cta: 'Открыть карту',
    unavailable: 'Дом недоступен',
    title: 'Не удалось загрузить детали выбранного дома.',
    copy: 'Дом может быть снят с публикации или вложенный route не совпадает с фактическим проектом.',
    backToMap: 'Назад к карте',
    backHome: 'На главную',
  },
} as const;

async function loadBuilding(buildingSlug: string): Promise<PublicBuildingDetail | null> {
  try {
    return await getPublicBuildingDetail(buildingSlug);
  } catch {
    return null;
  }
}

function BuildingDetailState({ locale }: { locale: LocaleCode }) {
  const copy = pageCopy[locale];

  return (
    <main className="building-detail-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={copy.cta}
      />

      <section className="building-detail-state-section">
        <div className="site-shell">
          <article className="premium-surface building-detail-state-card">
            <p className="section-label">{copy.unavailable}</p>
            <h1>{copy.title}</h1>
            <p>{copy.copy}</p>
            <div className="hero-actions">
              <a href={buildLocalizedPath(locale, '/map')} className="button button-primary">
                {copy.backToMap}
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

export default async function BuildingDetailPage({ params }: BuildingDetailPageProps) {
  const { locale, buildingSlug, projectSlug } = await params;
  const building = await loadBuilding(buildingSlug);

  if (!building || building.project.slug !== projectSlug) {
    return <BuildingDetailState locale={locale} />;
  }

  return (
    <main className="building-detail-page-shell">
      <HomePrimaryNav
        locale={locale}
        ctaHref={buildLocalizedPath(locale, '/map')}
        ctaLabel={pageCopy[locale].cta}
      />
      <BuildingDetailView locale={locale} building={building} />
    </main>
  );
}
