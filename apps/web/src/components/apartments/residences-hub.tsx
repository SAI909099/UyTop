import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCompactNumber, formatCurrency, formatRooms } from '@/lib/utils/format';
import type { PublicApartmentSort, PublicApartmentSummary } from '@/types/home';

const DEFAULT_SORT: PublicApartmentSort = 'newest';

type ResidencesHubProps = {
  locale: LocaleCode;
  residences: PublicApartmentSummary[];
  totalCount: number;
  searchQuery: string;
  sort: PublicApartmentSort;
  currentPage: number;
  pageSize: number;
  hasError?: boolean;
};

type DirectoryState = {
  q: string;
  sort: PublicApartmentSort;
  page: number;
};

type ResidencesCopy = {
  pageLabel: string;
  pageTitle: string;
  pageLead: string;
  searchResidences: string;
  searchPlaceholder: string;
  searchHint: string;
  newest: string;
  lowestPrice: string;
  highestPrice: string;
  publishedResidences: string;
  matchesFor: (count: number, query: string) => string;
  clearSearch: string;
  sortBy: string;
  catalogLoadError: string;
  retry: string;
  locationFallback: string;
  pricePending: string;
  areaPending: string;
  rooms: string;
  area: string;
  floor: string;
  viewResidence: string;
  noMatches: string;
  noResidences: string;
  noMatchesTitle: string;
  noResidencesTitle: string;
  noMatchesCopy: string;
  noResidencesCopy: string;
  previous: string;
  next: string;
  pageSummary: (start: number, end: number, total: number) => string;
};

const residencesCopy: Record<LocaleCode, ResidencesCopy> = {
  uz: {
    pageLabel: 'Kvartiralar katalogi',
    pageTitle: 'Jonli kvartiralarni aniq listing orqali toping.',
    pageLead:
      'Ommaviy kvartiralarni bitta route ichida qidiring, narx bo‘yicha saralang va to‘liq apartment sahifasiga o‘ting.',
    searchResidences: 'Kvartiralarni qidirish',
    searchPlaceholder: 'Kvartira, loyiha, bino, tuman yoki manzil',
    searchHint: 'Qidiruv uchun Enter bosing.',
    newest: 'Yangi',
    lowestPrice: 'Eng arzon',
    highestPrice: 'Eng qimmat',
    publishedResidences: 'e’lon qilingan kvartiralar',
    matchesFor: (count, query) => `"${query}" bo‘yicha ${count} ta natija`,
    clearSearch: 'Qidiruvni tozalash',
    sortBy: 'Saralash',
    catalogLoadError: 'Kvartiralar katalogini yuklab bo‘lmadi.',
    retry: 'Qayta urinish',
    locationFallback: 'Manzil kutilmoqda',
    pricePending: 'Narx so‘rov bo‘yicha',
    areaPending: 'Maydon kutilmoqda',
    rooms: 'Xonalar',
    area: 'Maydon',
    floor: 'Qavat',
    viewResidence: 'Kvartirani ochish',
    noMatches: 'Mos kelmadi',
    noResidences: 'Kvartiralar yo‘q',
    noMatchesTitle: 'Joriy qidiruv bo‘yicha kvartiralar topilmadi.',
    noResidencesTitle: 'Hali ommaviy kvartiralar yo‘q.',
    noMatchesCopy: 'Qidiruvni soddalashtiring yoki tozalab ko‘proq kvartiralarni qaytaring.',
    noResidencesCopy: 'Katalogga ommaviy kvartiralar joylang va bu sahifa jonli listingni ko‘rsatadi.',
    previous: 'Oldingi',
    next: 'Keyingi',
    pageSummary: (start, end, total) => `${total} ta kvartiradan ${start}-${end} ko‘rsatilmoqda`,
  },
  en: {
    pageLabel: 'Apartment directory',
    pageTitle: 'Browse live apartments through a clearer listing.',
    pageLead:
      'Search the public apartment catalog from one route, change sort order, and open the full apartment page without returning to the homepage.',
    searchResidences: 'Search apartments',
    searchPlaceholder: 'Apartment, project, building, district, or address',
    searchHint: 'Press Enter to search.',
    newest: 'Newest',
    lowestPrice: 'Lowest price',
    highestPrice: 'Highest price',
    publishedResidences: 'published apartments',
    matchesFor: (count, query) => `${count} ${count === 1 ? 'result' : 'results'} for "${query}"`,
    clearSearch: 'Clear search',
    sortBy: 'Sort by',
    catalogLoadError: 'The apartment catalog could not be loaded.',
    retry: 'Try again',
    locationFallback: 'Location pending',
    pricePending: 'Price on request',
    areaPending: 'Area pending',
    rooms: 'Rooms',
    area: 'Area',
    floor: 'Floor',
    viewResidence: 'View apartment',
    noMatches: 'No matches',
    noResidences: 'No apartments',
    noMatchesTitle: 'No apartments match the current search query.',
    noResidencesTitle: 'No public apartments are active yet.',
    noMatchesCopy: 'Simplify the search or clear it to bring more apartments back into view.',
    noResidencesCopy: 'Publish public apartments in the catalog and this page will render the live listing.',
    previous: 'Previous',
    next: 'Next',
    pageSummary: (start, end, total) => `Showing ${start}-${end} of ${total} apartments`,
  },
  ru: {
    pageLabel: 'Каталог квартир',
    pageTitle: 'Ищите живые квартиры в более понятном листинге.',
    pageLead:
      'Ищите квартиры по публичному каталогу в одном route, меняйте сортировку и переходите на полную страницу квартиры.',
    searchResidences: 'Поиск квартир',
    searchPlaceholder: 'Квартира, проект, дом, район или адрес',
    searchHint: 'Нажмите Enter для поиска.',
    newest: 'Сначала новые',
    lowestPrice: 'Сначала дешевле',
    highestPrice: 'Сначала дороже',
    publishedResidences: 'опубликованные квартиры',
    matchesFor: (count, query) => `${count} ${count === 1 ? 'результат' : count < 5 ? 'результата' : 'результатов'} по "${query}"`,
    clearSearch: 'Очистить поиск',
    sortBy: 'Сортировка',
    catalogLoadError: 'Не удалось загрузить каталог квартир.',
    retry: 'Повторить',
    locationFallback: 'Локация уточняется',
    pricePending: 'Цена по запросу',
    areaPending: 'Площадь уточняется',
    rooms: 'Комнаты',
    area: 'Площадь',
    floor: 'Этаж',
    viewResidence: 'Открыть квартиру',
    noMatches: 'Нет совпадений',
    noResidences: 'Нет квартир',
    noMatchesTitle: 'По текущему поисковому запросу квартиры не найдены.',
    noResidencesTitle: 'Пока нет активных публичных квартир.',
    noMatchesCopy: 'Упростите запрос или очистите поиск, чтобы вернуть больше квартир.',
    noResidencesCopy: 'Опубликуйте квартиры в каталоге, и эта страница покажет живой листинг.',
    previous: 'Назад',
    next: 'Далее',
    pageSummary: (start, end, total) => `Показано ${start}-${end} из ${total} квартир`,
  },
};

