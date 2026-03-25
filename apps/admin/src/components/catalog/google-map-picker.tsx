"use client";

import { useEffect, useRef } from 'react';

import { env } from '@/lib/config/env';

declare global {
  interface Window {
    google?: any;
  }
}

type GoogleMapPickerProps = {
  latitude: string;
  longitude: string;
  onChange: (coords: { latitude: string; longitude: string }) => void;
};

let mapsScriptPromise: Promise<void> | null = null;
let leafletPromise: Promise<typeof import('leaflet')> | null = null;

function loadGoogleMapsScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = import('leaflet');
  }

  return leafletPromise;
}

export function GoogleMapPicker({ latitude, longitude, onChange }: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!env.googleMapsApiKey || !mapRef.current) {
      let cancelled = false;
      let map: import('leaflet').Map | null = null;

      const initialLat = Number(latitude || '41.311081');
      const initialLng = Number(longitude || '69.240562');
      const center: [number, number] = [
        Number.isFinite(initialLat) ? initialLat : 41.311081,
        Number.isFinite(initialLng) ? initialLng : 69.240562,
      ];

      loadLeaflet()
        .then((L) => {
          if (!mapRef.current || cancelled) {
            return;
          }

          map = L.map(mapRef.current, {
            center,
            zoom: 12,
            scrollWheelZoom: true,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          const marker = L.marker(center, {
            draggable: true,
            icon: L.divIcon({
              className: 'catalog-map-marker-shell',
              html: '<span class="catalog-map-marker"></span>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          }).addTo(map);

          map.on('click', (event) => {
            marker.setLatLng(event.latlng);
            onChange({
              latitude: event.latlng.lat.toFixed(6),
              longitude: event.latlng.lng.toFixed(6),
            });
          });

          marker.on('moveend', () => {
            const position = marker.getLatLng();
            onChange({
              latitude: position.lat.toFixed(6),
              longitude: position.lng.toFixed(6),
            });
          });
        })
        .catch(() => undefined);

      return () => {
        cancelled = true;
        map?.remove();
      };
    }

    let marker: any = null;
    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (!mapRef.current || cancelled || !window.google?.maps) {
          return;
        }

        const initialLat = Number(latitude || '41.311081');
        const initialLng = Number(longitude || '69.240562');
        const center = {
          lat: Number.isFinite(initialLat) ? initialLat : 41.311081,
          lng: Number.isFinite(initialLng) ? initialLng : 69.240562,
        };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
        });

        map.addListener('click', (event: any) => {
          if (!event.latLng || !marker) {
            return;
          }

          marker.setPosition(event.latLng);
          onChange({
            latitude: event.latLng.lat().toFixed(6),
            longitude: event.latLng.lng().toFixed(6),
          });
        });

        marker.addListener('dragend', (event: any) => {
          if (!event.latLng) {
            return;
          }

          onChange({
            latitude: event.latLng.lat().toFixed(6),
            longitude: event.latLng.lng().toFixed(6),
          });
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      marker?.setMap(null);
    };
  }, [latitude, longitude, onChange]);

  return (
    <div className="catalog-map-stack">
      <div ref={mapRef} className="catalog-map-canvas" />
      {!env.googleMapsApiKey ? (
        <div className="catalog-map-fallback">
          <strong>Interactive OpenStreetMap picker enabled</strong>
          <p>Click anywhere on the map or drag the marker to update apartment coordinates. Add a Google Maps key later if you want to switch providers.</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude || '41.311081'},${longitude || '69.240562'}`}
            target="_blank"
            rel="noreferrer"
          >
            Open current coordinates in Google Maps
          </a>
        </div>
      ) : null}
    </div>
  );
}
