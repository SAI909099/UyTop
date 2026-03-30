"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { getPublicProjects } from "@/lib/api/public";
import { buildLocalizedPath, type LocaleCode } from "@/lib/i18n";
import { formatCompactNumber, formatCurrency, formatRooms } from "@/lib/utils/format";
import type { ProjectPriceBounds, PublicCompany, PublicProject, PublicProjectSort } from "@/types/home";

const ROOM_MATCH_PAGE_SIZE = 100;

export type ProjectCtaTarget = {
  buildingSlug: string;
  buildingName: string;
};

export type ProjectCtaTargets = Record<number, ProjectCtaTarget>;

type ProjectHubProps = {
  locale: LocaleCode;
  companies: PublicCompany[];
  projects: PublicProject[];
  deliveryYears: number[];
  priceBounds: ProjectPriceBounds;
  roomCounts: number[];
  projectCtaTargets: ProjectCtaTargets;
  initialCompanyFilter?: string;
};

type ProjectHubCopy = {
  pageLabel: string;
  pageTitle: string;
  pageLead: string;
  searchLabel: string;
  searchPlaceholder: string;
  developer: string;
  region: string;
  rooms: string;
  deliveryYear: string;
  minimumPrice: string;
  maximumPrice: string;
  sortBy: string;
  allDevelopers: string;
  allRegions: string;
  anyRooms: string;
  anyDeliveryYear: string;
  anyMinimumPrice: string;
  anyMaximumPrice: string;
  sortFeatured: string;
  sortLowestPrice: string;
  sortHighestPrice: string;
  sortEarliestYear: string;
  results: (count: number) => string;
  resetFilters: string;
  roomFilterUpdating: string;
  roomFilterError: string;
  startingFrom: string;
  delivery: string;
  buildings: string;
  viewBuilding: string;
  buildingPending: string;
  pricePending: string;
  awaitingTimeline: string;
  unlistedDeveloper: string;
  noPublicProjects: string;
  noProjectsLead: string;
  noMatches: string;
  noProjectsMatch: string;
  noProjectsCopy: string;
  showAllProjects: string;
  openLiveMap: string;
  backHome: string;
};

type NormalizedProject = PublicProject & {
  companyName: string;
  locationName: string;
  deliveryYear: number | null;
  priceValue: number;
  ctaTarget: ProjectCtaTarget | null;
};

