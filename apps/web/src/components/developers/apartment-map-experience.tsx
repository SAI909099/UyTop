"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { env } from "@/lib/config/env";
import { getApartmentMapPopupMarkup, getApartmentPaymentOptionLabels } from "@/lib/maps/apartment-popup";
import { formatCurrency } from "@/lib/utils/format";
import type { ApartmentMapPreview } from "@/types/developers";

declare global {
  interface Window {
    google?: any;
  }
}

type ApartmentMapExperienceProps = {
  apartments: ApartmentMapPreview[];
};

let scriptPromise: Promise<void> | null = null;
let leafletPromise: Promise<typeof import("leaflet")> | null = null;

function loadMaps() {
  if (typeof window === "undefined" || window.google?.maps) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = import("leaflet");
  }

  return leafletPromise;
}

export function ApartmentMapExperience({ apartments }: ApartmentMapExperienceProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(apartments[0]?.id ?? null);
  const [openPopupApartmentId, setOpenPopupApartmentId] = useState<string | null>(null);

  const selectedApartment = useMemo(
    () => apartments.find((item) => item.id === selectedApartmentId) ?? apartments[0] ?? null,
    [apartments, selectedApartmentId],
  );
  const openPopupApartment = useMemo(
    () => apartments.find((item) => item.id === openPopupApartmentId) ?? null,
    [apartments, openPopupApartmentId],
  );
  const selectedPaymentOptions = selectedApartment ? getApartmentPaymentOptionLabels(selectedApartment) : [];

  useEffect(() => {
    if (!mapRef.current || apartments.length === 0) {
      return;
    }

    if (!env.googleMapsApiKey) {
      let map: import("leaflet").Map | null = null;
      let disposed = false;

      loadLeaflet()
        .then((L) => {
          if (!mapRef.current || disposed) {
            return;
          }

          const selected = apartments.find((item) => item.id === selectedApartmentId) ?? apartments[0];
          map = L.map(mapRef.current, {
            center: [selected.latitude, selected.longitude],
            zoom: apartments.length > 1 ? 12 : 14,
            scrollWheelZoom: true,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map);

          const bounds = L.latLngBounds([]);
          apartments.forEach((apartment) => {
            const marker = L.marker([apartment.latitude, apartment.longitude], {
              icon: L.divIcon({
                className: "apartment-price-pin-shell",
                html: `<span class="apartment-price-pin ${apartment.id === selectedApartment.id ? "apartment-price-pin-selected" : ""}">${formatCurrency(apartment.price, apartment.currency)}</span>`,
                iconSize: [104, 40],
                iconAnchor: [52, 20],
              }),
            }).addTo(map as import("leaflet").Map);

            marker.bindPopup(getApartmentMapPopupMarkup(apartment), {
              className: "apartment-map-popup-shell",
              closeButton: true,
              minWidth: 292,
              maxWidth: 320,
              autoPanPadding: [24, 24],
            });

            marker.on("click", () => {
              setSelectedApartmentId(apartment.id);
              setOpenPopupApartmentId(apartment.id);
            });
            bounds.extend([apartment.latitude, apartment.longitude]);

            if (openPopupApartmentId === apartment.id) {
              marker.openPopup();
            }
          });

          map.on("click", () => setOpenPopupApartmentId(null));
          map.on("popupclose", () => setOpenPopupApartmentId(null));

          if (apartments.length > 1) {
            map.fitBounds(bounds.pad(0.15), { padding: [36, 36] });
          } else {
            map.setView([selected.latitude, selected.longitude], 14);
          }

          map.panTo([selected.latitude, selected.longitude]);
        })
        .catch(() => undefined);

      return () => {
        disposed = true;
        map?.remove();
      };
    }

    let markers: any[] = [];
    let infoWindow: any = null;
    let disposed = false;

    loadMaps()
      .then(() => {
        if (!mapRef.current || disposed || !window.google?.maps) {
          return;
        }

        const selected = apartments.find((item) => item.id === selectedApartmentId) ?? apartments[0];
        const center = {
          lat: selected.latitude,
          lng: selected.longitude,
        };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        infoWindow = new window.google.maps.InfoWindow();
        map.addListener("click", () => {
          infoWindow.close();
          setOpenPopupApartmentId(null);
        });
        infoWindow.addListener("closeclick", () => setOpenPopupApartmentId(null));

        const bounds = new window.google.maps.LatLngBounds();
        markers = apartments.map((apartment) => {
          const marker = new window.google.maps.Marker({
            position: { lat: apartment.latitude, lng: apartment.longitude },
            map,
            title: apartment.title,
            label: {
              text: formatCurrency(apartment.price, apartment.currency),
              color: "#ffffff",
              fontWeight: "700",
            },
          });

          marker.addListener("click", () => {
            setSelectedApartmentId(apartment.id);
            setOpenPopupApartmentId(apartment.id);
          });
          bounds.extend({ lat: apartment.latitude, lng: apartment.longitude });

          if (openPopupApartmentId === apartment.id) {
            infoWindow.setContent(getApartmentMapPopupMarkup(apartment));
            infoWindow.open({ anchor: marker, map });
          }
          return marker;
        });

        if (apartments.length > 1) {
          map.fitBounds(bounds, 80);
          map.panTo({ lat: selected.latitude, lng: selected.longitude });
        } else if (openPopupApartment) {
          map.setCenter({ lat: openPopupApartment.latitude, lng: openPopupApartment.longitude });
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      infoWindow?.close();
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [apartments, openPopupApartment, openPopupApartmentId, selectedApartmentId]);

  return (
    <div className="apartment-map-layout">
      <PremiumCard className="apartment-map-surface-card">
        <div className="apartment-map-shell">
          <div ref={mapRef} className="apartment-map-canvas" />
          {!env.googleMapsApiKey ? (
            <div className="apartment-map-fallback">
              <strong>OpenStreetMap fallback is active</strong>
              <p>The map stays fully interactive in local development. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` only if you want to switch to Google Maps.</p>
            </div>
          ) : null}
        </div>
      </PremiumCard>

      <div className="apartment-map-rail">
        {selectedApartment ? (
          <PremiumCard className="apartment-map-selected">
            <img src={selectedApartment.primaryImage ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"} alt={selectedApartment.title} />
            <div className="apartment-map-selected-copy">
              <p className="eyebrow">Selected apartment</p>
              <h3>{selectedApartment.title}</h3>
              <strong>{formatCurrency(selectedApartment.price, selectedApartment.currency)}</strong>
              <p>{selectedApartment.projectName} · {selectedApartment.buildingName}</p>
              <p>{selectedApartment.rooms} rooms · {selectedApartment.sizeSqm} sqm</p>
              {selectedPaymentOptions.length ? (
                <div className="apartment-map-chip-row">
                  {selectedPaymentOptions.map((option) => (
                    <span key={option} className="apartment-map-chip">
                      {option}
                    </span>
                  ))}
                </div>
              ) : null}
              <ButtonLink
                href={`/projects/${selectedApartment.projectSlug}/buildings/${selectedApartment.buildingSlug}`}
                variant="secondary"
              >
                Explore details
              </ButtonLink>
            </div>
          </PremiumCard>
        ) : null}

        <div className="apartment-map-list">
          {apartments.map((apartment) => (
            <button
              key={apartment.id}
              type="button"
              className={`apartment-map-item ${selectedApartmentId === apartment.id ? "apartment-map-item-active" : ""}`}
              onClick={() => {
                setSelectedApartmentId(apartment.id);
                setOpenPopupApartmentId(apartment.id);
              }}
            >
              <strong>{formatCurrency(apartment.price, apartment.currency)}</strong>
              <span>{apartment.projectName} · {apartment.buildingName}</span>
              <small>{apartment.rooms} rooms · {apartment.sizeSqm} sqm</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
