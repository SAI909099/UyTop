"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { buildLocalizedPath, type LocaleCode } from "@/lib/i18n";
import { formatCompactNumber } from "@/lib/utils/format";
import type { PublicCompany } from "@/types/home";

type DeveloperHubProps = {
  locale: LocaleCode;
  companies: PublicCompany[];
};

type StatusFilter = "all" | "verified" | "public";
type SortMode = "featured" | "projects" | "apartments" | "name";

type DeveloperHubCopy = {
  pageLabel: string;
  pageTitle: string;
  pageLead: string;
  searchLabel: string;
  searchPlaceholder: string;
  regionLabel: string;
  statusLabel: string;
  sortLabel: string;
  allRegions: string;
  allStatuses: string;
  verifiedOnly: string;
  publicProfiles: string;
  sortFeatured: string;
  sortProjects: string;
  sortApartments: string;
  sortName: string;
  developers: (count: number) => string;
  resetFilters: string;
  verified: string;
  public: string;
  regionPending: string;
  profileNoteFallback: string;
  projects: string;
  residences: string;
  viewProfile: string;
  noMatches: string;
  noMatchesTitle: string;
  noMatchesCopy: string;
  showAllDevelopers: string;
};

const developerHubCopy: Record<LocaleCode, DeveloperHubCopy> = {
  uz: {
    pageLabel: "Developerlar katalogi",
    pageTitle: "Ishonchli quruvchilarni bir joyda solishtiring.",
    pageLead:
      "Faol developerlarni qidiruv, hudud va status bo'yicha toraytiring, so'ng shu kompaniyaning loyihalar oqimiga o'ting.",
    searchLabel: "Qidiruv",
    searchPlaceholder: "Developer, slogan, izoh yoki shtab",
    regionLabel: "Hudud",
    statusLabel: "Status",
    sortLabel: "Saralash",
    allRegions: "Barcha hududlar",
    allStatuses: "Barcha statuslar",
    verifiedOnly: "Tasdiqlangan",
    publicProfiles: "Ommaviy",
    sortFeatured: "Tanlangan",
    sortProjects: "Loyihalar soni",
    sortApartments: "Kvartiralar soni",
    sortName: "Nomi bo'yicha",
    developers: (count) => `${count} ta developer`,
    resetFilters: "Filtrlarni tiklash",
    verified: "Tasdiqlangan",
    public: "Ommaviy",
    regionPending: "Hudud ko'rsatilmagan",
    profileNoteFallback: "Ommaviy katalog uchun tayyorlangan professional developer profili.",
    projects: "Loyihalar",
    residences: "Kvartiralar",
    viewProfile: "Profilni ko'rish",
    noMatches: "Mos developer topilmadi",
    noMatchesTitle: "Joriy qidiruv va filtrlarga mos developerlar yo'q.",
    noMatchesCopy: "Qidiruvni soddalashtiring yoki status va hudud filtrlarini tozalab to'liq ro'yxatni qaytaring.",
    showAllDevelopers: "Barcha developerlarni ko'rsatish",
  },
  en: {
    pageLabel: "Developer directory",
    pageTitle: "Compare trusted builders in a cleaner directory.",
    pageLead:
      "Filter the active developer roster by search, region, and status, then jump into that company’s project flow.",
    searchLabel: "Search",
    searchPlaceholder: "Developer, tagline, note, or HQ",
    regionLabel: "Region",
    statusLabel: "Status",
    sortLabel: "Sort",
    allRegions: "All regions",
    allStatuses: "All statuses",
    verifiedOnly: "Verified",
    publicProfiles: "Public",
    sortFeatured: "Featured",
    sortProjects: "Most projects",
    sortApartments: "Most residences",
    sortName: "Name",
    developers: (count) => `${count} ${count === 1 ? "developer" : "developers"}`,
    resetFilters: "Reset filters",
    verified: "Verified",
    public: "Public",
    regionPending: "Region pending",
    profileNoteFallback: "Professional developer profile prepared for the public catalog.",
    projects: "Projects",
    residences: "Residences",
    viewProfile: "View profile",
    noMatches: "No matches",
    noMatchesTitle: "No developers match the current search and filters.",
    noMatchesCopy: "Widen the search or clear the region and status filters to bring the full roster back.",
    showAllDevelopers: "Show all developers",
  },
  ru: {
    pageLabel: "Каталог застройщиков",
    pageTitle: "Сравнивайте надёжных застройщиков в понятном каталоге.",
    pageLead:
      "Фильтруйте активный список по поиску, региону и статусу, затем переходите к проектам выбранной компании.",
    searchLabel: "Поиск",
    searchPlaceholder: "Застройщик, слоган, заметка или штаб",
    regionLabel: "Регион",
    statusLabel: "Статус",
    sortLabel: "Сортировка",
    allRegions: "Все регионы",
    allStatuses: "Все статусы",
    verifiedOnly: "Проверенные",
    publicProfiles: "Публичные",
    sortFeatured: "Избранное",
    sortProjects: "Больше проектов",
    sortApartments: "Больше квартир",
    sortName: "По названию",
    developers: (count) => `${count} ${count === 1 ? "застройщик" : count < 5 ? "застройщика" : "застройщиков"}`,
    resetFilters: "Сбросить фильтры",
    verified: "Проверен",
    public: "Публичный",
    regionPending: "Регион не указан",
    profileNoteFallback: "Профессиональный профиль застройщика для публичного каталога.",
    projects: "Проекты",
    residences: "Квартиры",
    viewProfile: "Открыть профиль",
    noMatches: "Совпадений нет",
    noMatchesTitle: "По текущему поиску и фильтрам застройщики не найдены.",
    noMatchesCopy: "Расширьте поиск или очистите фильтры региона и статуса, чтобы вернуть весь список.",
    showAllDevelopers: "Показать всех застройщиков",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getRegion(company: PublicCompany, copy: DeveloperHubCopy) {
  return company.headquarters.trim() || copy.regionPending;
}

function getCompanyNote(company: PublicCompany, copy: DeveloperHubCopy) {
  return company.tagline.trim() || company.trust_note.trim() || company.short_description.trim() || copy.profileNoteFallback;
}

function sortCompanies(companies: PublicCompany[], sortMode: SortMode) {
  return [...companies].sort((left, right) => {
    if (sortMode === "projects" && left.project_count !== right.project_count) {
      return right.project_count - left.project_count;
    }

    if (sortMode === "apartments" && left.apartment_count !== right.apartment_count) {
      return right.apartment_count - left.apartment_count;
    }

    if (sortMode === "name") {
      return left.name.localeCompare(right.name);
    }

    if (left.is_verified !== right.is_verified) {
      return Number(right.is_verified) - Number(left.is_verified);
    }

    if (left.project_count !== right.project_count) {
      return right.project_count - left.project_count;
    }

    if (left.apartment_count !== right.apartment_count) {
      return right.apartment_count - left.apartment_count;
    }

    return left.name.localeCompare(right.name);
  });
}

function DeveloperDirectoryCard({
  locale,
  company,
  copy,
}: {
  locale: LocaleCode;
  company: PublicCompany;
  copy: DeveloperHubCopy;
}) {
  const region = getRegion(company, copy);
  const note = getCompanyNote(company, copy);

  return (
    <article className="premium-surface developers-directory-card" aria-label={company.name}>
      <div className="developers-directory-card-head">
        <span className={`developers-directory-card-logo${company.logo_url ? " developers-directory-card-logo-image" : ""}`}>
          {company.logo_url ? <img src={company.logo_url} alt={`${company.name} logo`} loading="lazy" /> : initials(company.name)}
        </span>

        <div className="developers-directory-card-title-wrap">
          <div className="developers-directory-card-title-row">
            <h3>{company.name}</h3>
            <span
              className={`developers-directory-card-badge${
                company.is_verified ? " developers-directory-card-badge-verified" : ""
              }`}
            >
              {company.is_verified ? copy.verified : copy.public}
            </span>
          </div>
          <p className="developers-directory-card-region">{region}</p>
        </div>
      </div>

      <p className="developers-directory-card-note">{note}</p>

      <div className="developers-directory-card-stats">
        <div className="developers-directory-card-stat">
          <strong>{formatCompactNumber(company.project_count)}</strong>
          <span>{copy.projects}</span>
        </div>
        <div className="developers-directory-card-stat">
          <strong>{formatCompactNumber(company.apartment_count)}</strong>
          <span>{copy.residences}</span>
        </div>
      </div>

      <a
        href={buildLocalizedPath(locale, `/developers/${company.slug}`)}
        className="button button-primary developers-directory-card-cta"
      >
        {copy.viewProfile}
      </a>
    </article>
  );
}

export function DeveloperHub({ locale, companies }: DeveloperHubProps) {
  const copy = developerHubCopy[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const regionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          companies
            .map((company) => company.headquarters.trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [companies],
  );

  const visibleCompanies = useMemo(() => {
    const filteredCompanies = companies.filter((company) => {
      const searchTarget = [company.name, company.tagline, company.short_description, company.trust_note, company.headquarters]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !deferredSearchQuery || searchTarget.includes(deferredSearchQuery);
      const matchesRegion = regionFilter === "all" || company.headquarters.trim() === regionFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" ? company.is_verified : !company.is_verified);

      return matchesSearch && matchesRegion && matchesStatus;
    });

    return sortCompanies(filteredCompanies, sortMode);
  }, [companies, deferredSearchQuery, regionFilter, sortMode, statusFilter]);

  const hasActiveFilters = searchQuery.trim().length > 0 || regionFilter !== "all" || statusFilter !== "all";

  function resetFilters() {
    setSearchQuery("");
    setRegionFilter("all");
    setStatusFilter("all");
    setSortMode("featured");
  }

  return (
    <main className="developers-directory-page">
      <div className="site-shell">
        <section className="developers-directory-top">
          <div className="developers-directory-heading">
            <p className="section-label">{copy.pageLabel}</p>
            <h1 className="developers-directory-title">{copy.pageTitle}</h1>
            <p className="developers-directory-lead">{copy.pageLead}</p>
          </div>

          <div className="premium-surface developers-directory-toolbar">
            <div className="developers-directory-filter-grid">
              <label className="developers-directory-field developers-directory-field-search" htmlFor="developer-directory-search">
                <span>{copy.searchLabel}</span>
                <input
                  id="developer-directory-search"
                  type="search"
                  value={searchQuery}
                  placeholder={copy.searchPlaceholder}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>

              <label className="developers-directory-field developers-directory-field-select">
                <span>{copy.regionLabel}</span>
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                  <option value="all">{copy.allRegions}</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>

              <label className="developers-directory-field developers-directory-field-select">
                <span>{copy.statusLabel}</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                  <option value="all">{copy.allStatuses}</option>
                  <option value="verified">{copy.verifiedOnly}</option>
                  <option value="public">{copy.publicProfiles}</option>
                </select>
              </label>

              <label className="developers-directory-field developers-directory-field-select">
                <span>{copy.sortLabel}</span>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                  <option value="featured">{copy.sortFeatured}</option>
                  <option value="projects">{copy.sortProjects}</option>
                  <option value="apartments">{copy.sortApartments}</option>
                  <option value="name">{copy.sortName}</option>
                </select>
              </label>
            </div>

            <div className="developers-directory-results-bar" aria-live="polite">
              <div className="developers-directory-results-copy">
                <strong>{formatCompactNumber(visibleCompanies.length)}</strong>
                <span>{copy.developers(visibleCompanies.length)}</span>
              </div>

              {hasActiveFilters ? (
                <button type="button" className="button button-secondary developers-directory-reset" onClick={resetFilters}>
                  {copy.resetFilters}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="developers-directory-results">
          {visibleCompanies.length ? (
            <div className="developers-directory-grid">
              {visibleCompanies.map((company) => (
                <DeveloperDirectoryCard key={company.id} locale={locale} company={company} copy={copy} />
              ))}
            </div>
          ) : (
            <article className="premium-surface developers-directory-empty-state">
              <p className="section-label">{copy.noMatches}</p>
              <h2>{copy.noMatchesTitle}</h2>
              <p>{copy.noMatchesCopy}</p>
              <button type="button" className="button button-secondary developers-directory-reset" onClick={resetFilters}>
                {copy.showAllDevelopers}
              </button>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