const projectHubCopy: Record<LocaleCode, ProjectHubCopy> = {
  uz: {
    pageLabel: "Loyihalar katalogi",
    pageTitle: "Jonli loyihalarni aniq va tez toping.",
    pageLead:
      "Builder, hudud, xona, topshirish muddati va narx bo'yicha katalogni toraytiring, so'ng birinchi mavjud bino oqimiga o'ting.",
    searchLabel: "Qidiruv",
    searchPlaceholder: "Loyiha, manzil, developer yoki tuman",
    developer: "Developer",
    region: "Hudud",
    rooms: "Xonalar",
    deliveryYear: "Topshirish yili",
    minimumPrice: "Minimal narx",
    maximumPrice: "Maksimal narx",
    sortBy: "Saralash",
    allDevelopers: "Barcha developerlar",
    allRegions: "Barcha hududlar",
    anyRooms: "Istalgan xona",
    anyDeliveryYear: "Istalgan yil",
    anyMinimumPrice: "Min",
    anyMaximumPrice: "Max",
    sortFeatured: "Tanlangan",
    sortLowestPrice: "Eng arzon",
    sortHighestPrice: "Eng qimmat",
    sortEarliestYear: "Eng yaqin topshirish",
    results: (count) => `${count} ta loyiha`,
    resetFilters: "Filtrlarni tiklash",
    roomFilterUpdating: "Xona bo'yicha moslik yangilanmoqda...",
    roomFilterError: "Hozir xona bo'yicha mos loyihalarni yangilab bo'lmadi.",
    startingFrom: "Boshlanish narxi",
    delivery: "Topshirish",
    buildings: "Binolar",
    viewBuilding: "Binoni ko'rish",
    buildingPending: "Bino route kutilmoqda",
    pricePending: "Narx so'rov bo'yicha",
    awaitingTimeline: "Muddat kutilmoqda",
    unlistedDeveloper: "Developer ko'rsatilmagan",
    noPublicProjects: "Hali ommaviy loyihalar yo'q.",
    noProjectsLead: "Katalogga jonli loyihalar qo'shilishi bilan ushbu sahifa asosiy ko'rish markaziga aylanadi.",
    noMatches: "Mos loyihalar topilmadi",
    noProjectsMatch: "Joriy filtrlarga mos loyihalar yo'q.",
    noProjectsCopy: "Qidiruvni soddalashtiring yoki ayrim filtrlarni olib tashlab ko'proq loyihalarni qaytaring.",
    showAllProjects: "Barcha loyihalarni ko'rsatish",
    openLiveMap: "Jonli xarita",
    backHome: "Bosh sahifa",
  },
  en: {
    pageLabel: "Projects directory",
    pageTitle: "Browse live launches with a cleaner decision flow.",
    pageLead:
      "Narrow the public catalog by developer, location, rooms, delivery year, and price, then jump into the first available building route.",
    searchLabel: "Search",
    searchPlaceholder: "Project, address, developer, or district",
    developer: "Developer",
    region: "Region",
    rooms: "Rooms",
    deliveryYear: "Delivery year",
    minimumPrice: "Minimum price",
    maximumPrice: "Maximum price",
    sortBy: "Sort by",
    allDevelopers: "All developers",
    allRegions: "All regions",
    anyRooms: "Any rooms",
    anyDeliveryYear: "Any delivery year",
    anyMinimumPrice: "Min",
    anyMaximumPrice: "Max",
    sortFeatured: "Featured",
    sortLowestPrice: "Lowest price",
    sortHighestPrice: "Highest price",
    sortEarliestYear: "Earliest delivery",
    results: (count) => `${count} ${count === 1 ? "project" : "projects"}`,
    resetFilters: "Reset filters",
    roomFilterUpdating: "Refreshing room matches...",
    roomFilterError: "Could not refresh room-based project matches right now.",
    startingFrom: "Starting from",
    delivery: "Delivery",
    buildings: "Buildings",
    viewBuilding: "View building",
    buildingPending: "Building route pending",
    pricePending: "Price on request",
    awaitingTimeline: "Timeline pending",
    unlistedDeveloper: "Developer unavailable",
    noPublicProjects: "No public projects are live yet.",
    noProjectsLead:
      "As soon as live launches are published through the catalog, this page will become the main browse surface for project discovery.",
    noMatches: "No matching projects",
    noProjectsMatch: "No projects match the current filters.",
    noProjectsCopy: "Widen the price range, simplify the search, or clear a filter to bring more launches back.",
    showAllProjects: "Show all projects",
    openLiveMap: "Open live map",
    backHome: "Back to homepage",
  },
  ru: {
    pageLabel: "Каталог проектов",
    pageTitle: "Ищите живые проекты в более ясном формате.",
    pageLead:
      "Сужайте каталог по застройщику, району, комнатности, сроку сдачи и цене, затем переходите в первый доступный маршрут дома.",
    searchLabel: "Поиск",
    searchPlaceholder: "Проект, адрес, застройщик или район",
    developer: "Застройщик",
    region: "Регион",
    rooms: "Комнаты",
    deliveryYear: "Год сдачи",
    minimumPrice: "Минимальная цена",
    maximumPrice: "Максимальная цена",
    sortBy: "Сортировка",
    allDevelopers: "Все застройщики",
    allRegions: "Все регионы",
    anyRooms: "Любая комнатность",
    anyDeliveryYear: "Любой год",
    anyMinimumPrice: "Мин",
    anyMaximumPrice: "Макс",
    sortFeatured: "Избранное",
    sortLowestPrice: "Сначала дешевле",
    sortHighestPrice: "Сначала дороже",
    sortEarliestYear: "Ближайшая сдача",
    results: (count) => `${count} ${count === 1 ? "проект" : count < 5 ? "проекта" : "проектов"}`,
    resetFilters: "Сбросить фильтры",
    roomFilterUpdating: "Обновляем совпадения по комнатам...",
    roomFilterError: "Сейчас не удалось обновить проекты по фильтру комнат.",
    startingFrom: "Старт от",
    delivery: "Сдача",
    buildings: "Корпуса",
    viewBuilding: "Открыть дом",
    buildingPending: "Маршрут дома ожидается",
    pricePending: "Цена по запросу",
    awaitingTimeline: "Срок уточняется",
    unlistedDeveloper: "Застройщик не указан",
    noPublicProjects: "Пока нет активных публичных проектов.",
    noProjectsLead:
      "Как только живые проекты будут опубликованы через каталог, эта страница станет основной витриной для их поиска.",
    noMatches: "Подходящих проектов нет",
    noProjectsMatch: "По текущим фильтрам проекты не найдены.",
    noProjectsCopy: "Расширьте диапазон цены, упростите поиск или очистите один из фильтров, чтобы вернуть больше проектов.",
    showAllProjects: "Показать все проекты",
    openLiveMap: "Открыть карту",
    backHome: "На главную",
  },
};

