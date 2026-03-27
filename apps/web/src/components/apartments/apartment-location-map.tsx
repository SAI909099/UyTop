"use client";

import { useEffect, useRef, useState } from 'react';

type ApartmentLocationMapProps = {
  latitude: number;
  longitude: number;
  title: string;
  locationLabel: string;
};

type LeafletMap = import('leaflet').Map;

let leafletPromise: Promise<typeof import('leaflet')> | null = null;

function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = import('leaflet');
  }

  return leafletPromise;
}

function createMarkerIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: 'apartment-location-marker-shell',
    html: '<span class="apartment-location-marker"><span>UT</span></span>',
    iconSize: [72, 72],
    iconAnchor: [36, 36],
  });
}

export function ApartmentLocationMap({
  latitude,
  longitude,
  title,
  locationLabel,
}: ApartmentLocationMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (!mapRef.current || cancelled || leafletMapRef.current) {
          return;
        }

        const map = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          minZoom: 10,
          maxZoom: 18,
          scrollWheelZoom: false,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([latitude, longitude], {
          icon: createMarkerIcon(L),
        }).addTo(map);

        leafletMapRef.current = map;
        markerRef.current = marker;

        window.setTimeout(() => {
          map.invalidateSize();
        }, 120);
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, [latitude, locationLabel, longitude, title]);

  if (hasError) {
    return (
      <div className="apartment-location-map-fallback">
        <p>Map preview is unavailable right now.</p>
        <span>{locationLabel}</span>
      </div>
    );
  }

  return (
    <div className="apartment-location-map-shell">
      <div ref={mapRef} className="apartment-location-map-canvas" />
      <div className="apartment-location-map-caption">
        <strong>{title}</strong>
        <span>{locationLabel}</span>
      </div>
    </div>
  );
}
