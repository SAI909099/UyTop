import { ApartmentLocationMap } from '@/components/apartments/apartment-location-map';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCurrency, formatLabel, formatRooms } from '@/lib/utils/format';
import type { PublicApartmentDetail } from '@/types/home';

type ApartmentDetailViewProps = {
  locale: LocaleCode;
  apartment: PublicApartmentDetail;
};

type ApartmentDetailCopy = {
  areaPending: string;
  apartmentDetail: string;
  openLiveMap: string;
  moreResidences: string;
  backHome: string;
  quietLuxuryResidence: string;
  price: string;
  status: string;
  rooms: string;
  area: string;
  floor: string;
  pending: string;
  district: string;
  residenceOverview: string;
  overviewTitle: string;
  apartmentNumber: string;
  building: string;
  buildingCode: string;
  developer: string;
  project: string;
  address: string;
  paymentOptions: string;
  paymentTitle: string;
  paymentCopy: string;
  paymentFallback: string;
  noPaymentPaths: string;
  noPaymentCopy: string;
  locationAndAddress: string;
  locationTitle: string;
  city: string;
  coordinates: string;
  notSpecified: string;
  locationUnavailable: string;
  mapCoordinatesUnavailable: string;
  continueBrowsing: string;
  continueBrowsingTitle: string;
  continueBrowsingCopy: string;
  backToLiveMap: string;
  browseMoreResidences: string;
};

