"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

import { getPublicApartments, getPublicProjects } from '@/lib/api/public';
import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCurrency, formatRooms } from '@/lib/utils/format';
import type {
  ProjectPriceBounds,
  PublicApartmentSummary,
  PublicCompany,
  PublicProject,
  PublicProjectSort,
} from '@/types/home';

const PROJECTS_PAGE_SIZE = 20;
const SHOWCASE_APARTMENTS_COUNT = 3;
const PRICE_STEP = 25_000;
const ADDRESS_DEBOUNCE_MS = 280;

type ProjectFilterPanelProps = {
  locale: LocaleCode;
  projects: PublicProject[];
  companies: PublicCompany[];
  totalCount: number;
  deliveryYears: number[];
  priceBounds: ProjectPriceBounds;
  roomCounts: number[];
  apartments: PublicApartmentSummary[];
  apartmentCount: number;
};

type NormalizedProject = PublicProject & {
  companyName: string;
  locationName: string;
};

type NormalizedApartment = PublicApartmentSummary & {
  locationName: string;
  areaLabel: string;
};

type RangeControlProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueLabel: string;
  onChange: (value: number) => void;
};

type ProjectFilterCopy = {
  sortFeatured: string;
  sortLowestPrice: string;
  sortHighestPrice: string;
  sortEarliestYear: string;
  verifiedDeveloper: string;
  areaPending: string;
  matchingResidences: string;
  matchingResidencesTitle: string;
  matchingResidencesCopy: (count: number) => string;
  noMatchingResidencesCopy: string;
  freshResidences: string;
  freshResidencesTitle: string;
  freshResidencesCopy: (count: number, visibleCount: number) => string;
  noFreshResidencesCopy: string;
  sectionLabel: string;
  sectionTitle: string;
  sectionCopy: string;
  addressSearchTitle: string;
  addressSearchCopy: string;
  searchLocation: string;
  searchPlaceholder: string;
  addressExamples: string;
  priceRangeTitle: string;
  minimumPrice: string;
  maximumPrice: string;
  apartmentRoomsTitle: string;
  apartmentRoomsCopy: string;
  roomOptionsPending: string;
  deliveryYearTitle: string;
  anyPublishedYear: string;
  allYears: string;
  deliveryYearsPending: string;
  activeFilters: string;
  tapChipToClear: string;
  allLaunchesVisible: string;
  anyAddress: string;
  fromPrice: (value: string) => string;
  upToPrice: (value: string) => string;
  anyRoomCount: string;
  deliveryYearChip: (year: number) => string;
  anyDeliveryYear: string;
  resetFilters: string;
  projectMatches: (count: number) => string;
  showingLaunches: (start: number, end: number, total: number) => string;
  noLaunchesMatch: string;
  updatingResults: string;
  retry: string;
  startingFrom: string;
  address: string;
  delivery: string;
  awaitingTimeline: string;
  noMatches: string;
  noProjectsMatch: string;
  widenFilters: string;
  showAllLaunches: string;
  previous: string;
  next: string;
  refreshingApartments: string;
  viewResidence: string;
  noApartmentsMatch: string;
  noLiveApartments: string;
  noApartmentsMatchTitle: string;
  noLiveApartmentsTitle: string;
  noApartmentsMatchCopy: string;
  noLiveApartmentsCopy: string;
  clearFilters: string;
  projectsEmptyLabel: string;
  projectsEmptyTitle: string;
  projectsEmptyCopy: string;
};

