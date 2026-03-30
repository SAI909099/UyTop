import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCompactNumber, formatCurrency } from '@/lib/utils/format';
import type { PublicProject } from '@/types/home';

import { HomePrimaryNav } from './home-nav';

type HomeLandingProps = {
  locale: LocaleCode;
  companiesCount: number;
  projectsCount: number;
  totalPublishedApartments: number;
  liveAreas: number;
  averageProjectEntry: number;
  featuredProjects: PublicProject[];
};

const landingCopy: Record<
  LocaleCode,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    primaryCta: string;
    secondaryCta: string;
    previewLabel: string;
    previewCta: string;
    previewMoreCta: string;
    previewFallbackTitle: string;
    previewFallbackCopy: string;
    deliveryPending: string;
    previewProjects: string;
    previewHomes: string;
    previewAreas: string;
    boardLabel: string;
    statsEyebrow: string;
    statsTitle: string;
    statCompanies: string;
    statProjects: string;
    statHomes: string;
    statAverageEntry: string;
    projectsEyebrow: string;
    projectsTitle: string;
    projectsCopy: string;
    projectStartingFrom: string;
    projectBuildings: string;
    openProjects: string;
    projectsEmptyTitle: string;
    projectsEmptyCopy: string;
    awaitingInventory: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaCopy: string;
    ctaPrimary: string;
    ctaSecondary: string;
  }
