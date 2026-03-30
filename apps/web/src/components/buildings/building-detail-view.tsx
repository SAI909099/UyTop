import { BuildingFloorExplorer } from '@/components/buildings/building-floor-explorer';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCurrency, formatLabel } from '@/lib/utils/format';
import type { PublicBuildingDetail } from '@/types/home';

type BuildingDetailViewProps = {
  locale: LocaleCode;
  building: PublicBuildingDetail;
};

type BuildingDetailCopy = {
  pricingOnRequest: string;
  fromPrice: string;
  buildingDetail: string;
  handoverPending: string;
  priceAndAvailability: string;
  sidebarCopy: string;
  status: string;
  publicUnits: string;
  totalFloors: string;
  totalApartments: string;
  handover: string;
  project: string;
  pending: string;
  towerScale: string;
  liveUnits: string;
  duskPresentation: string;
  viewAvailableUnits: string;
  backToLiveMap: string;
};

const buildingDetailCopy: Record<LocaleCode, BuildingDetailCopy> = {
  uz: {
    pricingOnRequest: 'Narx so‘rov bo‘yicha',
    fromPrice: 'Boshlanish narxi',
    buildingDetail: 'Bino tafsiloti',
    handoverPending: 'Topshirish kutilmoqda',
    priceAndAvailability: 'Narx va mavjudlik',
    sidebarCopy: 'Qatlamlar va tanlov chap panelda qoladi, asosiy xarid konteksti esa doim ko‘rinishda turadi.',
    status: 'Holat',
    publicUnits: 'Ommaviy lotlar',
    totalFloors: 'Jami qavatlar',
    totalApartments: 'Jami kvartiralar',
    handover: 'Topshirish',
    project: 'Loyiha',
    pending: 'Kutilmoqda',
    towerScale: 'Minora hajmi',
    liveUnits: 'Jonli lotlar',
    duskPresentation: 'Kechki taqdimot',
    viewAvailableUnits: 'Mavjud lotlar',
    backToLiveMap: 'Xaritaga qaytish',
  },
  en: {
    pricingOnRequest: 'Pricing on request',
    fromPrice: 'From',
    buildingDetail: 'Building detail',
    handoverPending: 'Handover pending',
    priceAndAvailability: 'Price & availability',
    sidebarCopy: 'The fixed sidebar keeps the essential buying context visible while the left panel focuses on floors, diagram treatment, and unit selection.',
    status: 'Status',
    publicUnits: 'Public units',
    totalFloors: 'Total floors',
    totalApartments: 'Total apartments',
    handover: 'Handover',
    project: 'Project',
    pending: 'Pending',
    towerScale: 'Tower scale',
    liveUnits: 'Live units',
    duskPresentation: 'Dusk presentation',
    viewAvailableUnits: 'View available units',
    backToLiveMap: 'Back to live map',
  },
  ru: {
    pricingOnRequest: 'Цена по запросу',
    fromPrice: 'От',
    buildingDetail: 'Детали дома',
    handoverPending: 'Срок сдачи уточняется',
    priceAndAvailability: 'Цена и наличие',
    sidebarCopy: 'Фиксированная боковая панель держит основной контекст покупки на виду, пока слева остаются этажи и выбор лотов.',
    status: 'Статус',
    publicUnits: 'Публичные лоты',
    totalFloors: 'Всего этажей',
    totalApartments: 'Всего квартир',
    handover: 'Сдача',
    project: 'Проект',
    pending: 'Уточняется',
    towerScale: 'Масштаб башни',
    liveUnits: 'Живые лоты',
    duskPresentation: 'Вечерняя подача',
    viewAvailableUnits: 'Смотреть доступные лоты',
    backToLiveMap: 'Назад к карте',
  },
};

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function getLocationLabel(building: PublicBuildingDetail) {
  return building.project.district ? `${building.project.district.name}, ${building.project.city.name}` : building.project.city.name;
}

function getHeroImage(building: PublicBuildingDetail) {
  return building.cover_image_url || building.project.hero_image_url || null;
}

