"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";

import { getPublicMapApartments } from "@/lib/api/public";
import { buildLocalizedPath, type LocaleCode } from "@/lib/i18n";
import type { PublicMapApartment } from "@/types/home";

const heroMapCopy: Record<
  LocaleCode,
  {
    loadingLabel: string;
    loadingTitle: string;
    loadingCopy: string;
    errorLabel: string;
    errorTitle: string;
    errorCopy: string;
    retry: string;
    openFullMap: string;
    turnOnLocation: string;
    previewLabel: string;
    previewTitle: string;
    previewCopy: string;
    hideMap: string;
    demandLabel: string;
    demandTitle: string;
    demandCopy: string;
    publishedResidences: string;
    activeCityAreas: string;
    showMap: string;
  }
> = {
  uz: {
    loadingLabel: "Jonli xarita yuklanmoqda",
    loadingTitle: "Shahar ko‘rinishi tayyorlanmoqda.",
    loadingCopy: "Birinchi ekran yengil qolishi uchun xarita faqat siz so‘raganingizda ishga tushadi.",
    errorLabel: "Xarita vaqtincha mavjud emas",
    errorTitle: "Jonli xaritani hozir yuklab bo‘lmadi.",
    errorCopy: "Shu yerning o‘zida qayta urinib ko‘ring yoki to‘liq xarita sahifasini oching.",
    retry: "Qayta urinish",
    openFullMap: "To‘liq xarita",
    turnOnLocation: "Joylashuvni yoqish",
    previewLabel: "Jonli xarita ko‘rinishi",
    previewTitle: "Shaharni kerak bo‘lganda oching.",
    previewCopy: "Bosh sahifadagi ko‘rinish talab bo‘yicha ochiladi. Geolokatsiya uchun alohida xarita sahifasiga o‘ting.",
    hideMap: "Xaritani yopish",
    demandLabel: "Talab bo‘yicha xarita",
    demandTitle: "Bosh sahifani tez saqlang. Xarita kerak bo‘lganda ochilsin.",
    demandCopy:
      "Jonli xarita endi birinchi ekranni sekinlashtirmaydi. Tez ko‘rish uchun shu yerda oching yoki yaqin atrofni topish uchun xarita sahifasiga o‘ting.",
    publishedResidences: "E’lon qilingan uylar",
    activeCityAreas: "Faol hududlar",
    showMap: "Xaritani ko‘rsatish",
  },
  en: {
    loadingLabel: "Loading live map",
    loadingTitle: "Preparing the city view.",
    loadingCopy: "The map only initializes after you ask for it, so the homepage stays lighter on first load.",
    errorLabel: "Map unavailable",
    errorTitle: "The live map could not be loaded right now.",
    errorCopy: "Try again here or open the dedicated map page directly if you still want the full live experience.",
    retry: "Retry map",
    openFullMap: "Open full map",
    turnOnLocation: "Turn on location",
    previewLabel: "Live map preview",
    previewTitle: "Open the city only when you need it.",
    previewCopy: "The homepage preview is now on demand. For location access, jump into the dedicated map page.",
    hideMap: "Hide map",
    demandLabel: "Map on demand",
    demandTitle: "Keep the homepage fast. Open the map only when you want it.",
    demandCopy:
      "The live map no longer slows the first screen. Open it here for a quick preview, or jump into the dedicated map page when you want nearby discovery.",
    publishedResidences: "Published residences",
    activeCityAreas: "Active city areas",
    showMap: "Show map",
  },
  ru: {
    loadingLabel: "Загрузка живой карты",
    loadingTitle: "Готовим вид на город.",
    loadingCopy: "Карта запускается только по запросу, поэтому первый экран остаётся легче.",
    errorLabel: "Карта недоступна",
    errorTitle: "Сейчас не удалось загрузить живую карту.",
    errorCopy: "Попробуйте ещё раз здесь или сразу откройте полную карту.",
    retry: "Повторить",
    openFullMap: "Открыть карту",
    turnOnLocation: "Включить геолокацию",
    previewLabel: "Предпросмотр карты",
    previewTitle: "Открывайте город только когда это нужно.",
    previewCopy: "Предпросмотр на главной странице теперь открывается по запросу. Для геолокации перейдите на отдельную карту.",
    hideMap: "Скрыть карту",
    demandLabel: "Карта по запросу",
    demandTitle: "Сохраняйте главную страницу быстрой. Открывайте карту только при необходимости.",
    demandCopy:
      "Живая карта больше не замедляет первый экран. Откройте её здесь для быстрого просмотра или перейдите на отдельную карту для поиска рядом.",
    publishedResidences: "Опубликованные квартиры",
    activeCityAreas: "Активные районы",
    showMap: "Показать карту",
  },
};