> = {
  uz: {
    heroEyebrow: 'UyTop | Jonli ko‘chmas mulk paneli',
    heroTitle: 'Xaritada uy toping',
    heroBody:
      'Tasdiqlangan loyihalarni xaritada toping, narxlarni solishtiring va tezroq qaror qiling.',
    primaryCta: 'Loyihalarni ko‘rish',
    secondaryCta: 'Xaritani ochish',
    previewLabel: 'Tanlangan loyiha',
    previewCta: 'Ko‘rish',
    previewMoreCta: 'Batafsil',
    previewFallbackTitle: 'Tanlangan loyiha',
    previewFallbackCopy: 'Faol loyiha ma’lumotlari e’lon qilingach, bu karta jonli narx va joylashuv bilan to‘ladi.',
    deliveryPending: 'Muddat kutilmoqda',
    previewProjects: 'Loyihalar',
    previewHomes: 'Uylar',
    previewAreas: 'Hududlar',
    boardLabel: 'Tanlangan startlar',
    statsEyebrow: 'Jonli ko‘rsatkichlar',
    statsTitle: 'Asosiy bozor ko‘rsatkichlari',
    statCompanies: 'Tasdiqlangan quruvchilar',
    statProjects: 'Faol loyihalar',
    statHomes: 'E’lon qilingan uylar',
    statAverageEntry: 'O‘rtacha boshlang‘ich narx',
    projectsEyebrow: 'Tanlangan loyihalar',
    projectsTitle: 'Ko‘rib chiqishga arziydigan faol startlar',
    projectsCopy: 'Har bir karta joriy boshlang‘ich narx, joylashuv va topshirish muddatini tez ko‘rish uchun tuzilgan.',
    projectStartingFrom: 'Boshlanishi',
    projectBuildings: 'Binolar',
    openProjects: 'Loyihalar markazi',
    projectsEmptyTitle: 'Faol loyihalar hali ko‘rinmayapti.',
    projectsEmptyCopy: 'Admin katalog orqali loyihalarni e’lon qiling, bu bo‘lim jonli ma’lumot bilan to‘ladi.',
    awaitingInventory: 'Inventar kutilmoqda',
    ctaEyebrow: 'Keyingi qadam',
    ctaTitle: 'Umumiy ko‘rinishdan to‘liq inventarga o‘ting.',
    ctaCopy: 'Barcha loyihalarni ko‘rish uchun markazga o‘ting yoki hudud bo‘yicha qidirish uchun xaritani oching.',
    ctaPrimary: 'Loyihalarni tahlil qilish',
    ctaSecondary: 'Jonli xarita',
  },
  en: {
    heroEyebrow: 'UyTop | Live real-estate intelligence',
    heroTitle: 'Find real-estate projects directly on the map',
    heroBody:
      'Compare verified developers, active launches, and entry pricing in one focused workspace built for practical property discovery.',
    primaryCta: 'Browse projects',
    secondaryCta: 'Open map',
    previewLabel: 'Featured project',
    previewCta: 'View',
    previewMoreCta: 'Details',
    previewFallbackTitle: 'Featured project',
    previewFallbackCopy: 'As soon as active inventory is published, this card will populate with live pricing and location data.',
    deliveryPending: 'Delivery pending',
    previewProjects: 'Projects',
    previewHomes: 'Homes',
    previewAreas: 'Areas',
    boardLabel: 'Featured launches',
    statsEyebrow: 'Live metrics',
    statsTitle: 'Core market signals',
    statCompanies: 'Verified developers',
    statProjects: 'Active projects',
    statHomes: 'Published homes',
    statAverageEntry: 'Average entry price',
    projectsEyebrow: 'Featured projects',
    projectsTitle: 'Active launches worth a closer look',
    projectsCopy: 'Each card highlights current entry pricing, location context, and delivery timing in a clean comparison layout.',
    projectStartingFrom: 'Starting from',
    projectBuildings: 'Buildings',
    openProjects: 'Open project hub',
    projectsEmptyTitle: 'No active projects are visible yet.',
    projectsEmptyCopy: 'Publish projects through the admin catalog and this section will begin filling with live inventory.',
    awaitingInventory: 'Awaiting inventory',
    ctaEyebrow: 'Next step',
    ctaTitle: 'Move from overview to live inventory.',
    ctaCopy: 'Jump into the project hub for the full roster or open the live map for area-based discovery.',
    ctaPrimary: 'Review projects',
    ctaSecondary: 'Open live map',
  },
  ru: {
    heroEyebrow: 'UyTop | Живой рынок недвижимости',
    heroTitle: 'Находите проекты недвижимости прямо на карте',
    heroBody:
      'Сравнивайте проверенных застройщиков, активные запуски и стартовые цены в одном профессиональном интерфейсе для поиска по районам.',
    primaryCta: 'Смотреть проекты',
    secondaryCta: 'Открыть карту',
    previewLabel: 'Рекомендуемый проект',
    previewCta: 'Открыть',
    previewMoreCta: 'Подробнее',
    previewFallbackTitle: 'Рекомендуемый проект',
    previewFallbackCopy: 'После публикации активных объектов карточка заполнится живой ценой и локацией из каталога.',
    deliveryPending: 'Срок уточняется',
    previewProjects: 'Проекты',
    previewHomes: 'Лоты',
    previewAreas: 'Районы',
    boardLabel: 'Избранные запуски',
    statsEyebrow: 'Живые метрики',
    statsTitle: 'Ключевые сигналы рынка',
    statCompanies: 'Проверенные застройщики',
    statProjects: 'Активные проекты',
    statHomes: 'Опубликованные квартиры',
    statAverageEntry: 'Средний старт цены',
    projectsEyebrow: 'Избранные проекты',
    projectsTitle: 'Активные запуски, которые стоит изучить',
    projectsCopy: 'Каждая карточка показывает стартовую цену, локацию и срок сдачи в чистой иерархии без лишнего шума.',
    projectStartingFrom: 'Цена от',
    projectBuildings: 'Корпуса',
    openProjects: 'Каталог проектов',
    projectsEmptyTitle: 'Пока нет активных проектов.',
    projectsEmptyCopy: 'Опубликуйте проекты через админ-каталог, и этот блок сразу начнёт показывать живые данные.',
    awaitingInventory: 'Каталог ожидается',
    ctaEyebrow: 'Следующий шаг',
    ctaTitle: 'Переходите от обзора к живому каталогу.',
    ctaCopy: 'Откройте каталог проектов для полного списка или карту для поиска по районам.',
    ctaPrimary: 'Изучить проекты',
    ctaSecondary: 'Живая карта',
  },
};

function getProjectLocation(project: PublicProject) {
  return project.district?.name ?? project.city.name;
}

function getProjectAddressSnippet(address: string) {
  return address
    .split(',')
    .map((part) => part.trim())
    .find(Boolean) ?? '';
}