function getSortOptions(copy: ProjectHubCopy): { value: PublicProjectSort; label: string }[] {
  return [
    { value: "featured", label: copy.sortFeatured },
    { value: "price_asc", label: copy.sortLowestPrice },
    { value: "price_desc", label: copy.sortHighestPrice },
    { value: "delivery_asc", label: copy.sortEarliestYear },
  ];
}

function numeric(value: string | number | null | undefined) {
  const resolved = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(resolved) ? resolved : 0;
}

function parsePositiveNumber(value: string) {
  const resolved = Number(value.trim());

  if (!Number.isFinite(resolved) || resolved <= 0) {
    return null;
  }

  return resolved;
}

function parseDeliveryYear(value: string) {
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function normalizePriceBounds(minimum: number, maximum: number): ProjectPriceBounds {
  if (maximum <= 0) {
    return { min: 0, max: 1_000_000 };
  }

  const normalizedMin = Math.max(0, minimum);
  const normalizedMax = Math.max(normalizedMin, maximum);
  return { min: normalizedMin, max: normalizedMax };
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

function sortProjects(projects: NormalizedProject[], sortMode: PublicProjectSort) {
  return [...projects].sort((left, right) => {
    if (sortMode === "price_asc" && left.priceValue !== right.priceValue) {
      return left.priceValue - right.priceValue;
    }

    if (sortMode === "price_desc" && left.priceValue !== right.priceValue) {
      return right.priceValue - left.priceValue;
    }

    if (sortMode === "delivery_asc") {
      if (left.deliveryYear === null && right.deliveryYear !== null) {
        return 1;
      }

      if (left.deliveryYear !== null && right.deliveryYear === null) {
        return -1;
      }

      if (left.deliveryYear !== null && right.deliveryYear !== null && left.deliveryYear !== right.deliveryYear) {
        return left.deliveryYear - right.deliveryYear;
      }
    }

    if (left.building_count !== right.building_count) {
      return right.building_count - left.building_count;
    }

    if (left.priceValue !== right.priceValue) {
      return right.priceValue - left.priceValue;
    }

    return left.name.localeCompare(right.name);
  });
}

function getProjectContext(project: NormalizedProject) {
  return (
    project.headline.trim() ||
    project.address.trim() ||
    project.location_label.trim() ||
    project.companyName
  );
}

export function ProjectHub({
  locale,
  companies,
  projects,
  deliveryYears,
  priceBounds,
  roomCounts,
  projectCtaTargets,
  initialCompanyFilter,
}: ProjectHubProps) {
  const copy = projectHubCopy[locale];
  const sortOptions = useMemo(() => getSortOptions(copy), [copy]);
  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company])), [companies]);
  const normalizedProjects = useMemo<NormalizedProject[]>(
    () =>
      projects.map((project) => ({
        ...project,
        companyName: companyMap.get(project.company)?.name ?? copy.unlistedDeveloper,
        locationName: project.district?.name ?? project.city.name,
        deliveryYear: parseDeliveryYear(project.delivery_window),
        priceValue: numeric(project.starting_price),
        ctaTarget: projectCtaTargets[project.id] ?? null,
      })),
    [companyMap, copy.unlistedDeveloper, projectCtaTargets, projects],
  );
  const resolvedPriceBounds = useMemo(
    () => getResolvedPriceBounds(priceBounds, projects),
    [priceBounds.max, priceBounds.min, projects],
  );
  const availableCompanies = useMemo(() => {
    const referencedCompanyIds = new Set(projects.map((project) => project.company));

    return [...companies]
      .filter((company) => referencedCompanyIds.has(company.id))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [companies, projects]);
  const availableRegions = useMemo(
    () => Array.from(new Set(normalizedProjects.map((project) => project.locationName).filter(Boolean))).sort(),
    [normalizedProjects],
  );
  const availableYears = useMemo(() => {
    if (deliveryYears.length) {
      return [...new Set(deliveryYears)].sort((left, right) => left - right);
    }

    return Array.from(
      new Set(normalizedProjects.map((project) => project.deliveryYear).filter((year): year is number => year !== null)),
    ).sort((left, right) => left - right);
  }, [deliveryYears, normalizedProjects]);
  const availableRooms = useMemo(
    () => [...new Set(roomCounts)].filter((roomCount) => roomCount > 0).sort((left, right) => left - right),
    [roomCounts],
  );
  const resolvedInitialCompanyFilter = useMemo(() => {
    if (!initialCompanyFilter) {
      return "all";
    }

    return availableCompanies.some((company) => String(company.id) === initialCompanyFilter) ? initialCompanyFilter : "all";
  }, [availableCompanies, initialCompanyFilter]);

  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState(resolvedInitialCompanyFilter);
  const [regionFilter, setRegionFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [minimumPriceInput, setMinimumPriceInput] = useState("");
  const [maximumPriceInput, setMaximumPriceInput] = useState("");
  const [sortMode, setSortMode] = useState<PublicProjectSort>("featured");
  const [matchingRoomProjectIds, setMatchingRoomProjectIds] = useState<Set<number> | null>(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [roomFilterError, setRoomFilterError] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  useEffect(() => {
    setCompanyFilter(resolvedInitialCompanyFilter);
  }, [resolvedInitialCompanyFilter]);

  useEffect(() => {
    if (roomFilter === "all") {
      setMatchingRoomProjectIds(null);
      setIsRoomLoading(false);
      setRoomFilterError(null);
      return;
    }

    const controller = new AbortController();

    async function loadMatchingProjectIds() {
      setIsRoomLoading(true);
      setRoomFilterError(null);

      try {
        let page = 1;
        let totalPages = 1;
        const projectIds = new Set<number>();

        while (page <= totalPages) {
          const response = await getPublicProjects(
            {
              rooms: [Number(roomFilter)],
              page,
              pageSize: ROOM_MATCH_PAGE_SIZE,
            },
            { signal: controller.signal },
          );

          if (controller.signal.aborted) {
            return;
          }

          response.results.forEach((project) => {
            projectIds.add(project.id);
          });

          totalPages = Math.max(1, Math.ceil(response.count / ROOM_MATCH_PAGE_SIZE));
          page += 1;
        }

        if (!controller.signal.aborted) {
          setMatchingRoomProjectIds(projectIds);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
        setRoomFilterError(copy.roomFilterError);
      } finally {
        if (!controller.signal.aborted) {
          setIsRoomLoading(false);
        }
      }
    }

    void loadMatchingProjectIds();

    return () => controller.abort();
  }, [copy.roomFilterError, roomFilter]);

  const minimumPriceValue = useMemo(() => parsePositiveNumber(minimumPriceInput), [minimumPriceInput]);
  const maximumPriceValue = useMemo(() => parsePositiveNumber(maximumPriceInput), [maximumPriceInput]);
  const effectiveMinimumPrice =
    minimumPriceValue !== null && maximumPriceValue !== null && minimumPriceValue > maximumPriceValue
      ? maximumPriceValue
      : minimumPriceValue;
  const effectiveMaximumPrice =
    minimumPriceValue !== null && maximumPriceValue !== null && maximumPriceValue < minimumPriceValue
      ? minimumPriceValue
      : maximumPriceValue;
  const hasProjectCatalog = normalizedProjects.length > 0;

  const filteredProjects = useMemo(() => {
    const selectedCompanyId = companyFilter === "all" ? null : Number(companyFilter);
    const selectedYear = yearFilter === "all" ? null : Number(yearFilter);

    return normalizedProjects.filter((project) => {
      const searchTarget = [
        project.name,
        project.headline,
        project.address,
        project.location_label,
        project.city.name,
        project.district?.name ?? "",
        project.companyName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !deferredSearchQuery || searchTarget.includes(deferredSearchQuery);
      const matchesCompany = selectedCompanyId === null || project.company === selectedCompanyId;
      const matchesRegion = regionFilter === "all" || project.locationName === regionFilter;
      const matchesYear = selectedYear === null || project.deliveryYear === selectedYear;
      const matchesMinimumPrice = effectiveMinimumPrice === null || project.priceValue >= effectiveMinimumPrice;
      const matchesMaximumPrice = effectiveMaximumPrice === null || project.priceValue <= effectiveMaximumPrice;
      const matchesRoom =
        roomFilter === "all" || matchingRoomProjectIds === null || matchingRoomProjectIds.has(project.id);

      return (
        matchesSearch &&
        matchesCompany &&
        matchesRegion &&
        matchesYear &&
        matchesMinimumPrice &&
        matchesMaximumPrice &&
        matchesRoom
      );
    });
  }, [
    companyFilter,
    deferredSearchQuery,
    effectiveMaximumPrice,
    effectiveMinimumPrice,
    matchingRoomProjectIds,
    normalizedProjects,
    regionFilter,
    roomFilter,
    yearFilter,
  ]);

  const sortedProjects = useMemo(() => sortProjects(filteredProjects, sortMode), [filteredProjects, sortMode]);
  const filterCurrency = normalizedProjects[0]?.currency ?? "USD";
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    companyFilter !== "all" ||
    regionFilter !== "all" ||
    roomFilter !== "all" ||
    yearFilter !== "all" ||
    minimumPriceInput.trim().length > 0 ||
    maximumPriceInput.trim().length > 0 ||
    sortMode !== "featured";

  function resetFilters() {
    setSearchQuery("");
    setCompanyFilter("all");
    setRegionFilter("all");
    setRoomFilter("all");
    setYearFilter("all");
    setMinimumPriceInput("");
    setMaximumPriceInput("");
    setSortMode("featured");
    setMatchingRoomProjectIds(null);
    setRoomFilterError(null);
  }

  if (!hasProjectCatalog) {
    return (
      <main className="projects-directory-page">
        <div className="site-shell">
          <section className="projects-directory-top">
            <div className="projects-directory-heading">
              <p className="section-label">{copy.pageLabel}</p>
              <h1 className="projects-directory-title">{copy.noPublicProjects}</h1>
              <p className="projects-directory-lead">{copy.noProjectsLead}</p>
            </div>

            <article className="premium-surface projects-directory-empty-state">
              <p>{copy.noProjectsLead}</p>
              <div className="projects-directory-empty-actions">
                <a href={buildLocalizedPath(locale, "/map")} className="button button-primary">
                  {copy.openLiveMap}
                </a>
                <a href={buildLocalizedPath(locale, "/")} className="button button-secondary">
                  {copy.backHome}
                </a>
              </div>
            </article>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="projects-directory-page">
      <div className="site-shell">
        <section className="projects-directory-top">
          <div className="projects-directory-heading">
            <p className="section-label">{copy.pageLabel}</p>
            <h1 className="projects-directory-title">{copy.pageTitle}</h1>
            <p className="projects-directory-lead">{copy.pageLead}</p>
          </div>

          <div className="premium-surface projects-directory-toolbar">
            <label className="projects-directory-search" htmlFor="project-directory-search">
              <span>{copy.searchLabel}</span>
              <input
                id="project-directory-search"
                className="projects-directory-search-input"
                type="search"
                value={searchQuery}
                placeholder={copy.searchPlaceholder}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="projects-directory-filters">
              <label className="projects-directory-field projects-directory-field-span-3">
                <span>{copy.developer}</span>
                <select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}>
                  <option value="all">{copy.allDevelopers}</option>
                  {availableCompanies.map((company) => (
                    <option key={company.id} value={String(company.id)}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="projects-directory-field projects-directory-field-span-3">
                <span>{copy.region}</span>
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                  <option value="all">{copy.allRegions}</option>
                  {availableRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>

              <label className="projects-directory-field projects-directory-field-span-2">
                <span>{copy.rooms}</span>
                <select value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
                  <option value="all">{copy.anyRooms}</option>
                  {availableRooms.map((roomCount) => (
                    <option key={roomCount} value={String(roomCount)}>
                      {formatRooms(roomCount)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="projects-directory-field projects-directory-field-span-2">
                <span>{copy.deliveryYear}</span>
                <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                  <option value="all">{copy.anyDeliveryYear}</option>
                  {availableYears.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="projects-directory-field projects-directory-field-span-2">
                <span>{copy.sortBy}</span>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as PublicProjectSort)}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="projects-directory-field projects-directory-field-span-2">
                <span>{copy.minimumPrice}</span>
                <input
                  type="number"
                  min={resolvedPriceBounds.min}
                  max={resolvedPriceBounds.max}
                  placeholder={copy.anyMinimumPrice}
                  value={minimumPriceInput}
                  onChange={(event) => setMinimumPriceInput(event.target.value)}
                />
              </label>

              <label className="projects-directory-field projects-directory-field-span-2">
                <span>{copy.maximumPrice}</span>
                <input
                  type="number"
                  min={resolvedPriceBounds.min}
                  max={resolvedPriceBounds.max}
                  placeholder={copy.anyMaximumPrice}
                  value={maximumPriceInput}
                  onChange={(event) => setMaximumPriceInput(event.target.value)}
                />
              </label>
            </div>

            <div className="projects-directory-results-bar" aria-live="polite">
              <div className="projects-directory-results-copy">
                <strong>{formatCompactNumber(sortedProjects.length)}</strong>
                <span>{copy.results(sortedProjects.length)}</span>
              </div>

              <div className="projects-directory-results-meta">
                {effectiveMinimumPrice !== null || effectiveMaximumPrice !== null ? (
                  <span className="projects-directory-range-note">
                    {formatCurrency(effectiveMinimumPrice ?? resolvedPriceBounds.min, filterCurrency)} -{" "}
                    {formatCurrency(effectiveMaximumPrice ?? resolvedPriceBounds.max, filterCurrency)}
                  </span>
                ) : null}

                {isRoomLoading ? <span className="projects-directory-feedback">{copy.roomFilterUpdating}</span> : null}
                {roomFilterError ? (
                  <span className="projects-directory-feedback projects-directory-feedback-error">{roomFilterError}</span>
                ) : null}

                {hasActiveFilters ? (
                  <button type="button" className="button button-secondary projects-directory-reset" onClick={resetFilters}>
                    {copy.resetFilters}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="projects-directory-results">
          {sortedProjects.length ? (
            <div className="projects-directory-grid">
              {sortedProjects.map((project) => {
                const ctaHref = project.ctaTarget
                  ? buildLocalizedPath(locale, `/projects/${project.slug}/buildings/${project.ctaTarget.buildingSlug}`)
                  : null;

                return (
                  <article key={project.id} className="premium-surface projects-directory-card" aria-label={project.name}>
                    {project.hero_image_url ? (
                      <div className="projects-directory-card-media">
                        <img src={project.hero_image_url} alt={project.name} loading="lazy" />
                      </div>
                    ) : (
                      <div className="projects-directory-card-media projects-directory-card-media-placeholder" aria-hidden="true">
                        <span>{project.name.slice(0, 1)}</span>
                      </div>
                    )}

                    <div className="projects-directory-card-body">
                      <div className="projects-directory-card-eyebrow">
                        <span>{project.companyName}</span>
                        <span>{project.locationName}</span>
                      </div>

                      <div className="projects-directory-card-copy">
                        <h3>{project.name}</h3>
                        <span className="projects-directory-card-label">{copy.startingFrom}</span>
                        <strong className="projects-directory-card-price">
                          {project.priceValue > 0 ? formatCurrency(project.starting_price, project.currency) : copy.pricePending}
                        </strong>
                      </div>

                      <div className="projects-directory-card-info">
                        <span>
                          {copy.delivery}: {project.delivery_window || copy.awaitingTimeline}
                        </span>
                        <span>
                          {copy.buildings}: {formatCompactNumber(project.building_count)}
                        </span>
                      </div>

                      <p className="projects-directory-card-note">{getProjectContext(project)}</p>

                      <div className="projects-directory-card-actions">
                        {ctaHref ? (
                          <a href={ctaHref} className="button button-primary projects-directory-card-cta">
                            {copy.viewBuilding}
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="button button-secondary projects-directory-card-cta projects-directory-card-cta-disabled"
                            disabled
                          >
                            {copy.buildingPending}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <article className="premium-surface projects-directory-empty-state">
              <p className="section-label">{copy.noMatches}</p>
              <h2>{copy.noProjectsMatch}</h2>
              <p>{copy.noProjectsCopy}</p>
              <button type="button" className="button button-secondary projects-directory-reset" onClick={resetFilters}>
                {copy.showAllProjects}
              </button>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