const apartmentDetailCopy: Record<LocaleCode, ApartmentDetailCopy> = {
  uz: {
    areaPending: 'Maydon kutilmoqda',
    apartmentDetail: 'Kvartira tafsiloti',
    openLiveMap: 'Jonli xarita',
    moreResidences: 'Ko‘proq uylar',
    backHome: 'Bosh sahifa',
    quietLuxuryResidence: 'Premium uy',
    price: 'Narx',
    status: 'Holat',
    rooms: 'Xonalar',
    area: 'Maydon',
    floor: 'Qavat',
    pending: 'Kutilmoqda',
    district: 'Tuman',
    residenceOverview: 'Uy haqida',
    overviewTitle: 'Kvartiraning asosiy signallari tasvirlar bilan birga ko‘rinadi.',
    apartmentNumber: 'Kvartira raqami',
    building: 'Bino',
    buildingCode: 'Bino kodi',
    developer: 'Developer',
    project: 'Loyiha',
    address: 'Manzil',
    paymentOptions: 'To‘lov variantlari',
    paymentTitle: 'Xarid tuzilmasi yo‘llari.',
    paymentCopy: 'Moliyalashtirish eslatmalari katalog yozuvidan olinadi, shuning uchun sahifa doim jonli konfiguratsiyani ko‘rsatadi.',
    paymentFallback: 'Bu to‘lov yo‘li bo‘yicha tafsilotlar developer bilan tasdiqlanadi.',
    noPaymentPaths: 'To‘lov yo‘llari hali e’lon qilinmagan.',
    noPaymentCopy: 'Moliyalashtirish variantlari katalog yangilanganda shu yerda ko‘rinadi.',
    locationAndAddress: 'Joylashuv va manzil',
    locationTitle: 'Xarita konteksti detal sahifasining bir qismi bo‘lib qoladi.',
    city: 'Shahar',
    coordinates: 'Koordinatalar',
    notSpecified: 'Ko‘rsatilmagan',
    locationUnavailable: 'Joylashuv belgisi mavjud emas',
    mapCoordinatesUnavailable: 'Bu uy uchun xarita koordinatalari hali e’lon qilinmagan.',
    continueBrowsing: 'Ko‘rishni davom ettirish',
    continueBrowsingTitle: 'Premium tafsilot sahifasidan chiqmasdan qidiruvga qayting.',
    continueBrowsingCopy: 'Jonli xaritaga qayting yoki boshqa uylarni ko‘rishda davom eting.',
    backToLiveMap: 'Xaritaga qaytish',
    browseMoreResidences: 'Ko‘proq uylar',
  },
  en: {
    areaPending: 'Area pending',
    apartmentDetail: 'Apartment detail',
    openLiveMap: 'Open live map',
    moreResidences: 'More residences',
    backHome: 'Back to homepage',
    quietLuxuryResidence: 'Quiet luxury residence',
    price: 'Price',
    status: 'Status',
    rooms: 'Rooms',
    area: 'Area',
    floor: 'Floor',
    pending: 'Pending',
    district: 'District',
    residenceOverview: 'Residence overview',
    overviewTitle: 'Every core apartment signal stays readable beside the visuals.',
    apartmentNumber: 'Apartment number',
    building: 'Building',
    buildingCode: 'Building code',
    developer: 'Developer',
    project: 'Project',
    address: 'Address',
    paymentOptions: 'Payment options',
    paymentTitle: 'Ways to structure the purchase.',
    paymentCopy: 'Financing notes come directly from the published catalog record, so the public page reflects the live apartment configuration rather than placeholder marketing copy.',
    paymentFallback: 'Details for this payment path will be confirmed with the developer.',
    noPaymentPaths: 'No payment paths have been published yet.',
    noPaymentCopy: 'The residence stays visible, but financing labels will appear here once the catalog data is updated.',
    locationAndAddress: 'Location and address',
    locationTitle: 'Map-first context remains part of the detail page.',
    city: 'City',
    coordinates: 'Coordinates',
    notSpecified: 'Not specified',
    locationUnavailable: 'Location pin unavailable',
    mapCoordinatesUnavailable: 'Map coordinates are not published for this residence yet.',
    continueBrowsing: 'Continue browsing',
    continueBrowsingTitle: 'Return to discovery without losing the premium detail treatment.',
    continueBrowsingCopy: 'Jump back into the live map, revisit the homepage residences, or keep this route as the shareable detail page for a single apartment.',
    backToLiveMap: 'Back to live map',
    browseMoreResidences: 'Browse more residences',
  },
  ru: {
    areaPending: 'Площадь уточняется',
    apartmentDetail: 'Детали квартиры',
    openLiveMap: 'Открыть карту',
    moreResidences: 'Другие квартиры',
    backHome: 'На главную',
    quietLuxuryResidence: 'Премиальная квартира',
    price: 'Цена',
    status: 'Статус',
    rooms: 'Комнаты',
    area: 'Площадь',
    floor: 'Этаж',
    pending: 'Уточняется',
    district: 'Район',
    residenceOverview: 'Обзор квартиры',
    overviewTitle: 'Все ключевые сигналы квартиры остаются читаемыми рядом с визуалом.',
    apartmentNumber: 'Номер квартиры',
    building: 'Дом',
    buildingCode: 'Код дома',
    developer: 'Застройщик',
    project: 'Проект',
    address: 'Адрес',
    paymentOptions: 'Варианты оплаты',
    paymentTitle: 'Способы оформить покупку.',
    paymentCopy: 'Финансовые условия берутся из опубликованной записи каталога, поэтому страница показывает живую конфигурацию квартиры.',
    paymentFallback: 'Детали этого способа оплаты будут подтверждены с застройщиком.',
    noPaymentPaths: 'Варианты оплаты пока не опубликованы.',
    noPaymentCopy: 'Квартира остаётся видимой, а блок с оплатой появится после обновления каталога.',
    locationAndAddress: 'Локация и адрес',
    locationTitle: 'Контекст карты остаётся частью страницы деталей.',
    city: 'Город',
    coordinates: 'Координаты',
    notSpecified: 'Не указано',
    locationUnavailable: 'Метка недоступна',
    mapCoordinatesUnavailable: 'Координаты для этой квартиры пока не опубликованы.',
    continueBrowsing: 'Продолжить просмотр',
    continueBrowsingTitle: 'Возвращайтесь к поиску, не теряя премиальную детализацию.',
    continueBrowsingCopy: 'Вернитесь на карту или продолжайте просмотр других квартир.',
    backToLiveMap: 'Назад к карте',
    browseMoreResidences: 'Другие квартиры',
  },
};

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function getLocationLabel(apartment: PublicApartmentDetail) {
  return apartment.district ? `${apartment.district.name}, ${apartment.city.name}` : apartment.city.name;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getGalleryImages(apartment: PublicApartmentDetail) {
  const sources = [
    apartment.primary_image,
    ...apartment.images
      .sort((left, right) => Number(right.is_primary) - Number(left.is_primary) || left.sort_order - right.sort_order)
      .map((image) => image.image_url),
  ];

  return sources.filter((value, index, items): value is string => Boolean(value?.trim()) && items.indexOf(value) === index);
}

export function ApartmentDetailView({ locale, apartment }: ApartmentDetailViewProps) {
  const copy = apartmentDetailCopy[locale];
  const locationLabel = getLocationLabel(apartment);
  const galleryImages = getGalleryImages(apartment);
  const leadImage = galleryImages[0] ?? null;
  const statusLabel = formatLabel(apartment.status);
  const sizeValue = numeric(apartment.size_sqm);
  const sizeLabel = sizeValue > 0 ? `${sizeValue.toFixed(0)} sqm` : copy.areaPending;
  const latitude = Number(apartment.latitude);
  const longitude = Number(apartment.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const description =
    apartment.description.trim() ||
    `${apartment.title} is part of ${apartment.project_name} and keeps the project, building, and location context visible in one quiet-luxury detail view.`;
  const snapshotItems = [
    { label: copy.price, value: formatCurrency(apartment.price, apartment.currency) },
    { label: copy.status, value: statusLabel },
    { label: copy.rooms, value: formatRooms(apartment.rooms) },
    { label: copy.area, value: sizeLabel },
    { label: copy.floor, value: Number.isFinite(apartment.floor) ? String(apartment.floor) : copy.pending },
    { label: copy.district, value: apartment.district?.name ?? apartment.city.name },
  ];

  return (
    <>
      <section className="apartment-detail-hero">
        <div className="apartment-detail-hero-layer apartment-detail-hero-layer-one" />
        <div className="apartment-detail-hero-layer apartment-detail-hero-layer-two" />
        <div className="site-shell apartment-detail-hero-grid">
          <div className="apartment-detail-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              {copy.apartmentDetail}
            </p>

            <div className="apartment-detail-breadcrumbs" aria-label="Residence context">
              <span>{apartment.company_name}</span>
              <span>{apartment.project_name}</span>
              <span>{apartment.building_name}</span>
            </div>

            <div className="apartment-detail-title-stack">
              <h1>{apartment.title}</h1>
              <div className="apartment-detail-price-pill">{formatCurrency(apartment.price, apartment.currency)}</div>
            </div>

            <p className="apartment-detail-lead">
              {apartment.title} sits in {locationLabel}, inside {apartment.project_name}, and keeps verified
              residential context visible beside the imagery instead of burying it below the fold.
            </p>

            <div className="hero-actions">
              <a href={buildLocalizedPath(locale, '/map')} className="button button-primary">
                {copy.openLiveMap}
              </a>
              <a href={buildLocalizedPath(locale, '/residences')} className="button button-secondary">
                {copy.moreResidences}
              </a>
              <a href={buildLocalizedPath(locale, '/')} className="button button-ghost">
                {copy.backHome}
              </a>
            </div>

            <div className="apartment-detail-tag-row">
              <span>{statusLabel}</span>
              <span>{locationLabel}</span>
              <span>{apartment.apartment_number}</span>
              <span>{apartment.building_code}</span>
            </div>
          </div>

          <article className="apartment-detail-gallery premium-surface">
            <div className="apartment-detail-gallery-lead">
              {leadImage ? (
                <img src={leadImage} alt={apartment.title} />
              ) : (
                <div className="apartment-detail-gallery-placeholder">{getInitials(apartment.project_name || apartment.title)}</div>
              )}

              <div className="apartment-detail-gallery-overlay" />
              <div className="apartment-detail-gallery-topline">
                <p className="section-label">{copy.quietLuxuryResidence}</p>
                <span>{statusLabel}</span>
              </div>
              <div className="apartment-detail-gallery-caption">
                <strong>{apartment.project_name}</strong>
                <span>
                  {apartment.building_name} · {locationLabel}
                </span>
              </div>
            </div>

            {galleryImages.length > 1 ? (
              <div className="apartment-detail-gallery-strip">
                {galleryImages.slice(1, 5).map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="apartment-detail-gallery-thumb">
                    <img src={imageUrl} alt={`${apartment.title} view ${index + 2}`} />
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="apartment-detail-snapshot-strip">
        <div className="site-shell apartment-detail-snapshot-grid">
          {snapshotItems.map((item) => (
            <article key={item.label} className="apartment-detail-snapshot-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="apartment-detail-content-section">
        <div className="site-shell apartment-detail-content-grid">
          <article className="premium-surface apartment-detail-story-card">
            <p className="section-label">{copy.residenceOverview}</p>
            <h2 className="apartment-detail-section-title">{copy.overviewTitle}</h2>
            <p className="section-copy">{description}</p>

            <div className="apartment-detail-identity-grid">
              <div>
                <span>{copy.apartmentNumber}</span>
                <strong>{apartment.apartment_number}</strong>
              </div>
              <div>
                <span>{copy.building}</span>
                <strong>{apartment.building_name}</strong>
              </div>
              <div>
                <span>{copy.buildingCode}</span>
                <strong>{apartment.building_code}</strong>
              </div>
              <div>
                <span>{copy.developer}</span>
                <strong>{apartment.company_name}</strong>
              </div>
              <div>
                <span>{copy.project}</span>
                <strong>{apartment.project_name}</strong>
              </div>
              <div>
                <span>{copy.address}</span>
                <strong>{apartment.address}</strong>
              </div>
            </div>
          </article>

          <article className="premium-surface apartment-detail-payment-card">
            <p className="section-label">{copy.paymentOptions}</p>
            <h2 className="apartment-detail-section-title">{copy.paymentTitle}</h2>
            <p className="section-copy">{copy.paymentCopy}</p>

            {apartment.payment_options.length ? (
              <div className="apartment-detail-payment-grid">
                {apartment.payment_options.map((option) => (
                  <article key={`${option.payment_type}-${option.notes}`} className="apartment-detail-payment-item">
                    <strong>{formatLabel(option.payment_type)}</strong>
                    <p>{option.notes.trim() || copy.paymentFallback}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="apartment-detail-empty-state">
                <h3>{copy.noPaymentPaths}</h3>
                <p>{copy.noPaymentCopy}</p>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="apartment-detail-location-section">
        <div className="site-shell apartment-detail-location-grid">
          <article className="premium-surface apartment-detail-location-copy">
            <p className="section-label">{copy.locationAndAddress}</p>
            <h2 className="apartment-detail-section-title">{copy.locationTitle}</h2>
            <p className="section-copy">
              {apartment.address} in {locationLabel}. The detail route keeps the address, project, and building identity
              visible next to the map instead of sending users back into search to rebuild context.
            </p>

            <div className="apartment-detail-location-meta">
              <div>
                <span>{copy.city}</span>
                <strong>{apartment.city.name}</strong>
              </div>
              <div>
                <span>{copy.district}</span>
                <strong>{apartment.district?.name ?? copy.notSpecified}</strong>
              </div>
              <div>
                <span>{copy.coordinates}</span>
                <strong>
                  {hasCoordinates ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : copy.locationUnavailable}
                </strong>
              </div>
            </div>
          </article>

          <article className="premium-surface apartment-detail-map-card">
            {hasCoordinates ? (
              <ApartmentLocationMap
                latitude={latitude}
                longitude={longitude}
                title={apartment.title}
                locationLabel={locationLabel}
              />
            ) : (
              <div className="apartment-location-map-fallback">
                <p>{copy.mapCoordinatesUnavailable}</p>
                <span>{locationLabel}</span>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="cta-section apartment-detail-cta-section">
        <div className="site-shell cta-shell premium-surface">
          <p className="section-label">{copy.continueBrowsing}</p>
          <h2 className="section-title">{copy.continueBrowsingTitle}</h2>
          <p className="section-copy">{copy.continueBrowsingCopy}</p>
          <div className="cta-actions">
            <a href={buildLocalizedPath(locale, '/map')} className="button button-primary">
              {copy.backToLiveMap}
            </a>
            <a href={buildLocalizedPath(locale, '/residences')} className="button button-secondary">
              {copy.browseMoreResidences}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