function getHeroPreviewMeta(project: PublicProject, deliveryFallback: string) {
  return Array.from(
    new Set(
      [
        project.location_label || getProjectLocation(project),
        getProjectAddressSnippet(project.address),
        project.delivery_window || deliveryFallback,
      ].filter(Boolean)
    )
  ).slice(0, 3);
}

function getHeroPreviewPills(project: PublicProject, deliveryFallback: string, projectBuildingsLabel: string) {
  return Array.from(
    new Set(
      [
        getProjectLocation(project),
        project.delivery_window || deliveryFallback,
        project.building_count > 0 ? `${project.building_count} ${projectBuildingsLabel}` : '',
      ].filter(Boolean)
    )
  ).slice(0, 3);
}

function formatProjectPrice(value: string, currency: string, fallback: string) {
  if (!value || Number(value) <= 0) {
    return fallback;
  }

  return formatCurrency(value, currency);
}

export function HomeLanding({
  locale,
  companiesCount,
  projectsCount,
  totalPublishedApartments,
  liveAreas,
  averageProjectEntry,
  featuredProjects,
}: HomeLandingProps) {
  const copy = landingCopy[locale];
  const projectsPath = buildLocalizedPath(locale, '/projects');
  const mapPath = buildLocalizedPath(locale, '/map');
  const leadProject = featuredProjects[0] ?? null;
  const leadProjectMeta = leadProject ? getHeroPreviewMeta(leadProject, copy.deliveryPending) : [];
  const leadProjectPills = leadProject
    ? getHeroPreviewPills(leadProject, copy.deliveryPending, copy.projectBuildings)
    : [];
  const showStats = companiesCount > 1 || projectsCount > 1 || totalPublishedApartments > 1;

  return (
    <main className="landing-home">
      <HomePrimaryNav locale={locale} ctaHref={projectsPath} ctaLabel={copy.primaryCta} />

      <section className="landing-hero" id="top">
        <div className="site-shell landing-hero-grid">
          <div className="landing-hero-copy">
            <div className="landing-hero-copy-head">
              <p className="landing-eyebrow">{copy.heroEyebrow}</p>

              <div className="landing-hero-text">
                <h1 className="landing-hero-title">{copy.heroTitle}</h1>
                <p className="landing-hero-body">{copy.heroBody}</p>
              </div>
            </div>

            <div className="landing-hero-actions">
              <a href={projectsPath} className="landing-button landing-button-primary">
                {copy.primaryCta}
              </a>
              <a href={mapPath} className="landing-button landing-button-secondary">
                {copy.secondaryCta}
              </a>
            </div>
          </div>

          <article className="landing-hero-preview" aria-label={leadProject?.name ?? copy.previewLabel}>
            <div className="landing-hero-preview-media">
              {leadProject?.hero_image_url ? (
                <img
                  src={leadProject.hero_image_url}
                  alt={leadProject.name}
                  className="landing-hero-preview-image"
                />
              ) : (
                <div className="landing-hero-preview-fallback" aria-hidden="true">
                  <span className="landing-hero-preview-fallback-grid" />
                  <span className="landing-hero-preview-fallback-point" />
                  <span className="landing-hero-preview-fallback-point landing-hero-preview-fallback-point-secondary" />
                </div>
              )}

              <div className="landing-hero-preview-media-overlay" aria-hidden="true" />
              <div className="landing-hero-preview-media-chip">
                {leadProject ? getProjectLocation(leadProject) : copy.previewLabel}
              </div>
            </div>

            <div className="landing-hero-preview-body">
              <div className="landing-hero-preview-summary">
                <p className="landing-panel-label">{copy.previewLabel}</p>
                <h2 className="landing-hero-preview-title">{leadProject?.name ?? copy.previewFallbackTitle}</h2>

                <p className="landing-hero-preview-price">
                  {leadProject
                    ? formatProjectPrice(leadProject.starting_price, leadProject.currency, copy.awaitingInventory)
                    : copy.awaitingInventory}
                </p>

                {leadProjectMeta.length ? (
                  <div className="landing-hero-preview-meta" aria-label={copy.previewLabel}>
                    {leadProjectMeta.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : (
                    <p className="landing-hero-preview-note">{copy.previewFallbackCopy}</p>
                )}

                <p className="landing-hero-preview-secondary">
                  {leadProject?.headline || leadProject?.address || copy.previewFallbackCopy}
                </p>
              </div>

              {leadProjectPills.length ? (
                <div className="landing-hero-preview-pills" aria-label={copy.previewLabel}>
                  {leadProjectPills.map((item) => (
                    <span key={item} className="landing-hero-preview-pill">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="landing-hero-preview-actions">
                <a href={projectsPath} className="landing-button landing-button-primary landing-hero-preview-link">
                  {copy.previewCta}
                </a>
                <a href="#projects" className="landing-hero-preview-more">
                  {copy.previewMoreCta}
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {showStats ? (
        <section className="landing-section landing-stats" aria-labelledby="landing-stats-heading">
          <div className="site-shell">
            <div className="landing-section-copy">
              <p className="landing-eyebrow">{copy.statsEyebrow}</p>
              <h2 className="landing-section-title" id="landing-stats-heading">
                {copy.statsTitle}
              </h2>
            </div>

            <div className="landing-stats-grid">
              <article className="landing-stat-card">
                <strong>{formatCompactNumber(companiesCount)}</strong>
                <span>{copy.statCompanies}</span>
              </article>
              <article className="landing-stat-card">
                <strong>{formatCompactNumber(projectsCount)}</strong>
                <span>{copy.statProjects}</span>
              </article>
              <article className="landing-stat-card">
                <strong>{formatCompactNumber(totalPublishedApartments)}</strong>
                <span>{copy.statHomes}</span>
              </article>
              <article className="landing-stat-card">
                <strong>{averageProjectEntry ? formatCurrency(averageProjectEntry) : copy.awaitingInventory}</strong>
                <span>{copy.statAverageEntry}</span>
              </article>
            </div>
          </div>
        </section>
      ) : null}

      <section className="landing-section" id="projects" aria-labelledby="landing-projects-heading">
        <div className="site-shell">
          <div className="landing-section-head">
            <div className="landing-section-copy">
              <p className="landing-eyebrow">{copy.projectsEyebrow}</p>
              <h2 className="landing-section-title" id="landing-projects-heading">
                {copy.projectsTitle}
              </h2>
              <p className="landing-section-body">{copy.projectsCopy}</p>
            </div>

            <a href={projectsPath} className="landing-button landing-button-secondary">
              {copy.openProjects}
            </a>
          </div>

          {featuredProjects.length ? (
            <div className="landing-project-grid">
              {featuredProjects.map((project) => (
                <article key={project.id} className="landing-project-card">
                  <div className="landing-project-media">
                    {project.hero_image_url ? (
                      <img src={project.hero_image_url} alt={project.name} className="landing-project-image" />
                    ) : (
                      <div className="landing-project-image-fallback" aria-hidden="true" />
                    )}
                  </div>

                  <div className="landing-project-content">
                    <div className="landing-project-head">
                      <h3>{project.name}</h3>
                      <p className="landing-project-price">
                        {formatProjectPrice(project.starting_price, project.currency, copy.awaitingInventory)}
                      </p>
                    </div>

                    <div className="landing-project-info">
                      <span>{getProjectLocation(project)}</span>
                      <span>{project.delivery_window || copy.deliveryPending}</span>
                      <span>
                        {project.building_count} {copy.projectBuildings}
                      </span>
                    </div>

                    <div className="landing-project-footer">
                      <span>{copy.projectStartingFrom}</span>
                      <a href={projectsPath}>{copy.openProjects}</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <article className="landing-empty-card">
              <h3>{copy.projectsEmptyTitle}</h3>
              <p>{copy.projectsEmptyCopy}</p>
            </article>
          )}
        </div>
      </section>

      <section className="landing-section landing-cta">
        <div className="site-shell">
          <div className="landing-cta-card">
            <div className="landing-section-copy">
              <p className="landing-eyebrow">{copy.ctaEyebrow}</p>
              <h2 className="landing-section-title">{copy.ctaTitle}</h2>
              <p className="landing-section-body">{copy.ctaCopy}</p>
            </div>

            <div className="landing-cta-actions">
              <a href={projectsPath} className="landing-button landing-button-primary">
                {copy.ctaPrimary}
              </a>
              <a href={mapPath} className="landing-button landing-button-secondary">
                {copy.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
