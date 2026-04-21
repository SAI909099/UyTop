"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getPublicMapApartments } from "@/lib/api/public";
import { buildLocalizedPath, type LocaleCode } from "@/lib/i18n";
import type { PublicMapApartment } from "@/types/home";

const heroMapCopy: Record<
  LocaleCode,
  {
    loadingLabel: string;
    loadingTitle: string;
    loadingCopy: string;
    emptyLabel: string;
    emptyTitle: string;
    emptyCopy: string;
    errorLabel: string;
    errorTitle: string;
    errorCopy: string;
    retry: string;
    openFullMap: string;
  }
> = {
  uz: {
    loadingLabel: "Jonli xarita yuklanmoqda",
    loadingTitle: "Sotuvdagi uylar xaritaga joylanmoqda.",
    loadingCopy: "Bosh sahifadagi xarita jonli e’lonlarni yuklab, sizga haqiqiy joylashuvlarni ko‘rsatadi.",
    emptyLabel: "Hozircha uylar topilmadi",
    emptyTitle: "Bu ko‘rinish uchun hali xarita nuqtalari yo‘q.",
    emptyCopy: "Yangi e’lonlar chop etilgach, sotuvdagi uylar shu yerda xarita ustida ko‘rinadi.",
    errorLabel: "Xarita vaqtincha mavjud emas",
    errorTitle: "Jonli xaritani hozir yuklab bo‘lmadi.",
    errorCopy: "Qayta urinib ko‘ring yoki to‘liq xarita sahifasi orqali inventarni oching.",
    retry: "Qayta urinish",
    openFullMap: "To‘liq xarita",
  },
  en: {
    loadingLabel: "Loading live map",
    loadingTitle: "Placing live homes on the map.",
    loadingCopy: "The homepage is loading the current homes for sale so the hero can open with real locations.",
    emptyLabel: "No homes visible yet",
    emptyTitle: "There are no live map points for this view yet.",
    emptyCopy: "As soon as new homes are published, they will appear here directly on the hero map.",
    errorLabel: "Map unavailable",
    errorTitle: "The live map could not be loaded right now.",
    errorCopy: "Try again here or open the dedicated map page to continue browsing the inventory.",
    retry: "Retry map",
    openFullMap: "Open full map",
  },
  ru: {
    loadingLabel: "Загрузка живой карты",
    loadingTitle: "Размещаем доступные объекты на карте.",
    loadingCopy: "Главная страница загружает реальные квартиры в продаже, чтобы сразу показать их на карте.",
    emptyLabel: "Пока нет объектов",
    emptyTitle: "Для этого вида пока нет точек на карте.",
    emptyCopy: "Как только новые квартиры будут опубликованы, они появятся здесь прямо в hero-блоке.",
    errorLabel: "Карта недоступна",
    errorTitle: "Сейчас не удалось загрузить живую карту.",
    errorCopy: "Попробуйте ещё раз или откройте отдельную страницу карты для просмотра каталога.",
    retry: "Повторить",
    openFullMap: "Открыть карту",
  },
};

const LazyHomeLiveMap = dynamic(
  () => import("@/components/home/home-live-map").then((module) => module.HomeLiveMap),
  {
    ssr: false,
    loading: () => (
      <article className="home-map-hero-state home-map-hero-state-loading">
        <div className="home-map-hero-state-grid" aria-hidden="true">
          <span className="home-map-hero-state-route home-map-hero-state-route-primary" />
          <span className="home-map-hero-state-route home-map-hero-state-route-secondary" />
          <span className="home-map-hero-state-pin home-map-hero-state-pin-primary">$10K</span>
          <span className="home-map-hero-state-pin home-map-hero-state-pin-secondary">$12K</span>
          <span className="home-map-hero-state-pin home-map-hero-state-pin-tertiary">$15K</span>
        </div>

        <div className="home-map-hero-state-copy">
          <p className="section-label">Loading live map</p>
          <h2>Placing live homes on the map.</h2>
          <p>The homepage is loading the current homes for sale so the hero can open with real locations.</p>
        </div>
      </article>
    ),
  },
);

type HomeHeroMapExperienceProps = {
  locale: LocaleCode;
};

type HeroMapStatus = "loading" | "ready" | "empty" | "error";

async function fetchHeroMapApartments() {
  const response = await getPublicMapApartments();
  return response.results;
}

export function HomeHeroMapExperience({ locale }: HomeHeroMapExperienceProps) {
  const [items, setItems] = useState<PublicMapApartment[]>([]);
  const [status, setStatus] = useState<HeroMapStatus>("loading");
  const copy = heroMapCopy[locale];
  const mapPath = buildLocalizedPath(locale, "/map");

  const loadMap = () => {
    setStatus("loading");

    fetchHeroMapApartments()
      .then((nextItems) => {
        setItems(nextItems);
        setStatus(nextItems.length ? "ready" : "empty");
      })
      .catch(() => {
        setItems([]);
        setStatus("error");
      });
  };

  useEffect(() => {
    let cancelled = false;

    fetchHeroMapApartments()
      .then((nextItems) => {
        if (cancelled) {
          return;
        }

        setItems(nextItems);
        setStatus(nextItems.length ? "ready" : "empty");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setItems([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "ready" && items.length) {
    return (
      <div className="home-map-hero-experience" id="map-launchpad">
        <LazyHomeLiveMap items={items} locale={locale} variant="hero" />
      </div>
    );
  }

  const isLoading = status === "loading";
  const isError = status === "error";
  const label = isLoading ? copy.loadingLabel : isError ? copy.errorLabel : copy.emptyLabel;
  const title = isLoading ? copy.loadingTitle : isError ? copy.errorTitle : copy.emptyTitle;
  const body = isLoading ? copy.loadingCopy : isError ? copy.errorCopy : copy.emptyCopy;

  return (
    <article className={`home-map-hero-state home-map-hero-state-${status}`} id="map-launchpad">
      <div className="home-map-hero-state-grid" aria-hidden="true">
        <span className="home-map-hero-state-route home-map-hero-state-route-primary" />
        <span className="home-map-hero-state-route home-map-hero-state-route-secondary" />
        <span className="home-map-hero-state-pin home-map-hero-state-pin-primary">$10K</span>
        <span className="home-map-hero-state-pin home-map-hero-state-pin-secondary">$12K</span>
        <span className="home-map-hero-state-pin home-map-hero-state-pin-tertiary">$15K</span>
      </div>

      <div className="home-map-hero-state-copy">
        <p className="section-label">{label}</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>

      {isLoading ? null : (
        <div className="home-map-hero-state-actions">
          <button type="button" className="button button-primary" onClick={loadMap}>
            {copy.retry}
          </button>
          <a href={mapPath} className="button button-secondary">
            {copy.openFullMap}
          </a>
        </div>
      )}
    </article>
  );
}