function getPriceSummary(building: PublicBuildingDetail, copy: BuildingDetailCopy) {
  const priceFrom = numeric(building.price_from);
  const priceTo = numeric(building.price_to);

  if (priceFrom <= 0 && priceTo <= 0) {
    return copy.pricingOnRequest;
  }

  if (priceFrom > 0 && priceTo > priceFrom) {
    return `${formatCurrency(priceFrom)} - ${formatCurrency(priceTo)}`;
  }

  return `${copy.fromPrice} ${formatCurrency(priceFrom || priceTo)}`;
}

function getSummaryCopy(building: PublicBuildingDetail) {
  return (
    building.summary.trim() ||
    building.project.headline.trim() ||
    `${building.name} brings a cinematic tower presentation into the live public catalog, with pricing and unit visibility held beside the floor interaction instead of hidden in a secondary screen.`
  );
}

export function BuildingDetailView({ locale, building }: BuildingDetailViewProps) {
  const copy = buildingDetailCopy[locale];
  const heroImage = getHeroImage(building);
  const locationLabel = getLocationLabel(building);
  const priceSummary = getPriceSummary(building, copy);

  return (
    <>
      <section className="building-detail-hero">
        <div className="building-detail-hero-layer building-detail-hero-layer-one" />
        <div className="building-detail-hero-layer building-detail-hero-layer-two" />

        <div className="site-shell">
          <div className="building-detail-hero-media">
            {heroImage ? (
              <img src={heroImage} alt={building.name} />
            ) : (
              <div className="building-detail-hero-placeholder">{building.name.slice(0, 1)}</div>
            )}
            <div className="building-detail-hero-overlay" />

            <div className="building-detail-hero-copy">
              <p className="hero-badge">
                <span className="hero-badge-dot" />
                {copy.buildingDetail}
              </p>
              <h1>{building.name}</h1>
              <p className="building-detail-hero-lead">{getSummaryCopy(building)}</p>

              <div className="building-detail-hero-meta">
                <span>{building.project.name}</span>
                <span>{locationLabel}</span>
                <span>{building.handover || copy.handoverPending}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="building-detail-section">
        <div className="site-shell building-detail-layout">
          <BuildingFloorExplorer building={building} />

          <aside className="building-detail-sidebar premium-surface">
            <p className="section-label">{copy.priceAndAvailability}</p>
            <h2 className="building-detail-sidebar-title">{priceSummary}</h2>
            <p className="section-copy">{copy.sidebarCopy}</p>

            <div className="building-detail-sidebar-grid">
              <div>
                <span>{copy.status}</span>
                <strong>{formatLabel(building.status)}</strong>
              </div>
              <div>
                <span>{copy.publicUnits}</span>
                <strong>{building.apartments_left}</strong>
              </div>
              <div>
                <span>{copy.totalFloors}</span>
                <strong>{building.total_floors ?? copy.pending}</strong>
              </div>
              <div>
                <span>{copy.totalApartments}</span>
                <strong>{building.total_apartments ?? copy.pending}</strong>
              </div>
              <div>
                <span>{copy.handover}</span>
                <strong>{building.handover || copy.pending}</strong>
              </div>
              <div>
                <span>{copy.project}</span>
                <strong>{building.project.name}</strong>
              </div>
            </div>

            <div className="building-detail-amenity-row" aria-label="Building highlights">
              <span>
                <i className="building-detail-amenity-icon" aria-hidden="true" />
                {copy.towerScale}
              </span>
              <span>
                <i className="building-detail-amenity-icon" aria-hidden="true" />
                {copy.liveUnits}
              </span>
              <span>
                <i className="building-detail-amenity-icon" aria-hidden="true" />
                {copy.duskPresentation}
              </span>
            </div>

            <div className="building-detail-sidebar-actions">
              <a href="#available-units" className="button button-primary">
                {copy.viewAvailableUnits}
              </a>
              <a href={buildLocalizedPath(locale, '/map')} className="button button-secondary">
                {copy.backToLiveMap}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
