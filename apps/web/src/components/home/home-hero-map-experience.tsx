"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";

import { getPublicMapApartments } from "@/lib/api/public";
import type { PublicMapApartment } from "@/types/home";

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
  liveCities: number;
  totalHomes: number;
};

type MapRevealStatus = "idle" | "loading" | "ready" | "error";

export function HomeHeroMapExperience({ liveCities, totalHomes }: HomeHeroMapExperienceProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [items, setItems] = useState<PublicMapApartment[] | null>(null);
  const [status, setStatus] = useState<MapRevealStatus>("idle");
  const [, startTransition] = useTransition();

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
        <p className="section-label">Map unavailable</p>
        <h2>The live map could not be loaded right now.</h2>
        <p>Try again here or open the dedicated map page directly if you still want the full live experience.</p>

        <div className="home-map-launchpad-actions">
          <button type="button" className="button button-primary" onClick={openMap}>
            Retry map
          </button>
          <a href="/map" className="button button-secondary">
            Open full map
          </a>
          <a href="/map?locate=1" className="button button-ghost">
            Turn on location
          </a>
        </div>
      </article>
    );
  }

  if (isMapOpen && status === "loading") {
    return (
      <article className="home-map-launchpad home-map-launchpad-loading premium-surface" id="map-launchpad">
        <p className="section-label">Loading live map</p>
        <h2>Preparing the city view.</h2>
        <p>The homepage stays fast first, then the live map loads only after you ask for it.</p>
      </article>
    );
  }

  if (isMapOpen && items) {
    return (
      <div className="home-map-preview-shell" id="map-launchpad">
        <div className="home-map-preview-toolbar premium-surface">
          <div className="home-map-preview-copy">
            <p className="section-label">Live map preview</p>
            <h2>Open the city only when you need it.</h2>
            <p>The homepage preview is now on demand. For location access, jump into the dedicated map page.</p>
          </div>

          <div className="home-map-preview-actions">
            <button type="button" className="button button-secondary" onClick={() => setIsMapOpen(false)}>
              Hide map
            </button>
            <a href="/map" className="button button-ghost">
              Open full map
            </a>
            <a href="/map?locate=1" className="button button-primary">
              Turn on location
            </a>
          </div>
        </div>

        <LazyHomeLiveMap items={items} variant="preview" />
      </div>
    );
  }

  return (
    <article className="home-map-launchpad premium-surface" id="map-launchpad">
      <p className="section-label">Map on demand</p>
      <h2>Keep the homepage fast. Open the map only when you want it.</h2>
      <p>
        The live map no longer slows the first screen. Open it here for a quick preview, or jump into the dedicated
        map page when you want nearby discovery.
      </p>

      <div className="home-map-launchpad-metrics">
        <article>
          <strong>{totalHomes}</strong>
          <span>Published residences</span>
        </article>
        <article>
          <strong>{liveCities}</strong>
          <span>Active city areas</span>
        </article>
      </div>

      <div className="home-map-launchpad-actions">
        <button type="button" className="button button-primary" onClick={openMap}>
          Show map
        </button>
        <a href="/map?locate=1" className="button button-secondary">
          Turn on location
        </a>
        <a href="/map" className="button button-ghost">
          Open full map
        </a>
      </div>
    </article>
  );
}