function getSortOptions(copy: ResidencesCopy): Array<{ value: PublicApartmentSort; label: string }> {
  return [
    { value: 'newest', label: copy.newest },
    { value: 'price_asc', label: copy.lowestPrice },
    { value: 'price_desc', label: copy.highestPrice },
  ];
}

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function getLocationLabel(apartment: PublicApartmentSummary, copy: ResidencesCopy) {
  if (apartment.district) {
    return `${apartment.district.name}, ${apartment.city.name}`;
  }

  return apartment.city.name || copy.locationFallback;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getAreaLabel(apartment: PublicApartmentSummary, copy: ResidencesCopy) {
  const sizeValue = numeric(apartment.size_sqm);

  if (sizeValue <= 0) {
    return copy.areaPending;
  }

  return `${sizeValue.toFixed(sizeValue % 1 === 0 ? 0 : 1)} sqm`;
}

function getPageLabel(currentPage: number, pageSize: number, totalCount: number, copy: ResidencesCopy) {
  if (totalCount === 0) {
    return copy.noResidences;
  }

  const pageStart = (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(totalCount, pageStart + pageSize - 1);
  return copy.pageSummary(pageStart, pageEnd, totalCount);
}

function buildPagination(totalPages: number, currentPage: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items: Array<number | string> = [];
  let previousPage = 0;

  sortedPages.forEach((page) => {
    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}-${page}`);
    }

    items.push(page);
    previousPage = page;
  });

  return items;
}

function buildResidencesHref(locale: LocaleCode, currentState: DirectoryState, overrides: Partial<DirectoryState>) {
  const nextState = {
    ...currentState,
    ...overrides,
  };
  const query = new URLSearchParams();

  if (nextState.q) {
    query.set('q', nextState.q);
  }

  if (nextState.sort !== DEFAULT_SORT) {
    query.set('sort', nextState.sort);
  }

  if (nextState.page > 1) {
    query.set('page', String(nextState.page));
  }

  const serialized = query.toString();
  const basePath = buildLocalizedPath(locale, '/residences');
  return serialized ? `${basePath}?${serialized}` : basePath;
}

function DirectoryInfoIcon({ type }: { type: 'rooms' | 'area' | 'floor' }) {
  if (type === 'rooms') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M2.5 7.5h11v5.25a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75V7.5Zm0-4.25c0-.414.336-.75.75-.75h3.5c.414 0 .75.336.75.75V6h-5V3.25Zm6.5 0c0-.414.336-.75.75-.75h2.5c.414 0 .75.336.75.75V6H9V3.25Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === 'area') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3.25 2.5h3a.75.75 0 0 1 0 1.5h-1.19L7 5.94a.75.75 0 1 1-1.06 1.06L4 5.06v1.19a.75.75 0 0 1-1.5 0v-3c0-.414.336-.75.75-.75Zm6.5 0h3c.414 0 .75.336.75.75v3a.75.75 0 0 1-1.5 0V5.06L10.06 7a.75.75 0 0 1-1.06-1.06L10.94 4H9.75a.75.75 0 0 1 0-1.5ZM6.25 12h-1.19L7 10.06A.75.75 0 0 0 5.94 9L4 10.94V9.75a.75.75 0 0 0-1.5 0v3c0 .414.336.75.75.75h3a.75.75 0 0 0 0-1.5Zm7.25-2.25a.75.75 0 0 0-1.5 0v1.19L10.06 9A.75.75 0 1 0 9 10.06L10.94 12H9.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75v-3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.75a.75.75 0 0 1 .75.75v4.69l2.22 2.22a.75.75 0 1 1-1.06 1.06L7.47 8.03A.75.75 0 0 1 7.25 7.5v-5A.75.75 0 0 1 8 1.75Zm0 12.5a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ResidencesHub({
  locale,
  residences,
  totalCount,
  searchQuery,
  sort,
  currentPage,
  pageSize,
  hasError = false,
}: ResidencesHubProps) {
  const copy = residencesCopy[locale];
  const sortOptions = getSortOptions(copy);
  const activeState = { q: searchQuery, sort, page: currentPage };
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginationItems = totalPages > 1 ? buildPagination(totalPages, currentPage) : [];
  const hasSearch = searchQuery.length > 0;

  return (
    <main className="residences-directory-page">
      <div className="site-shell">
        <section className="residences-directory-top">
          <div className="residences-directory-heading">
            <p className="section-label">{copy.pageLabel}</p>
            <h1 className="residences-directory-title">{copy.pageTitle}</h1>
            <p className="residences-directory-lead">{copy.pageLead}</p>
          </div>

          <div className="premium-surface residences-directory-toolbar">
            <form action={buildLocalizedPath(locale, '/residences')} className="residences-directory-search-form">
              <label className="residences-directory-search" htmlFor="residences-directory-search">
                <span>{copy.searchResidences}</span>
                <div className="residences-directory-search-shell">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M11.63 10.57 14.28 13.22a.75.75 0 1 1-1.06 1.06l-2.65-2.65a5.5 5.5 0 1 1 1.06-1.06ZM6.75 11A4.25 4.25 0 1 0 6.75 2.5a4.25 4.25 0 0 0 0 8.5Z"
                      fill="currentColor"
                    />
                  </svg>
                  <input
                    id="residences-directory-search"
                    type="search"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder={copy.searchPlaceholder}
                  />
                </div>
              </label>
              <input type="hidden" name="sort" value={sort} />
              <p className="residences-directory-search-hint">{copy.searchHint}</p>
            </form>

            <div className="residences-directory-results-bar">
              <div className="residences-directory-results-copy">
                <strong>{formatCompactNumber(totalCount)}</strong>
                <span>{hasSearch ? copy.matchesFor(totalCount, searchQuery) : copy.publishedResidences}</span>
              </div>

              <div className="residences-directory-toolbar-actions">
                <div className="residences-directory-sort-list" aria-label={copy.sortBy}>
                  {sortOptions.map((option) => (
                    <a
                      key={option.value}
                      href={buildResidencesHref(locale, activeState, { sort: option.value, page: 1 })}
                      className={`residences-directory-sort-pill${sort === option.value ? ' residences-directory-sort-pill-active' : ''}`}
                    >
                      {option.label}
                    </a>
                  ))}
                </div>

                {hasSearch ? (
                  <a href={buildResidencesHref(locale, activeState, { q: '', page: 1 })} className="button button-secondary residences-directory-clear">
                    {copy.clearSearch}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="residences-directory-results">
          {hasError ? (
            <article className="premium-surface residences-directory-feedback" role="status">
              <p className="section-label">{copy.noMatches}</p>
              <h2>{copy.catalogLoadError}</h2>
              <div className="residences-directory-feedback-actions">
                <a href={buildResidencesHref(locale, activeState, {})} className="button button-primary">
                  {copy.retry}
                </a>
              </div>
            </article>
          ) : null}

          {!hasError && residences.length ? (
            <>
              <div className="residences-directory-grid">
                {residences.map((residence) => {
                  const image = residence.primary_image || residence.images[0]?.image_url || null;
                  const locationLabel = getLocationLabel(residence, copy);
                  const areaLabel = getAreaLabel(residence, copy);
                  const floorLabel = residence.floor > 0 ? String(residence.floor) : '-';

                  return (
                    <article key={residence.slug} className="premium-surface residences-directory-card">
                      <div className="residences-directory-card-media">
                        {image ? (
                          <img src={image} alt={residence.title} loading="lazy" />
                        ) : (
                          <div className="residences-directory-card-placeholder" aria-hidden="true">
                            <span>{getInitials(residence.project_name || residence.title)}</span>
                          </div>
                        )}
                      </div>

                      <div className="residences-directory-card-body">
                        <div className="residences-directory-card-topline">
                          <span>{locationLabel}</span>
                          <span>{residence.project_name}</span>
                        </div>

                        <div className="residences-directory-card-copy">
                          <h3>{residence.title}</h3>
                          <strong className="residences-directory-card-price">
                            {numeric(residence.price) > 0 ? formatCurrency(residence.price, residence.currency) : copy.pricePending}
                          </strong>
                        </div>

                        <p className="residences-directory-card-context">
                          {[residence.company_name, residence.building_name, residence.apartment_number].filter(Boolean).join(' • ')}
                        </p>

                        <div className="residences-directory-card-info">
                          <span className="residences-directory-info-item">
                            <DirectoryInfoIcon type="rooms" />
                            <span>{formatRooms(residence.rooms)}</span>
                          </span>
                          <span className="residences-directory-info-item">
                            <DirectoryInfoIcon type="area" />
                            <span>{areaLabel}</span>
                          </span>
                          <span className="residences-directory-info-item">
                            <DirectoryInfoIcon type="floor" />
                            <span>
                              {copy.floor}: {floorLabel}
                            </span>
                          </span>
                        </div>

                        <a href={buildLocalizedPath(locale, `/apartments/${residence.slug}`)} className="button button-primary residences-directory-card-cta">
                          {copy.viewResidence}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 ? (
                <div className="residences-directory-pagination" aria-label="Apartment results pages">
                  <p className="residences-directory-pagination-copy">{getPageLabel(currentPage, pageSize, totalCount, copy)}</p>

                  <div className="residences-directory-pagination-controls">
                    {currentPage > 1 ? (
                      <a href={buildResidencesHref(locale, activeState, { page: currentPage - 1 })} className="residences-directory-page-button">
                        {copy.previous}
                      </a>
                    ) : (
                      <span className="residences-directory-page-button residences-directory-page-button-disabled">{copy.previous}</span>
                    )}

                    {paginationItems.map((item) =>
                      typeof item === 'number' ? (
                        <a
                          key={item}
                          href={buildResidencesHref(locale, activeState, { page: item })}
                          className={`residences-directory-page-button${currentPage === item ? ' residences-directory-page-button-active' : ''}`}
                          aria-current={currentPage === item ? 'page' : undefined}
                        >
                          {item}
                        </a>
                      ) : (
                        <span key={item} className="residences-directory-page-ellipsis" aria-hidden="true">
                          ...
                        </span>
                      ),
                    )}

                    {currentPage < totalPages ? (
                      <a href={buildResidencesHref(locale, activeState, { page: currentPage + 1 })} className="residences-directory-page-button">
                        {copy.next}
                      </a>
                    ) : (
                      <span className="residences-directory-page-button residences-directory-page-button-disabled">{copy.next}</span>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {!hasError && !residences.length ? (
            <article className="premium-surface residences-directory-empty-state">
              <p className="section-label">{hasSearch ? copy.noMatches : copy.noResidences}</p>
              <h2>{hasSearch ? copy.noMatchesTitle : copy.noResidencesTitle}</h2>
              <p>{hasSearch ? copy.noMatchesCopy : copy.noResidencesCopy}</p>
              <div className="residences-directory-feedback-actions">
                {hasSearch ? (
                  <a href={buildResidencesHref(locale, activeState, { q: '', page: 1 })} className="button button-primary">
                    {copy.clearSearch}
                  </a>
                ) : null}
              </div>
            </article>
          ) : null}
        </section>
      </div>
    </main>
  );
}