const LazyHomeLiveMap = dynamic(
  () => import("@/components/home/home-live-map").then((module) => module.HomeLiveMap),
  {
    ssr: false,
    loading: () => (
      <article className="home-map-launchpad home-map-launchpad-loading premium-surface">
        <p className="section-label">Loading live map</p>
        <h2>Preparing the city view.</h2>
        <p>The map only initializes after you ask for it, so the homepage stays lighter on first load.</p>
      </article>
    ),
  },
);

type HomeHeroMapExperienceProps = {
  locale: LocaleCode;
  liveCities: number;
  totalHomes: number;
};

type MapRevealStatus = "idle" | "loading" | "ready" | "error";

export function HomeHeroMapExperience({ locale, liveCities, totalHomes }: HomeHeroMapExperienceProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [items, setItems] = useState<PublicMapApartment[] | null>(null);
  const [status, setStatus] = useState<MapRevealStatus>("idle");
  const [, startTransition] = useTransition();
  const copy = heroMapCopy[locale];
  const mapPath = buildLocalizedPath(locale, "/map");
  const locatePath = `${mapPath}?locate=1`;

  const openMap = () => {
    setIsMapOpen(true);

    if (items || status === "loading") {
      return;
    }

    setStatus("loading");

    startTransition(() => {
      getPublicMapApartments()
        .then((response) => {
          setItems(response.results);
          setStatus("ready");
        })
        .catch(() => {
          setStatus("error");
        });
    });
  };

  if (isMapOpen && status === "error") {
    return (
      <article className="home-map-launchpad home-map-launchpad-error premium-surface" id="map-launchpad">
        <p className="section-label">{copy.errorLabel}</p>
        <h2>{copy.errorTitle}</h2>
        <p>{copy.errorCopy}</p>

        <div className="home-map-launchpad-actions">
          <button type="button" className="button button-primary" onClick={openMap}>
            {copy.retry}
          </button>
          <a href={mapPath} className="button button-secondary">
            {copy.openFullMap}
          </a>
          <a href={locatePath} className="button button-ghost">
            {copy.turnOnLocation}
          </a>
        </div>
      </article>
    );
  }

  if (isMapOpen && status === "loading") {
    return (
      <article className="home-map-launchpad home-map-launchpad-loading premium-surface" id="map-launchpad">
        <p className="section-label">{copy.loadingLabel}</p>
        <h2>{copy.loadingTitle}</h2>
        <p>{copy.loadingCopy}</p>
      </article>
    );
  }

  if (isMapOpen && items) {
    return (
      <div className="home-map-preview-shell" id="map-launchpad">
        <div className="home-map-preview-toolbar premium-surface">
          <div className="home-map-preview-copy">
            <p className="section-label">{copy.previewLabel}</p>
            <h2>{copy.previewTitle}</h2>
            <p>{copy.previewCopy}</p>
          </div>

          <div className="home-map-preview-actions">
            <button type="button" className="button button-secondary" onClick={() => setIsMapOpen(false)}>
              {copy.hideMap}
            </button>
            <a href={mapPath} className="button button-ghost">
              {copy.openFullMap}
            </a>
            <a href={locatePath} className="button button-primary">
              {copy.turnOnLocation}
            </a>
          </div>
        </div>

        <LazyHomeLiveMap items={items} locale={locale} variant="preview" />
      </div>
    );
  }

  return (
    <article className="home-map-launchpad premium-surface" id="map-launchpad">
      <p className="section-label">{copy.demandLabel}</p>
      <h2>{copy.demandTitle}</h2>
      <p>{copy.demandCopy}</p>

      <div className="home-map-launchpad-metrics">
        <article>
          <strong>{totalHomes}</strong>
          <span>{copy.publishedResidences}</span>
        </article>
        <article>
          <strong>{liveCities}</strong>
          <span>{copy.activeCityAreas}</span>
        </article>
      </div>

      <div className="home-map-launchpad-actions">
        <button type="button" className="button button-primary" onClick={openMap}>
          {copy.showMap}
        </button>
        <a href={locatePath} className="button button-secondary">
          {copy.turnOnLocation}
        </a>
        <a href={mapPath} className="button button-ghost">
          {copy.openFullMap}
        </a>
      </div>
    </article>
  );
}