const projectFilterCopy: Record<LocaleCode, ProjectFilterCopy> = {
  uz: {
    sortFeatured: 'Tanlangan',
    sortLowestPrice: 'Eng arzon',
    sortHighestPrice: 'Eng qimmat',
    sortEarliestYear: 'Eng yaqin yil',
    verifiedDeveloper: 'Tasdiqlangan developer',
    areaPending: 'Maydon kutilmoqda',
    matchingResidences: 'Mos uylar',
    matchingResidencesTitle: 'Filtrlaringizga mos kvartiralar.',
    matchingResidencesCopy: (count) => `${count} ta mos ommaviy kvartiradan tasodifiy tanlov ko‘rsatilmoqda.`,
    noMatchingResidencesCopy: 'Hozircha yuqoridagi filtrlarga mos ommaviy kvartiralar yo‘q.',
    freshResidences: 'Yangi uylar',
    freshResidencesTitle: 'Jonli katalogdan aylanuvchi kvartira tanlovi.',
    freshResidencesCopy: (count, visibleCount) => `Faol ommaviy katalogdan ${Math.min(count, visibleCount)} ta tasodifiy kvartira ko‘rsatilmoqda.`,
    noFreshResidencesCopy: 'Hozircha ko‘rsatish uchun ommaviy kvartiralar yo‘q.',
    sectionLabel: 'Loyiha filtrlari',
    sectionTitle: 'Loyihalarni manzil, narx, xonalar va topshirish muddatiga ko‘ra saralang.',
    sectionCopy: 'Tuman yoki manzilni qidiring, kerakli kvartira tarkibini tanlang va bosh sahifadan chiqmasdan jonli loyihalarni ko‘rib chiqing.',
    addressSearchTitle: 'Manzil bo‘yicha qidiruv',
    addressSearchCopy: 'Loyiha manzili, tuman, shahar va loyiha nomi bo‘yicha qidiradi.',
    searchLocation: 'Joylashuvni qidirish',
    searchPlaceholder: 'Ko‘cha, tuman, shahar yoki loyiha',
    addressExamples: 'Masalan: Yunusobod, Riverfront, Dream House, Namuna manzil.',
    priceRangeTitle: 'Narx oralig‘i',
    minimumPrice: 'Minimal narx',
    maximumPrice: 'Maksimal narx',
    apartmentRoomsTitle: 'Kvartira xonalari',
    apartmentRoomsCopy: 'Faqat mos loyihalarni qoldirish uchun bir yoki bir nechta xona sonini tanlang.',
    roomOptionsPending: 'Ommaviy kvartiralar e’lon qilinganda xona variantlari shu yerda chiqadi.',
    deliveryYearTitle: 'Topshirish yili',
    anyPublishedYear: 'Istalgan e’lon qilingan yil',
    allYears: 'Barcha yillar',
    deliveryYearsPending: 'Loyihalarda yil ko‘rsatilganda topshirish yillari shu yerda paydo bo‘ladi.',
    activeFilters: 'Faol filtrlar',
    tapChipToClear: 'Tozalash uchun istalgan chipni bosing.',
    allLaunchesVisible: 'Hozir barcha loyihalar ko‘rinmoqda.',
    anyAddress: 'Istalgan manzil',
    fromPrice: (value) => `${value} dan`,
    upToPrice: (value) => `${value} gacha`,
    anyRoomCount: 'Istalgan xona soni',
    deliveryYearChip: (year) => `Topshirish ${year}`,
    anyDeliveryYear: 'Istalgan topshirish yili',
    resetFilters: 'Filtrlarni tiklash',
    projectMatches: (count) => `${count} ta mos loyiha`,
    showingLaunches: (start, end, total) => `${total} ta loyihadan ${start}-${end} ko‘rsatilmoqda`,
    noLaunchesMatch: 'Joriy filtrlarga mos loyihalar yo‘q.',
    updatingResults: 'Natijalar yangilanmoqda...',
    retry: 'Qayta urinish',
    startingFrom: 'Boshlanish narxi',
    address: 'Manzil',
    delivery: 'Topshirish',
    awaitingTimeline: 'Muddat kutilmoqda',
    noMatches: 'Mos kelmadi',
    noProjectsMatch: 'Joriy filtrlar bo‘yicha loyihalar topilmadi.',
    widenFilters: 'Narx oralig‘ini kengaytiring, xona filtrini olib tashlang yoki kengroq manzilni qidiring.',
    showAllLaunches: 'Barcha loyihalarni ko‘rsatish',
    previous: 'Oldingi',
    next: 'Keyingi',
    refreshingApartments: 'Kvartiralar yangilanmoqda...',
    viewResidence: 'Uyni ko‘rish',
    noApartmentsMatch: 'Mos kvartiralar yo‘q',
    noLiveApartments: 'Jonli kvartiralar yo‘q',
    noApartmentsMatchTitle: 'Bu filtrlarga mos kvartiralar hali topilmadi.',
    noLiveApartmentsTitle: 'Hozircha ommaviy kvartiralar yo‘q.',
    noApartmentsMatchCopy: 'Ko‘proq natijalar ko‘rish uchun filtrlardan ayrimlarini yengillashtiring.',
    noLiveApartmentsCopy: 'Katalogga ommaviy kvartiralar joylang va bu bo‘lim jonli uylarni ko‘rsata boshlaydi.',
    clearFilters: 'Filtrlarni tozalash',
    projectsEmptyLabel: 'Loyihalar',
    projectsEmptyTitle: 'Hali ommaviy loyihalar yo‘q.',
    projectsEmptyCopy: 'Backend katalogida loyihalar e’lon qilinishi bilan bu bo‘lim avtomatik to‘ldiriladi.',
  },
  en: {
    sortFeatured: 'Featured',
    sortLowestPrice: 'Lowest price',
    sortHighestPrice: 'Highest price',
    sortEarliestYear: 'Earliest year',
    verifiedDeveloper: 'Verified developer',
    areaPending: 'Area pending',
    matchingResidences: 'Matching residences',
    matchingResidencesTitle: 'Apartments aligned with your live filters.',
    matchingResidencesCopy: (count) => `Showing a random cut from ${count} matching public apartments.`,
    noMatchingResidencesCopy: 'No public apartments currently match the filter set above.',
    freshResidences: 'Fresh residences',
    freshResidencesTitle: 'A rotating apartment sample from the live catalog.',
    freshResidencesCopy: (count, visibleCount) => `Showing ${Math.min(count, visibleCount)} random apartments from the active public inventory.`,
    noFreshResidencesCopy: 'No public apartments are available to spotlight yet.',
    sectionLabel: 'Project filters',
    sectionTitle: 'Filter launches by address, price, room mix, and delivery pace.',
    sectionCopy: 'Search a district or address, narrow the apartment mix you need, then page through the live project launches without leaving the homepage.',
    addressSearchTitle: 'Address search',
    addressSearchCopy: 'Looks across project address, district, city, and launch naming.',
    searchLocation: 'Search location',
    searchPlaceholder: 'Street, district, city, or project',
    addressExamples: 'Examples: Yunusabad, Riverfront, Dream House, Sample address.',
    priceRangeTitle: 'Price range',
    minimumPrice: 'Minimum price',
    maximumPrice: 'Maximum price',
    apartmentRoomsTitle: 'Apartment rooms',
    apartmentRoomsCopy: 'Select one or more room counts to keep only matching launches.',
    roomOptionsPending: 'Room options will appear here when public apartments are published in the live catalog.',
    deliveryYearTitle: 'Delivery year',
    anyPublishedYear: 'Any published year',
    allYears: 'All years',
    deliveryYearsPending: 'Delivery years will appear here when projects publish a parsable year in the delivery field.',
    activeFilters: 'Active filters',
    tapChipToClear: 'Tap any chip to clear it.',
    allLaunchesVisible: 'All launches are currently visible.',
    anyAddress: 'Any address',
    fromPrice: (value) => `From ${value}`,
    upToPrice: (value) => `Up to ${value}`,
    anyRoomCount: 'Any room count',
    deliveryYearChip: (year) => `Delivery ${year}`,
    anyDeliveryYear: 'Any delivery year',
    resetFilters: 'Reset filters',
    projectMatches: (count) => `${count} ${count === 1 ? 'project matches' : 'projects match'}`,
    showingLaunches: (start, end, total) => `Showing ${start}-${end} of ${total} launches`,
    noLaunchesMatch: 'No launches match the current filters.',
    updatingResults: 'Updating results...',
    retry: 'Try again',
    startingFrom: 'Starting from',
    address: 'Address',
    delivery: 'Delivery',
    awaitingTimeline: 'Awaiting timeline',
    noMatches: 'No matches',
    noProjectsMatch: 'No projects match the current filter set.',
    widenFilters: 'Try widening the price range, removing a room count, or searching a broader address or district.',
    showAllLaunches: 'Show all launches',
    previous: 'Previous',
    next: 'Next',
    refreshingApartments: 'Refreshing apartments...',
    viewResidence: 'View residence',
    noApartmentsMatch: 'No apartments match',
    noLiveApartments: 'No live apartments',
    noApartmentsMatchTitle: 'No apartments match these filters yet.',
    noLiveApartmentsTitle: 'No public apartments are available yet.',
    noApartmentsMatchCopy: 'Clear or relax the filters above to bring matching apartments back into view.',
    noLiveApartmentsCopy: 'Publish public apartments in the catalog and this section will begin showing random live homes.',
    clearFilters: 'Clear filters',
    projectsEmptyLabel: 'Projects',
    projectsEmptyTitle: 'No public projects are active yet.',
    projectsEmptyCopy: 'As soon as catalog projects are published in the backend, this section will populate automatically.',
  },
  ru: {
    sortFeatured: 'Избранное',
    sortLowestPrice: 'Сначала дешевле',
    sortHighestPrice: 'Сначала дороже',
    sortEarliestYear: 'Ближайший год',
    verifiedDeveloper: 'Проверенный застройщик',
    areaPending: 'Площадь уточняется',
    matchingResidences: 'Подходящие квартиры',
    matchingResidencesTitle: 'Квартиры, подходящие под ваши фильтры.',
    matchingResidencesCopy: (count) => `Показываем случайную выборку из ${count} подходящих публичных квартир.`,
    noMatchingResidencesCopy: 'Сейчас нет публичных квартир, подходящих под выбранные фильтры.',
    freshResidences: 'Свежие квартиры',
    freshResidencesTitle: 'Ротационная подборка квартир из живого каталога.',
    freshResidencesCopy: (count, visibleCount) => `Показываем ${Math.min(count, visibleCount)} случайных квартир из активного публичного каталога.`,
    noFreshResidencesCopy: 'Пока нет публичных квартир для показа.',
    sectionLabel: 'Фильтры проектов',
    sectionTitle: 'Фильтруйте проекты по адресу, цене, комнатности и сроку сдачи.',
    sectionCopy: 'Ищите район или адрес, выбирайте нужный состав квартир и листайте живые проекты, не покидая главную страницу.',
    addressSearchTitle: 'Поиск по адресу',
    addressSearchCopy: 'Ищет по адресу проекта, району, городу и названию запуска.',
    searchLocation: 'Поиск локации',
    searchPlaceholder: 'Улица, район, город или проект',
    addressExamples: 'Например: Юнусабад, Riverfront, Dream House, пример адреса.',
    priceRangeTitle: 'Диапазон цены',
    minimumPrice: 'Минимальная цена',
    maximumPrice: 'Максимальная цена',
    apartmentRoomsTitle: 'Комнаты',
    apartmentRoomsCopy: 'Выберите одно или несколько значений, чтобы оставить только подходящие проекты.',
    roomOptionsPending: 'Варианты комнат появятся здесь после публикации квартир в живом каталоге.',
    deliveryYearTitle: 'Год сдачи',
    anyPublishedYear: 'Любой опубликованный год',
    allYears: 'Все годы',
    deliveryYearsPending: 'Годы сдачи появятся здесь, когда в проектах будет опубликован распознаваемый год.',
    activeFilters: 'Активные фильтры',
    tapChipToClear: 'Нажмите на любой чип, чтобы снять фильтр.',
    allLaunchesVisible: 'Сейчас видны все проекты.',
    anyAddress: 'Любой адрес',
    fromPrice: (value) => `От ${value}`,
    upToPrice: (value) => `До ${value}`,
    anyRoomCount: 'Любая комнатность',
    deliveryYearChip: (year) => `Сдача ${year}`,
    anyDeliveryYear: 'Любой год сдачи',
    resetFilters: 'Сбросить фильтры',
    projectMatches: (count) => `${count} ${count === 1 ? 'проект подходит' : count < 5 ? 'проекта подходят' : 'проектов подходят'}`,
    showingLaunches: (start, end, total) => `Показано ${start}-${end} из ${total} проектов`,
    noLaunchesMatch: 'Нет проектов, подходящих под текущие фильтры.',
    updatingResults: 'Обновляем результаты...',
    retry: 'Повторить',
    startingFrom: 'Старт от',
    address: 'Адрес',
    delivery: 'Сдача',
    awaitingTimeline: 'Срок уточняется',
    noMatches: 'Нет совпадений',
    noProjectsMatch: 'По текущему набору фильтров проекты не найдены.',
    widenFilters: 'Расширьте диапазон цены, уберите фильтр по комнатам или попробуйте более широкий адрес или район.',
    showAllLaunches: 'Показать все проекты',
    previous: 'Назад',
    next: 'Далее',
    refreshingApartments: 'Обновляем квартиры...',
    viewResidence: 'Открыть квартиру',
    noApartmentsMatch: 'Нет подходящих квартир',
    noLiveApartments: 'Нет активных квартир',
    noApartmentsMatchTitle: 'Пока нет квартир, подходящих под эти фильтры.',
    noLiveApartmentsTitle: 'Пока нет публичных квартир.',
    noApartmentsMatchCopy: 'Очистите или ослабьте фильтры выше, чтобы вернуть квартиры в выдачу.',
    noLiveApartmentsCopy: 'Опубликуйте квартиры в каталоге, и этот блок начнёт показывать живые объекты.',
    clearFilters: 'Очистить фильтры',
    projectsEmptyLabel: 'Проекты',
    projectsEmptyTitle: 'Пока нет активных публичных проектов.',
    projectsEmptyCopy: 'Как только проекты будут опубликованы в backend-каталоге, этот блок заполнится автоматически.',
  },
};

