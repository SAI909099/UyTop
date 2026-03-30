import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCompactNumber, formatCurrency } from '@/lib/utils/format';
import type { PublicCompanyDetail, PublicProject } from '@/types/home';

type DeveloperProfileViewProps = {
  locale: LocaleCode;
  company: PublicCompanyDetail;
};

type DeveloperProfileCopy = {
  pageLabel: string;
  verified: string;
  publicProfile: string;
  founded: string;
  headquarters: string;
  projects: string;
  residences: string;
  regionPending: string;
  foundedPending: string;
  profileLeadFallback: string;
  descriptionFallback: string;
  exploreProjects: string;
  backToDevelopers: string;
  projectsLabel: string;
  projectsTitle: string;
  projectsCopy: string;
  startingFrom: string;
  address: string;
  delivery: string;
  awaitingTimeline: string;
  projectHeadlineFallback: string;
  noProjects: string;
  noProjectsTitle: string;
  noProjectsCopy: string;
};

const developerProfileCopy: Record<LocaleCode, DeveloperProfileCopy> = {
  uz: {
    pageLabel: 'Developer profili',
    verified: 'Tasdiqlangan',
    publicProfile: 'Ommaviy',
    founded: 'Tashkil etilgan',
    headquarters: 'Shtab',
    projects: 'Loyihalar',
    residences: 'Kvartiralar',
    regionPending: 'Hudud ko‘rsatilmagan',
    foundedPending: 'Yil ko‘rsatilmagan',
    profileLeadFallback: 'Ommaviy katalog uchun tayyorlangan professional developer profili.',
    descriptionFallback: 'Developer tavsifi hali katalogga qo‘shilmagan.',
    exploreProjects: 'Loyihalarni ko‘rish',
    backToDevelopers: 'Developerlarga qaytish',
    projectsLabel: 'Loyihalar',
    projectsTitle: 'Bu developerning ommaviy loyihalari.',
    projectsCopy: 'Project card tuzilmasi saqlanadi, shuning uchun narx, manzil va topshirish muddati bir qarashda ko‘rinadi.',
    startingFrom: 'Boshlanish narxi',
    address: 'Manzil',
    delivery: 'Topshirish',
    awaitingTimeline: 'Muddat kutilmoqda',
    projectHeadlineFallback: 'Loyiha shu developer profilida ommaviy katalog orqali ko‘rsatilgan.',
    noProjects: 'Loyihalar hali yo‘q',
    noProjectsTitle: 'Bu developer uchun ommaviy loyihalar topilmadi.',
    noProjectsCopy: 'Loyihalar e’lon qilingach, ular shu sahifada 3 ustunli gridda ko‘rinadi.',
  },
  en: {
    pageLabel: 'Developer profile',
    verified: 'Verified',
    publicProfile: 'Public',
    founded: 'Founded',
    headquarters: 'Headquarters',
    projects: 'Projects',
    residences: 'Residences',
    regionPending: 'Region pending',
    foundedPending: 'Year unavailable',
    profileLeadFallback: 'Professional developer profile prepared for the public catalog.',
    descriptionFallback: 'A longer company description has not been published yet.',
    exploreProjects: 'Explore projects',
    backToDevelopers: 'Back to developers',
    projectsLabel: 'Projects',
    projectsTitle: 'Published projects under this developer.',
    projectsCopy: 'The grid keeps the established project-card structure so price, address, and delivery details stay easy to scan.',
    startingFrom: 'Starting from',
    address: 'Address',
    delivery: 'Delivery',
    awaitingTimeline: 'Timeline pending',
    projectHeadlineFallback: 'This launch is published through the developer profile in the public catalog.',
    noProjects: 'No projects yet',
    noProjectsTitle: 'No public projects are attached to this developer right now.',
    noProjectsCopy: 'As new launches are published, they will appear here in the same 3-column project grid.',
  },
  ru: {
    pageLabel: 'Профиль застройщика',
    verified: 'Проверен',
    publicProfile: 'Публичный',
    founded: 'Основан',
    headquarters: 'Штаб',
    projects: 'Проекты',
    residences: 'Квартиры',
    regionPending: 'Регион не указан',
    foundedPending: 'Год не указан',
    profileLeadFallback: 'Профессиональный профиль застройщика для публичного каталога.',
    descriptionFallback: 'Развёрнутое описание компании пока не опубликовано.',
    exploreProjects: 'Смотреть проекты',
    backToDevelopers: 'Назад к застройщикам',
    projectsLabel: 'Проекты',
    projectsTitle: 'Опубликованные проекты этого застройщика.',
    projectsCopy: 'Сетка сохраняет знакомую структуру project card, чтобы цена, адрес и срок сдачи читались сразу.',
    startingFrom: 'Старт от',
    address: 'Адрес',
    delivery: 'Сдача',
    awaitingTimeline: 'Срок уточняется',
    projectHeadlineFallback: 'Этот проект опубликован в публичном каталоге через профиль застройщика.',
    noProjects: 'Проектов пока нет',
    noProjectsTitle: 'Для этого застройщика пока нет публичных проектов.',
    noProjectsCopy: 'После публикации новых запусков они появятся здесь в той же 3-колоночной сетке.',
  },
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getRegion(company: PublicCompanyDetail, copy: DeveloperProfileCopy) {
  return company.headquarters.trim() || copy.regionPending;
}

function getLead(company: PublicCompanyDetail, copy: DeveloperProfileCopy) {
  return company.tagline.trim() || company.trust_note.trim() || company.short_description.trim() || copy.profileLeadFallback;
}

function getDescription(company: PublicCompanyDetail, copy: DeveloperProfileCopy) {
  return company.description.trim() || company.short_description.trim() || copy.descriptionFallback;
}

function getProjectLocation(project: PublicProject) {
  return (
    project.location_label.trim() ||
    project.address.trim() ||
    (project.district ? `${project.district.name}, ${project.city.name}` : project.city.name)
  );
}

export function DeveloperProfileView({ locale, company }: DeveloperProfileViewProps) {
  const copy = developerProfileCopy[locale];
  const lead = getLead(company, copy);
  const description = getDescription(company, copy);
  const region = getRegion(company, copy);
  const stats = [
    { label: copy.projects, value: formatCompactNumber(company.project_count) },
    { label: copy.residences, value: formatCompactNumber(company.apartment_count) },
    { label: copy.founded, value: company.founded_year ? String(company.founded_year) : copy.foundedPending },
    { label: copy.headquarters, value: region },
  ];

  return (
    <>
      <section className="developer-profile-hero">
        <div className="site-shell">
          <article className="premium-surface developer-profile-header-card">
            <div className="developer-profile-header-row">
              <div className="developer-profile-brand">
                <span className={`developer-profile-logo${company.logo_url ? ' developer-profile-logo-image' : ''}`}>
                  {company.logo_url ? <img src={company.logo_url} alt={`${company.name} logo`} /> : initials(company.name)}
                </span>

                <div className="developer-profile-brand-copy">
                  <p className="section-label">{copy.pageLabel}</p>
                  <div className="developer-profile-title-row">
                    <h1>{company.name}</h1>
                    <span
                      className={`developer-profile-badge${
                        company.is_verified ? ' developer-profile-badge-verified' : ''
                      }`}
                    >
                      {company.is_verified ? copy.verified : copy.publicProfile}
                    </span>
                  </div>
                  <p className="developer-profile-headquarters">{region}</p>
                </div>
              </div>

              <div className="developer-profile-actions">
                <a
                  href={buildLocalizedPath(locale, `/projects?company=${company.id}`)}
                  className="button button-primary"
                >
                  {copy.exploreProjects}
                </a>
                <a href={buildLocalizedPath(locale, '/developers')} className="button button-secondary">
                  {copy.backToDevelopers}
                </a>
              </div>
            </div>

            <div className="developer-profile-copy">
              <p className="developer-profile-tagline">{lead}</p>
              <p className="section-copy">{description}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="developer-profile-section">
        <div className="site-shell">
          <div className="developer-profile-stats-row">
            {stats.map((item) => (
              <article key={item.label} className="premium-surface developer-profile-stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="developer-profile-section developer-profile-projects-section" id="projects">
        <div className="site-shell">
          <div className="developer-profile-section-head">
            <p className="section-label">{copy.projectsLabel}</p>
            <h2 className="section-title">{copy.projectsTitle}</h2>
            <p className="section-copy">{copy.projectsCopy}</p>
          </div>

          {company.projects.length ? (
            <div className="project-grid developer-profile-project-grid">
              {company.projects.map((project) => (
                <article key={project.id} className="project-card premium-surface developer-profile-project-card">
                  {project.hero_image_url ? (
                    <div className="project-media">
                      <img src={project.hero_image_url} alt={project.name} />
                      <div className="project-media-overlay" />
                    </div>
                  ) : (
                    <div className="project-media project-media-placeholder">
                      <span>{project.name.slice(0, 1)}</span>
                    </div>
                  )}

                  <div className="project-card-body">
                    <div className="project-topline">
                      <span>{getProjectLocation(project)}</span>
                      <span>{company.name}</span>
                    </div>
                    <h3>{project.name}</h3>
                    <p>{project.headline.trim() || copy.projectHeadlineFallback}</p>
                    <div className="project-meta-grid">
                      <div>
                        <span>{copy.startingFrom}</span>
                        <strong>{formatCurrency(project.starting_price, project.currency)}</strong>
                      </div>
                      <div>
                        <span>{copy.address}</span>
                        <strong>{project.address || getProjectLocation(project)}</strong>
                      </div>
                      <div>
                        <span>{copy.delivery}</span>
                        <strong>{project.delivery_window || copy.awaitingTimeline}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <article className="premium-surface developer-profile-empty">
              <p className="section-label">{copy.noProjects}</p>
              <h3>{copy.noProjectsTitle}</h3>
              <p>{copy.noProjectsCopy}</p>
            </article>
          )}
        </div>
      </section>
    </>
  );
}