function getSortOptions(copy: ProjectFilterCopy): { value: PublicProjectSort; label: string }[] {
  return [
    { value: 'featured', label: copy.sortFeatured },
    { value: 'price_asc', label: copy.sortLowestPrice },
    { value: 'price_desc', label: copy.sortHighestPrice },
    { value: 'delivery_asc', label: copy.sortEarliestYear },
  ];
}

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function parseDeliveryYear(value: string) {
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function normalizePriceBounds(minimum: number, maximum: number): ProjectPriceBounds {
  if (maximum <= 0) {
    return { min: 0, max: 1_000_000 };
  }

  const normalizedMin = Math.floor(minimum / PRICE_STEP) * PRICE_STEP;
  const normalizedMax = Math.ceil(maximum / PRICE_STEP) * PRICE_STEP;

  if (normalizedMin === normalizedMax) {
    return {
      min: normalizedMin,
      max: normalizedMax + PRICE_STEP,
    };
  }

  return {
    min: normalizedMin,
    max: normalizedMax,
  };
}

function getFallbackPriceBounds(projects: PublicProject[]) {
  const prices = projects.map((project) => numeric(project.starting_price)).filter((value) => value > 0);

  if (!prices.length) {
    return { min: 0, max: 1_000_000 };
  }

  return normalizePriceBounds(Math.min(...prices), Math.max(...prices));
}

function getResolvedPriceBounds(priceBounds: ProjectPriceBounds, projects: PublicProject[]) {
  if (priceBounds.max > 0) {
    return normalizePriceBounds(priceBounds.min, priceBounds.max);
  }

  return getFallbackPriceBounds(projects);
}

function getRangeBackground(min: number, max: number, value: number) {
  if (max <= min) {
    return 'linear-gradient(90deg, #ddb84e 0%, #ddb84e 100%)';
  }

  const progress = ((value - min) / (max - min)) * 100;

  return `linear-gradient(90deg, #ddb84e 0%, #ddb84e ${progress}%, rgba(255, 255, 255, 0.12) ${progress}%, rgba(255, 255, 255, 0.12) 100%)`;
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

function toggleRoomSelection(selectedRooms: number[], roomCount: number) {
  if (selectedRooms.includes(roomCount)) {
    return selectedRooms.filter((value) => value !== roomCount);
  }

  return [...selectedRooms, roomCount].sort((left, right) => left - right);
}

function RangeControl({ id, label, min, max, step, value, valueLabel, onChange }: RangeControlProps) {
  return (
    <div className="project-filter-range-control">
      <div className="project-filter-range-head">
        <label htmlFor={id} className="project-filter-range-label">
          {label}
        </label>
        <strong className="project-filter-range-value">{valueLabel}</strong>
      </div>

      <input
        id={id}
        className="project-filter-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        style={{ background: getRangeBackground(min, max, value) }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function ProjectFilterPanel({
  locale,
  projects,
  companies,
  totalCount,
  deliveryYears,
  priceBounds,
  roomCounts,
  apartments,
  apartmentCount,
}: ProjectFilterPanelProps) {
  const copy = projectFilterCopy[locale];
  const sortOptions = useMemo(() => getSortOptions(copy), [copy]);
  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company.name])), [companies]);
  const resolvedPriceBounds = useMemo(
    () => getResolvedPriceBounds(priceBounds, projects),
    [priceBounds.max, priceBounds.min, projects],
  );
  const availableYears = useMemo(() => {
    if (deliveryYears.length) {
      return [...new Set(deliveryYears)].sort((left, right) => left - right);
    }

    return Array.from(
      new Set(
        projects
          .map((project) => parseDeliveryYear(project.delivery_window))
          .filter((year): year is number => year !== null),
      ),
    ).sort((left, right) => left - right);
  }, [deliveryYears, projects]);
  const availableRooms = useMemo(
    () => [...new Set(roomCounts)].filter((roomCount) => roomCount > 0).sort((left, right) => left - right),
    [roomCounts],
  );

  const [addressQuery, setAddressQuery] = useState('');
  const [debouncedAddressQuery, setDebouncedAddressQuery] = useState('');
  const [minimumPrice, setMinimumPrice] = useState(resolvedPriceBounds.min);
  const [maximumPrice, setMaximumPrice] = useState(resolvedPriceBounds.max);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<PublicProjectSort>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageProjects, setPageProjects] = useState(projects);
  const [visibleProjectCount, setVisibleProjectCount] = useState(totalCount);
  const [showcaseApartments, setShowcaseApartments] = useState(apartments);
  const [showcaseApartmentCount, setShowcaseApartmentCount] = useState(apartmentCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowcaseLoading, setIsShowcaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showcaseError, setShowcaseError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const hasMountedProjectsRef = useRef(false);
  const hasMountedShowcaseRef = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedAddressQuery(addressQuery.trim());
    }, ADDRESS_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [addressQuery]);

  useEffect(() => {
    setAddressQuery('');
    setDebouncedAddressQuery('');
    setMinimumPrice(resolvedPriceBounds.min);
    setMaximumPrice(resolvedPriceBounds.max);
    setSelectedRooms([]);
    setSelectedYear(null);
    setSortMode('featured');
    setCurrentPage(1);
    setPageProjects(projects);
    setVisibleProjectCount(totalCount);
    setShowcaseApartments(apartments);
    setShowcaseApartmentCount(apartmentCount);
    setError(null);
    setShowcaseError(null);
    setIsLoading(false);
    setIsShowcaseLoading(false);
    hasMountedProjectsRef.current = false;
    hasMountedShowcaseRef.current = false;
  }, [apartmentCount, apartments, projects, resolvedPriceBounds.max, resolvedPriceBounds.min, totalCount]);

  const selectedRoomsKey = selectedRooms.join(',');

  useEffect(() => {
    if (!hasMountedProjectsRef.current) {
      hasMountedProjectsRef.current = true;
      return;
    }

    const controller = new AbortController();

    async function loadProjects() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getPublicProjects(
          {
            addressQuery: debouncedAddressQuery,
            minPrice: minimumPrice,
            maxPrice: maximumPrice,
            rooms: selectedRooms,
            deliveryYear: selectedYear,
            sort: sortMode,
            page: currentPage,
            pageSize: PROJECTS_PAGE_SIZE,
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) {
          return;
        }

        setPageProjects(response.results);
        setVisibleProjectCount(response.count);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(requestError);
        setError('Could not refresh the filtered launches right now.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      controller.abort();
    };
  }, [currentPage, debouncedAddressQuery, maximumPrice, minimumPrice, reloadKey, selectedRoomsKey, selectedYear, sortMode]);

  useEffect(() => {
    if (!hasMountedShowcaseRef.current) {
      hasMountedShowcaseRef.current = true;
      return;
    }

    const controller = new AbortController();

    async function loadApartments() {
      setIsShowcaseLoading(true);
      setShowcaseError(null);

      try {
        const response = await getPublicApartments(
          {
            addressQuery: debouncedAddressQuery,
            minPrice: minimumPrice,
            maxPrice: maximumPrice,
            rooms: selectedRooms,
            deliveryYear: selectedYear,
            pageSize: SHOWCASE_APARTMENTS_COUNT,
            random: true,
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) {
          return;
        }

        setShowcaseApartments(response.results);
        setShowcaseApartmentCount(response.count);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(requestError);
        setShowcaseError('Could not refresh the apartment showcase right now.');
      } finally {
        if (!controller.signal.aborted) {
          setIsShowcaseLoading(false);
        }
      }
    }

    void loadApartments();

    return () => {
      controller.abort();
    };
  }, [debouncedAddressQuery, maximumPrice, minimumPrice, reloadKey, selectedRoomsKey, selectedYear]);

  const normalizedProjects = useMemo<NormalizedProject[]>(
    () =>
      pageProjects.map((project) => ({
        ...project,
        companyName: companyMap.get(project.company) ?? copy.verifiedDeveloper,
        locationName: project.district?.name ?? project.city.name,
      })),
    [companyMap, copy.verifiedDeveloper, pageProjects],
  );

  const normalizedApartments = useMemo<NormalizedApartment[]>(
    () =>
      showcaseApartments.map((apartment) => ({
        ...apartment,
        locationName: apartment.district?.name ?? apartment.city.name,
        areaLabel: numeric(apartment.size_sqm) > 0 ? `${numeric(apartment.size_sqm).toFixed(0)} sqm` : copy.areaPending,
      })),
    [copy.areaPending, showcaseApartments],
  );

  const addressFilterValue = addressQuery.trim();
  const hasProjectCatalog = projects.length > 0 || totalCount > 0;
  const hasActiveFilters =
    addressFilterValue.length > 0 ||
    minimumPrice > resolvedPriceBounds.min ||
    maximumPrice < resolvedPriceBounds.max ||
    selectedRooms.length > 0 ||
    selectedYear !== null;
  const totalPages = Math.max(1, Math.ceil(visibleProjectCount / PROJECTS_PAGE_SIZE));
  const pageStart = visibleProjectCount > 0 ? (currentPage - 1) * PROJECTS_PAGE_SIZE + 1 : 0;
  const pageEnd = visibleProjectCount > 0 ? Math.min(visibleProjectCount, pageStart + normalizedProjects.length - 1) : 0;
  const filterCurrency = pageProjects[0]?.currency ?? projects[0]?.currency ?? 'USD';
  const paginationItems = totalPages > 1 ? buildPagination(totalPages, currentPage) : [];

  function resetFilters() {
    setAddressQuery('');
    setDebouncedAddressQuery('');
    setMinimumPrice(resolvedPriceBounds.min);
    setMaximumPrice(resolvedPriceBounds.max);
    setSelectedRooms([]);
    setSelectedYear(null);
    setSortMode('featured');
    setCurrentPage(1);
    setError(null);
    setShowcaseError(null);
  }

  function retryFetch() {
    setReloadKey((value) => value + 1);
  }

  function getShowcaseHeading() {
    if (hasActiveFilters) {
      return {
        label: copy.matchingResidences,
        title: copy.matchingResidencesTitle,
        copy:
          showcaseApartmentCount > 0
            ? copy.matchingResidencesCopy(showcaseApartmentCount)
            : copy.noMatchingResidencesCopy,
      };
    }

    return {
      label: copy.freshResidences,
      title: copy.freshResidencesTitle,
      copy:
        showcaseApartmentCount > 0
          ? copy.freshResidencesCopy(showcaseApartmentCount, SHOWCASE_APARTMENTS_COUNT)
          : copy.noFreshResidencesCopy,
    };
  }

  const showcaseHeading = getShowcaseHeading();

  return (
    <section className="project-filter-section" id="projects">
      <div className="site-shell project-filter-shell">
        <div className="project-filter-head">
          <p className="section-label">{copy.sectionLabel}</p>
          <h2 className="section-title">{copy.sectionTitle}</h2>
          <p className="section-copy">{copy.sectionCopy}</p>
        </div>

        {hasProjectCatalog ? (
          <>
            <div className="project-filter-controls premium-surface">
              <div className="project-filter-controls-grid">
                <div className="project-filter-control-panel">
                  <div className="project-filter-control-copy">
                    <h3>{copy.addressSearchTitle}</h3>
                    <span>{copy.addressSearchCopy}</span>
                  </div>

                  <label className="project-filter-search-shell" htmlFor="project-filter-address">
                    <span className="project-filter-search-label">{copy.searchLocation}</span>
                    <input
                      id="project-filter-address"
                      className="project-filter-search-input"
                      type="search"
                      value={addressQuery}
                      placeholder={copy.searchPlaceholder}
                      onChange={(event) => {
                        setAddressQuery(event.target.value);
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    />
                  </label>

                  <p className="project-filter-empty-note">{copy.addressExamples}</p>
                </div>

                <div className="project-filter-control-panel">
                  <div className="project-filter-control-copy">
                    <h3>{copy.priceRangeTitle}</h3>
                    <span>
                      {formatCurrency(minimumPrice, filterCurrency)} to {formatCurrency(maximumPrice, filterCurrency)}
                    </span>
                  </div>

                  <div className="project-filter-range-stack">
                    <RangeControl
                      id="project-filter-min-price"
                      label={copy.minimumPrice}
                      min={resolvedPriceBounds.min}
                      max={resolvedPriceBounds.max}
                      step={PRICE_STEP}
                      value={minimumPrice}
                      valueLabel={formatCurrency(minimumPrice, filterCurrency)}
                      onChange={(value) => {
                        setMinimumPrice(Math.min(value, maximumPrice));
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    />

                    <RangeControl
                      id="project-filter-max-price"
                      label={copy.maximumPrice}
                      min={resolvedPriceBounds.min}
                      max={resolvedPriceBounds.max}
                      step={PRICE_STEP}
                      value={maximumPrice}
                      valueLabel={formatCurrency(maximumPrice, filterCurrency)}
                      onChange={(value) => {
                        setMaximumPrice(Math.max(value, minimumPrice));
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    />
                  </div>
                </div>

                <div className="project-filter-control-panel">
                  <div className="project-filter-subgroup">
                    <div className="project-filter-control-copy">
                      <h3>{copy.apartmentRoomsTitle}</h3>
                      <span>{copy.apartmentRoomsCopy}</span>
                    </div>

                    {availableRooms.length ? (
                      <div className="project-filter-room-list">
                        {availableRooms.map((roomCount) => (
                          <button
                            key={roomCount}
                            type="button"
                            className={`project-filter-pill${selectedRooms.includes(roomCount) ? ' project-filter-pill-active' : ''}`}
                            onClick={() => {
                              setSelectedRooms((currentRooms) => toggleRoomSelection(currentRooms, roomCount));
                              setCurrentPage(1);
                              setError(null);
                              setShowcaseError(null);
                            }}
                          >
                            {formatRooms(roomCount)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="project-filter-empty-note">{copy.roomOptionsPending}</p>
                    )}
                  </div>

                  <div className="project-filter-subgroup">
                    <div className="project-filter-control-copy">
                      <h3>{copy.deliveryYearTitle}</h3>
                      <span>{selectedYear ?? copy.anyPublishedYear}</span>
                    </div>

                    {availableYears.length ? (
                      <div className="project-filter-year-list">
                        <button
                          type="button"
                          className={`project-filter-pill${selectedYear === null ? ' project-filter-pill-active' : ''}`}
                          onClick={() => {
                            setSelectedYear(null);
                            setCurrentPage(1);
                            setError(null);
                            setShowcaseError(null);
                          }}
                        >
                          {copy.allYears}
                        </button>

                        {availableYears.map((year) => (
                          <button
                            key={year}
                            type="button"
                            className={`project-filter-pill${selectedYear === year ? ' project-filter-pill-active' : ''}`}
                            onClick={() => {
                              setSelectedYear(year);
                              setCurrentPage(1);
                              setError(null);
                              setShowcaseError(null);
                            }}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="project-filter-empty-note">{copy.deliveryYearsPending}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="project-filter-active-row">
                <div className="project-filter-active-copy">
                  <p>{copy.activeFilters}</p>
                  <span>{hasActiveFilters ? copy.tapChipToClear : copy.allLaunchesVisible}</span>
                </div>

                <div className="project-filter-active-list">
                  {addressFilterValue ? (
                    <button
                      type="button"
                      className="project-filter-chip project-filter-chip-active"
                      onClick={() => {
                        setAddressQuery('');
                        setDebouncedAddressQuery('');
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    >
                      Address: {addressFilterValue}
                    </button>
                  ) : (
                    <span className="project-filter-chip project-filter-chip-static">{copy.anyAddress}</span>
                  )}

                  <button
                    type="button"
                    className="project-filter-chip"
                    onClick={() => {
                      setMinimumPrice(resolvedPriceBounds.min);
                      setCurrentPage(1);
                      setError(null);
                      setShowcaseError(null);
                    }}
                    disabled={minimumPrice === resolvedPriceBounds.min}
                  >
                    {copy.fromPrice(formatCurrency(minimumPrice, filterCurrency))}
                  </button>

                  <button
                    type="button"
                    className="project-filter-chip"
                    onClick={() => {
                      setMaximumPrice(resolvedPriceBounds.max);
                      setCurrentPage(1);
                      setError(null);
                      setShowcaseError(null);
                    }}
                    disabled={maximumPrice === resolvedPriceBounds.max}
                  >
                    {copy.upToPrice(formatCurrency(maximumPrice, filterCurrency))}
                  </button>

                  {selectedRooms.length ? (
                    selectedRooms.map((roomCount) => (
                      <button
                        key={roomCount}
                        type="button"
                        className="project-filter-chip project-filter-chip-active"
                        onClick={() => {
                          setSelectedRooms((currentRooms) => currentRooms.filter((value) => value !== roomCount));
                          setCurrentPage(1);
                          setError(null);
                          setShowcaseError(null);
                        }}
                      >
                        {formatRooms(roomCount)}
                      </button>
                    ))
                  ) : (
                    <span className="project-filter-chip project-filter-chip-static">{copy.anyRoomCount}</span>
                  )}

                  {selectedYear !== null ? (
                    <button
                      type="button"
                      className="project-filter-chip project-filter-chip-active"
                      onClick={() => {
                        setSelectedYear(null);
                        setCurrentPage(1);
                        setError(null);
                        setShowcaseError(null);
                      }}
                    >
                      {copy.deliveryYearChip(selectedYear)}
                    </button>
                  ) : (
                    <span className="project-filter-chip project-filter-chip-static">{copy.anyDeliveryYear}</span>
                  )}
                </div>

                <button type="button" className="project-filter-reset" onClick={resetFilters}>
                  {copy.resetFilters}
                </button>
              </div>

              <div className="project-filter-sort-row">
                <div className="project-filter-results-copy">
                  <strong>{visibleProjectCount}</strong>
                  <span>{copy.projectMatches(visibleProjectCount)}</span>
                </div>

                <div className="project-filter-sort-list">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`project-sort-pill${sortMode === option.value ? ' project-sort-pill-active' : ''}`}
                      onClick={() => {
                        setSortMode(option.value);
                        setCurrentPage(1);
                        setError(null);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="project-filter-status" aria-live="polite">
              <p className="project-filter-pagination-copy">
                {visibleProjectCount > 0
                  ? copy.showingLaunches(pageStart, pageEnd, visibleProjectCount)
                  : copy.noLaunchesMatch}
              </p>

              {isLoading ? <p className="project-filter-feedback">{copy.updatingResults}</p> : null}
            </div>

            {error ? (
              <div className="project-filter-feedback project-filter-feedback-error" role="status">
                <span>{error}</span>
                <button type="button" className="project-filter-reset" onClick={retryFetch}>
                  {copy.retry}
                </button>
              </div>
            ) : null}

            <div className="project-grid project-filter-grid">
              {normalizedProjects.length ? (
                normalizedProjects.map((project) => (
                  <article key={project.id} className="project-card premium-surface">
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
                        <span>{project.locationName}</span>
                        <span>{project.companyName}</span>
                      </div>
                      <h3>{project.name}</h3>
                      <p>{project.headline}</p>
                      <div className="project-meta-grid">
                        <div>
                          <span>{copy.startingFrom}</span>
                          <strong>{formatCurrency(project.starting_price, project.currency)}</strong>
                        </div>
                        <div>
                          <span>{copy.address}</span>
                          <strong>{project.address || project.location_label || project.locationName}</strong>
                        </div>
                        <div>
                          <span>{copy.delivery}</span>
                          <strong>{project.delivery_window || copy.awaitingTimeline}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card premium-surface project-filter-empty">
                  <p className="section-label">{copy.noMatches}</p>
                  <h3>{copy.noProjectsMatch}</h3>
                  <p>{copy.widenFilters}</p>
                  <button type="button" className="project-filter-reset project-filter-reset-inline" onClick={resetFilters}>
                    {copy.showAllLaunches}
                  </button>
                </article>
              )}
            </div>

            {visibleProjectCount > PROJECTS_PAGE_SIZE ? (
              <div className="project-filter-pagination" aria-label="Project results pages">
                <div className="project-filter-pagination-controls">
                  <button
                    type="button"
                    className="project-filter-page-button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    {copy.previous}
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === 'number' ? (
                      <button
                        key={item}
                        type="button"
                        className={`project-filter-page-button${currentPage === item ? ' project-filter-page-button-active' : ''}`}
                        aria-current={currentPage === item ? 'page' : undefined}
                        onClick={() => setCurrentPage(item)}
                        disabled={isLoading}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={item} className="project-filter-page-ellipsis" aria-hidden="true">
                        ...
                      </span>
                    ),
                  )}

                  <button
                    type="button"
                    className="project-filter-page-button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    {copy.next}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="apartment-showcase-shell premium-surface" id="residences">
              <div className="apartment-showcase-head">
                <div className="apartment-showcase-copy">
                  <p className="section-label">{showcaseHeading.label}</p>
                  <h3>{showcaseHeading.title}</h3>
                  <span>{showcaseHeading.copy}</span>
                </div>

                {isShowcaseLoading ? <p className="project-filter-feedback">{copy.refreshingApartments}</p> : null}
              </div>

              {showcaseError ? (
                <div className="project-filter-feedback project-filter-feedback-error" role="status">
                  <span>{showcaseError}</span>
                  <button type="button" className="project-filter-reset" onClick={retryFetch}>
                    {copy.retry}
                  </button>
                </div>
              ) : null}

              <div className="apartment-showcase-grid">
                {normalizedApartments.length ? (
                  normalizedApartments.map((apartment) => (
                    <article key={apartment.id} className="apartment-showcase-card premium-surface">
                      {apartment.primary_image ? (
                        <div className="apartment-showcase-media">
                          <img src={apartment.primary_image} alt={apartment.title} />
                          <div className="project-media-overlay" />
                        </div>
                      ) : (
                        <div className="apartment-showcase-media apartment-showcase-media-placeholder">
                          <span>{apartment.project_name.slice(0, 1)}</span>
                        </div>
                      )}

                      <div className="apartment-showcase-body">
                        <div className="apartment-showcase-topline">
                          <span>{apartment.locationName}</span>
                          <span>{apartment.company_name}</span>
                        </div>
                        <h3>{formatCurrency(apartment.price, apartment.currency)}</h3>
                        <strong>{apartment.title}</strong>
                        <p>{apartment.address}</p>
                        <div className="apartment-showcase-meta">
                          <span>{formatRooms(apartment.rooms)}</span>
                          <span>{apartment.areaLabel}</span>
                          <span>{apartment.project_name}</span>
                        </div>

                        <a
                          href={buildLocalizedPath(locale, `/apartments/${apartment.slug}`)}
                          className="apartment-showcase-link"
                        >
                          {copy.viewResidence}
                        </a>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="empty-card premium-surface apartment-showcase-empty">
                    <p className="section-label">{hasActiveFilters ? copy.noApartmentsMatch : copy.noLiveApartments}</p>
                    <h3>{hasActiveFilters ? copy.noApartmentsMatchTitle : copy.noLiveApartmentsTitle}</h3>
                    <p>
                      {hasActiveFilters ? copy.noApartmentsMatchCopy : copy.noLiveApartmentsCopy}
                    </p>
                    {hasActiveFilters ? (
                      <button type="button" className="project-filter-reset project-filter-reset-inline" onClick={resetFilters}>
                        {copy.clearFilters}
                      </button>
                    ) : null}
                  </article>
                )}
              </div>
            </div>
          </>
        ) : (
          <article className="empty-card premium-surface">
            <p className="section-label">{copy.projectsEmptyLabel}</p>
            <h3>{copy.projectsEmptyTitle}</h3>
            <p>{copy.projectsEmptyCopy}</p>
          </article>
        )}
      </div>
    </section>
  );
}
