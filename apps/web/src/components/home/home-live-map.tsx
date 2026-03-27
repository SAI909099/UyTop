"use client";

import { useEffect, useRef, useState } from "react";

import { getPublicApartmentDetail } from "@/lib/api/public";
import { formatCompactCurrency, formatCurrency, formatLabel, formatRooms } from "@/lib/utils/format";
import type { PublicApartmentDetail, PublicMapApartment } from "@/types/home";

type HomeLiveMapProps = {
  items: PublicMapApartment[];
  variant?: "preview" | "fullscreen";
  autoLocate?: boolean;
};

type AggregationMode = "district" | "radius" | "exact";

type MapViewport = {
  zoom: number;
  north: number;
  south: number;
  east: number;
  west: number;
};

type DetailStatus = "idle" | "loading" | "ready" | "error";
type LocationStatus = "idle" | "requesting" | "ready" | "denied" | "unavailable" | "unsupported";

type NormalizedApartment = PublicMapApartment & {
  lat: number;
  lng: number;
};

type ClusterGroup = {
  count: number;
  items: NormalizedApartment[];
  kind: "district" | "radius";
  lat: number;
  lng: number;
  bounds: [number, number][];
  subtitle: string;
  title: string;
};

type DetailImage = {
  id: number;
  image_url: string;
  is_primary: boolean;
};

type LeafletMap = import("leaflet").Map;
type LeafletLayerGroup = import("leaflet").LayerGroup;

type UserLocation = {
  accuracy: number;
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562];
const DEFAULT_CITY_NAME = "Tashkent";
const DISTRICT_VIEW_MAX_ZOOM = 11;
const EXACT_MARKER_ZOOM_THRESHOLD = 14;

let leafletPromise: Promise<typeof import("leaflet")> | null = null;

function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = import("leaflet");
  }

  return leafletPromise;
}

function parseCoordinate(value: string | number, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeItems(items: PublicMapApartment[]) {
  return items
    .map((item) => ({
      ...item,
      lat: parseCoordinate(item.latitude, DEFAULT_CENTER[0]),
      lng: parseCoordinate(item.longitude, DEFAULT_CENTER[1]),
    }))
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

function fitMapToApartments(map: LeafletMap, apartments: NormalizedApartment[], maxZoom = 13) {
  if (!apartments.length) {
    return;
  }

  if (apartments.length === 1) {
    map.setView([apartments[0].lat, apartments[0].lng], 15, { animate: false });
    return;
  }

  map.fitBounds(
    apartments.map((apartment) => [apartment.lat, apartment.lng] as [number, number]),
    {
      padding: [72, 72],
      maxZoom,
      animate: false,
    },
  );
}

function getViewport(map: LeafletMap): MapViewport {
  const bounds = map.getBounds();
  return {
    zoom: map.getZoom(),
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function isWithinViewport(item: NormalizedApartment, viewport: MapViewport) {
  return (
    item.lat <= viewport.north &&
    item.lat >= viewport.south &&
    item.lng <= viewport.east &&
    item.lng >= viewport.west
  );
}

function getVisibleItems(items: NormalizedApartment[], viewport: MapViewport | null) {
  if (!viewport) {
    return items;
  }

  return items.filter((item) => isWithinViewport(item, viewport));
}

function getAggregationMode(zoom: number): AggregationMode {
  if (zoom <= DISTRICT_VIEW_MAX_ZOOM) {
    return "district";
  }

  if (zoom < EXACT_MARKER_ZOOM_THRESHOLD) {
    return "radius";
  }

  return "exact";
}

function getNearbyRadiusMeters(zoom: number) {
  return zoom <= 12 ? 3000 : 2000;
}

function buildClusterGroup(
  items: NormalizedApartment[],
  kind: ClusterGroup["kind"],
  title: string,
  subtitle: string,
): ClusterGroup {
  const sumLat = items.reduce((total, item) => total + item.lat, 0);
  const sumLng = items.reduce((total, item) => total + item.lng, 0);
  const minLat = Math.min(...items.map((item) => item.lat));
  const maxLat = Math.max(...items.map((item) => item.lat));
  const minLng = Math.min(...items.map((item) => item.lng));
  const maxLng = Math.max(...items.map((item) => item.lng));

  return {
    count: items.length,
    items,
    kind,
    lat: sumLat / items.length,
    lng: sumLng / items.length,
    bounds: [
      [minLat, minLng] as [number, number],
      [maxLat, maxLng] as [number, number],
    ],
    subtitle,
    title,
  };
}

function buildDistrictGroups(items: NormalizedApartment[]): ClusterGroup[] {
  const buckets = new Map<string, { items: NormalizedApartment[]; subtitle: string; title: string }>();

  items.forEach((item) => {
    const key = item.district ? `district:${item.district.id}` : `city:${item.city.id}`;
    const title = item.district?.name ?? item.city.name;
    const subtitle = item.district ? "homes for sale" : "undistricted homes";
    const existing = buckets.get(key);

    if (existing) {
      existing.items.push(item);
      return;
    }

    buckets.set(key, {
      items: [item],
      subtitle,
      title,
    });
  });

  return Array.from(buckets.values())
    .map((bucket) => buildClusterGroup(bucket.items, "district", bucket.title, bucket.subtitle))
    .sort((left, right) => right.count - left.count);
}

function buildRadiusGroups(items: NormalizedApartment[], map: LeafletMap, radiusMeters: number): ClusterGroup[] {
  const remaining = [...items].sort((left, right) => left.lat - right.lat || left.lng - right.lng);
  const groups: ClusterGroup[] = [];

  while (remaining.length) {
    const seed = remaining.shift();
    if (!seed) {
      break;
    }

    const grouped = [seed];
    const queue = [seed];

    while (queue.length) {
      const current = queue.pop();
      if (!current) {
        continue;
      }

      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        const candidate = remaining[index];
        const distance = map.distance([current.lat, current.lng], [candidate.lat, candidate.lng]);

        if (distance > radiusMeters) {
          continue;
        }

        grouped.push(candidate);
        queue.push(candidate);
        remaining.splice(index, 1);
      }
    }

    groups.push(
      buildClusterGroup(
        grouped,
        "radius",
        `Within ${Math.round(radiusMeters / 1000)} km`,
        "homes for sale",
      ),
    );
  }

  return groups.sort((left, right) => right.count - left.count);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createClusterIcon(
  L: typeof import("leaflet"),
  group: ClusterGroup,
  isSelected: boolean,
) {
  const isDistrict = group.kind === "district";
  const width = isDistrict ? Math.min(176, 144 + Math.min(group.count, 10) * 4) : Math.min(128, 86 + Math.min(group.count, 10) * 4);
  const height = isDistrict ? 116 : width;

  return L.divIcon({
    className: "home-map-cluster-marker-shell",
    html: `<span class="home-map-cluster-marker home-map-cluster-marker-${group.kind}${isSelected ? " home-map-cluster-marker-selected" : ""}">
      <small>${escapeHtml(group.title)}</small>
      <strong>${group.count}</strong>
      <span>${escapeHtml(group.count === 1 ? group.subtitle.replace("homes", "home") : group.subtitle)}</span>
    </span>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
}

function createPropertyIcon(
  L: typeof import("leaflet"),
  apartment: NormalizedApartment,
  isSelected: boolean,
) {
  const photo = apartment.primary_image
    ? `<img src="${escapeHtml(apartment.primary_image)}" alt="${escapeHtml(apartment.title)}" />`
    : `<span class="home-map-property-marker-fallback">${escapeHtml(getInitials(apartment.project_name || apartment.title))}</span>`;

  return L.divIcon({
    className: "home-map-property-marker-shell",
    html: `<span class="home-map-property-marker${isSelected ? " home-map-property-marker-selected" : ""}">
      <span class="home-map-property-marker-photo">${photo}</span>
      <span class="home-map-property-marker-price">${formatCompactCurrency(apartment.price, apartment.currency)}</span>
    </span>`,
    iconSize: [90, 106],
    iconAnchor: [45, 92],
  });
}

function getLeadImage(
  detail: PublicApartmentDetail | null,
  selectedApartment: PublicMapApartment,
) {
  if (detail?.images?.length) {
    return detail.images.find((image) => image.is_primary)?.image_url ?? detail.images[0]?.image_url ?? null;
  }

  return selectedApartment.primary_image;
}

function getDetailImages(detail: PublicApartmentDetail | null, selectedApartment: PublicMapApartment): DetailImage[] {
  if (detail?.images?.length) {
    return detail.images.map((image) => ({
      id: image.id,
      image_url: image.image_url,
      is_primary: image.is_primary,
    }));
  }

  if (selectedApartment.primary_image) {
    return [
      {
        id: selectedApartment.id,
        image_url: selectedApartment.primary_image,
        is_primary: true,
      },
    ];
  }

  return [];
}

function getLocationLabel(detail: PublicApartmentDetail | null) {
  const city = detail?.city.name ?? DEFAULT_CITY_NAME;
  const district = detail?.district?.name;

  return district ? `${district}, ${city}` : city;
}

function getLocationFeedback(status: LocationStatus) {
  if (status === "requesting") {
    return {
      tone: "neutral",
      message: "Finding your current location on the map…",
    };
  }

  if (status === "ready") {
    return {
      tone: "success",
      message: "Showing your current location so you can browse homes nearby.",
    };
  }

  if (status === "denied") {
    return {
      tone: "error",
      message: "Location access is off. Enable it in your browser settings and try Near me again.",
    };
  }

  if (status === "unavailable") {
    return {
      tone: "error",
      message: "Your location could not be detected right now. Try Near me again in a moment.",
    };
  }

  if (status === "unsupported") {
    return {
      tone: "error",
      message: "This browser does not support location access for the live map.",
    };
  }

  return null;
}

export function HomeLiveMap({ items, variant = "preview", autoLocate = false }: HomeLiveMapProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapViewport, setMapViewport] = useState<MapViewport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStatus, setDetailStatus] = useState<DetailStatus>("idle");
  const [detailData, setDetailData] = useState<PublicApartmentDetail | null>(null);
  const [detailRequestKey, setDetailRequestKey] = useState(0);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const leafletLibRef = useRef<typeof import("leaflet") | null>(null);
  const markerLayerRef = useRef<LeafletLayerGroup | null>(null);
  const userLocationLayerRef = useRef<LeafletLayerGroup | null>(null);
  const itemSignatureRef = useRef("");
  const loadedDetailSlugRef = useRef<string | null>(null);
  const autoLocateHandledRef = useRef(false);

  const apartments = normalizeItems(items);
  const apartmentSignature = apartments
    .map((item) => `${item.id}:${item.lat}:${item.lng}:${item.price}:${item.primary_image ?? ""}:${item.status}`)
    .join("|");
  const selectedApartment = apartments.find((item) => item.id === selectedId) ?? null;
  const selectedDetail = selectedApartment && detailData?.slug === selectedApartment.slug ? detailData : null;
  const visibleItems = getVisibleItems(apartments, mapViewport);
  const isPreview = variant === "preview";
  const canLocateUser = variant === "fullscreen";
  const fitMaxZoom = isPreview ? 13 : 14;
  const mapZoom = mapViewport?.zoom ?? DISTRICT_VIEW_MAX_ZOOM;
  const aggregationMode = apartments.length > 1 ? getAggregationMode(mapZoom) : "exact";
  const nearbyRadiusMeters = aggregationMode === "radius" ? getNearbyRadiusMeters(mapZoom) : null;
  const detailImages = selectedApartment ? getDetailImages(selectedDetail, selectedApartment) : [];
  const detailLeadImage = selectedApartment ? getLeadImage(selectedDetail, selectedApartment) : null;
  const locationFeedback = canLocateUser ? getLocationFeedback(locationStatus) : null;

  const handleShowMap = () => {
    const map = leafletMapRef.current;
    if (!map) {
      return;
    }

    setSelectedId(null);
    setDetailOpen(false);
    fitMapToApartments(map, apartments, fitMaxZoom);
    setMapViewport(getViewport(map));
  };

  const requestUserLocation = () => {
    if (!canLocateUser || typeof window === "undefined") {
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    setSelectedId(null);
    setDetailOpen(false);
    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          accuracy: position.coords.accuracy,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setLocationStatus("ready");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          return;
        }

        setLocationStatus("unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
  };

  useEffect(() => {
    if (!apartments.length) {
      setSelectedId(null);
      setDetailOpen(false);
      return;
    }

    if (selectedId !== null && !apartments.some((item) => item.id === selectedId)) {
      setSelectedId(null);
      setDetailOpen(false);
    }
  }, [apartmentSignature, selectedId]);

  useEffect(() => {
    if (aggregationMode === "exact" || selectedId === null) {
      return;
    }

    setSelectedId(null);
    setDetailOpen(false);
  }, [aggregationMode, selectedId]);

  useEffect(() => {
    let cancelled = false;
    let detachEvents: (() => void) | null = null;

    loadLeaflet()
      .then((L) => {
        if (!mapRef.current || cancelled || leafletMapRef.current) {
          return;
        }

        leafletLibRef.current = L;

        const initialCenter: [number, number] = apartments.length
          ? [apartments[0].lat, apartments[0].lng]
          : DEFAULT_CENTER;

        const map = L.map(mapRef.current, {
          center: initialCenter,
          zoom: apartments.length > 1 ? 11 : 15,
          minZoom: 10,
          maxZoom: 18,
          scrollWheelZoom: true,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        markerLayerRef.current = L.layerGroup().addTo(map);
        userLocationLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;

        const syncViewport = () => {
          setMapViewport(getViewport(map));
        };

        map.on("moveend zoomend resize", syncViewport);
        detachEvents = () => {
          map.off("moveend zoomend resize", syncViewport);
        };

        window.setTimeout(() => {
          map.invalidateSize();
          syncViewport();
          setMapReady(true);
        }, 150);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      detachEvents?.();
      markerLayerRef.current?.remove();
      userLocationLayerRef.current?.remove();
      leafletMapRef.current?.remove();
      markerLayerRef.current = null;
      userLocationLayerRef.current = null;
      leafletMapRef.current = null;
      leafletLibRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !apartments.length) {
      return;
    }

    if (apartmentSignature === itemSignatureRef.current) {
      return;
    }

    itemSignatureRef.current = apartmentSignature;
    fitMapToApartments(map, apartments, fitMaxZoom);
    setMapViewport(getViewport(map));
  }, [apartmentSignature, fitMaxZoom]);

  useEffect(() => {
    const L = leafletLibRef.current;
    const map = leafletMapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!L || !map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();

    if (!apartments.length) {
      return;
    }

    const currentVisibleItems = getVisibleItems(apartments, mapViewport);
    const renderItems = mapViewport ? currentVisibleItems : apartments;

    if (aggregationMode === "district") {
      buildDistrictGroups(renderItems).forEach((cluster) => {
        const isSelectedCluster = cluster.items.some((item) => item.id === selectedId);
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: createClusterIcon(L, cluster, isSelectedCluster),
        });

        marker.on("click", () => {
          if (cluster.count === 1) {
            const [apartment] = cluster.items;
            map.setView([apartment.lat, apartment.lng], DISTRICT_VIEW_MAX_ZOOM + 2, {
              animate: true,
            });
            return;
          }

          map.fitBounds(cluster.bounds, {
            padding: [80, 80],
            maxZoom: DISTRICT_VIEW_MAX_ZOOM + 2,
            animate: true,
          });
        });

        marker.addTo(markerLayer);
      });

      return;
    }

    if (aggregationMode === "radius") {
      buildRadiusGroups(renderItems, map, nearbyRadiusMeters ?? 2000).forEach((cluster) => {
        const isSelectedCluster = cluster.items.some((item) => item.id === selectedId);
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: createClusterIcon(L, cluster, isSelectedCluster),
        });

        marker.on("click", () => {
          if (cluster.count === 1) {
            const [apartment] = cluster.items;
            map.setView([apartment.lat, apartment.lng], EXACT_MARKER_ZOOM_THRESHOLD + 1, {
              animate: true,
            });
            return;
          }

          map.fitBounds(cluster.bounds, {
            padding: [80, 80],
            maxZoom: EXACT_MARKER_ZOOM_THRESHOLD + 1,
            animate: true,
          });
        });

        marker.addTo(markerLayer);
      });

      return;
    }

    [...renderItems]
      .sort((left, right) => Number(left.id === selectedId) - Number(right.id === selectedId))
      .forEach((apartment) => {
        const marker = L.marker([apartment.lat, apartment.lng], {
          icon: createPropertyIcon(L, apartment, apartment.id === selectedId),
        });

        marker.on("click", () => {
          setSelectedId(apartment.id);
        });

        marker.addTo(markerLayer);
      });
  }, [aggregationMode, apartmentSignature, mapViewport, nearbyRadiusMeters, selectedId]);

  useEffect(() => {
    const L = leafletLibRef.current;
    const map = leafletMapRef.current;
    const userLocationLayer = userLocationLayerRef.current;

    if (!L || !map || !userLocationLayer) {
      return;
    }

    userLocationLayer.clearLayers();

    if (!userLocation) {
      return;
    }

    const accuracyRadius = Number.isFinite(userLocation.accuracy)
      ? Math.min(Math.max(userLocation.accuracy, 70), 260)
      : 120;

    L.circle([userLocation.lat, userLocation.lng], {
      radius: accuracyRadius,
      color: "#d4af37",
      fillColor: "#d4af37",
      fillOpacity: 0.16,
      opacity: 0.34,
      weight: 1,
    }).addTo(userLocationLayer);

    L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 10,
      color: "#08111e",
      fillColor: "#f2ddb0",
      fillOpacity: 1,
      weight: 3,
    }).addTo(userLocationLayer);
  }, [mapViewport, userLocation]);

  useEffect(() => {
    const map = leafletMapRef.current;

    if (!mapReady || !map || !userLocation || locationStatus !== "ready") {
      return;
    }

    map.setView([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 15), {
      animate: true,
    });
    setMapViewport(getViewport(map));
  }, [locationStatus, mapReady, userLocation]);

  useEffect(() => {
    if (!autoLocate || !canLocateUser || !mapReady || autoLocateHandledRef.current) {
      return;
    }

    autoLocateHandledRef.current = true;
    requestUserLocation();

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("locate");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [autoLocate, canLocateUser, mapReady]);

  useEffect(() => {
    if (!detailOpen || !selectedApartment) {
      return;
    }

    if (loadedDetailSlugRef.current === selectedApartment.slug && selectedDetail) {
      setDetailStatus("ready");
      return;
    }

    let cancelled = false;
    setDetailStatus("loading");

    getPublicApartmentDetail(selectedApartment.slug)
      .then((data) => {
        if (cancelled) {
          return;
        }

        loadedDetailSlugRef.current = data.slug;
        setDetailData(data);
        setDetailStatus("ready");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setDetailStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [detailOpen, detailRequestKey, selectedApartment?.slug]);

  if (!apartments.length) {
    return (
      <div className="home-map-empty premium-surface">
        <p className="section-label">Map-first experience</p>
        <h3>Live public apartments will appear here as soon as inventory is published.</h3>
        <p>
          The homepage remains wired to live backend endpoints, so this state is intentional rather than mocked.
        </p>
      </div>
    );
  }

  const detailProjectName = selectedApartment ? selectedDetail?.project_name ?? selectedApartment.project_name : "";
  const detailBuildingName = selectedApartment ? selectedDetail?.building_name ?? selectedApartment.building_name : "";
  const detailCompanyName = selectedApartment ? selectedDetail?.company_name ?? selectedApartment.company_name : "";
  const detailPrice = selectedApartment
    ? formatCurrency(
        selectedDetail?.price ?? selectedApartment.price,
        selectedDetail?.currency ?? selectedApartment.currency,
      )
    : "";
  const detailRooms = selectedApartment ? selectedDetail?.rooms ?? selectedApartment.rooms : 0;
  const detailSize = selectedApartment ? selectedDetail?.size_sqm ?? selectedApartment.size_sqm : "";
  const detailAddress = selectedApartment
    ? selectedDetail?.address ?? `${detailBuildingName}, ${getLocationLabel(selectedDetail)}`
    : "";
  const detailPaymentOptions = selectedApartment
    ? selectedDetail?.payment_options ?? selectedApartment.payment_options
    : [];
  const detailDescription =
    selectedDetail?.description?.trim() || "No additional apartment description has been published yet.";

  return (
    <div className={`home-map-shell home-map-shell-${variant}${detailOpen ? " home-map-shell-detail-open" : ""}`}>
      <div className={`home-map-stage${isPreview ? "" : " home-map-stage-fullscreen"}`}>
        <div className="home-map-layer-glow" />
        <div ref={mapRef} className="home-map-canvas" />

        <div className="home-map-status-bar">
          <span className="home-map-status-pill">
            {aggregationMode === "district" ? "District totals" : aggregationMode === "radius" ? "Nearby homes" : "Exact homes"}
          </span>
          <span className="home-map-status-pill">
            {visibleItems.length} visible {visibleItems.length === 1 ? "home" : "homes"}
          </span>
        </div>

        <div className="home-map-controls">
          <button
            type="button"
            className="home-map-control-button"
            aria-label="Zoom in"
            onClick={() => leafletMapRef.current?.zoomIn()}
          >
            +
          </button>
          <button
            type="button"
            className="home-map-control-button"
            aria-label="Zoom out"
            onClick={() => leafletMapRef.current?.zoomOut()}
          >
            -
          </button>
          <button
            type="button"
            className="home-map-control-button home-map-control-button-wide"
            onClick={handleShowMap}
          >
            Show map
          </button>
          {canLocateUser ? (
            <button
              type="button"
              className="home-map-control-button home-map-control-button-wide"
              onClick={requestUserLocation}
              disabled={locationStatus === "requesting"}
            >
              {locationStatus === "requesting" ? "Locating" : "Near me"}
            </button>
          ) : null}
        </div>

        {locationFeedback ? (
          <div
            className={`home-map-location-feedback home-map-location-feedback-${locationFeedback.tone}`}
            aria-live="polite"
          >
            <strong>Location</strong>
            <p>{locationFeedback.message}</p>
          </div>
        ) : null}

        {!selectedApartment ? (
          <div className={`home-map-hint-bar${isPreview ? "" : " home-map-hint-bar-fullscreen"}`}>
            <span className="home-map-hint-pill">
              {aggregationMode === "district"
                ? "District totals first"
                : aggregationMode === "radius"
                  ? `Nearby homes within ${Math.round((nearbyRadiusMeters ?? 2000) / 1000)} km`
                  : "Exact homes with photos"}
            </span>
            <span className="home-map-hint-pill">
              {aggregationMode === "district" ? "Zoom in for nearby areas" : "Zoom in for exact homes"}
            </span>
            <span className="home-map-hint-pill">
              {isPreview ? "Preview the city here" : "Click a home to inspect it"}
            </span>
            {isPreview ? (
              <a href="/map" className="home-map-hint-link">
                Open full map
              </a>
            ) : null}
          </div>
        ) : null}

        {selectedApartment ? (
          <article className="home-map-selected-card">
            <div className="home-map-selected-media">
              {selectedApartment.primary_image ? (
                <img src={selectedApartment.primary_image} alt={selectedApartment.title} />
              ) : (
                <div className="home-map-selected-placeholder">{getInitials(selectedApartment.project_name)}</div>
              )}
              <div className="home-map-selected-media-overlay" />
              <div className="home-map-selected-media-topline">
                <p className="section-label">Selected residence</p>
                <strong>{formatCurrency(selectedApartment.price, selectedApartment.currency)}</strong>
              </div>
            </div>

            <div className="home-map-selected-body">
              <h3>{selectedApartment.title}</h3>
              <p>
                {selectedApartment.project_name} · {selectedApartment.building_name}
              </p>

              <div className="home-map-selected-meta">
                <span>{formatRooms(selectedApartment.rooms)}</span>
                <span>{selectedApartment.size_sqm} sqm</span>
                <span>{selectedApartment.company_name}</span>
              </div>

              {selectedApartment.payment_options.length ? (
                <div className="home-map-selected-payments">
                  {selectedApartment.payment_options.slice(0, 3).map((option) => (
                    <span key={option.payment_type}>{formatLabel(option.payment_type)}</span>
                  ))}
                </div>
              ) : null}

              <div className="home-map-selected-actions">
                <div className="home-map-selected-action-group">
                  <button
                    type="button"
                    className="home-map-inline-button"
                    onClick={() => {
                      setDetailOpen(false);
                      setSelectedId(null);
                    }}
                  >
                    Back
                  </button>
                  <a href={`/apartments/${selectedApartment.slug}`} className="home-map-inline-button">
                    View page
                  </a>
                  <button
                    type="button"
                    className="home-map-action-button"
                    onClick={() => {
                      setDetailOpen(true);
                      if (loadedDetailSlugRef.current !== selectedApartment.slug) {
                        setDetailData(null);
                        setDetailStatus("idle");
                      }
                    }}
                  >
                    More
                  </button>
                </div>
                <small>{getLocationLabel(selectedDetail)}</small>
              </div>
            </div>
          </article>
        ) : null}

        {detailOpen && selectedApartment ? (
          <>
            <button
              type="button"
              className="home-map-detail-backdrop"
              aria-label="Close apartment details"
              onClick={() => setDetailOpen(false)}
            />

            <aside
              className="home-map-detail-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`home-map-detail-title-${selectedApartment.id}`}
            >
              <div className="home-map-detail-header">
                <div>
                  <p className="section-label">Apartment details</p>
                  <h3 id={`home-map-detail-title-${selectedApartment.id}`}>
                    {selectedDetail?.title ?? selectedApartment.title}
                  </h3>
                  <p>
                    {detailProjectName} · {detailBuildingName}
                  </p>
                </div>

                <button
                  type="button"
                  className="home-map-detail-close"
                  aria-label="Close apartment details"
                  onClick={() => setDetailOpen(false)}
                >
                  Close
                </button>
              </div>

              <div className="home-map-detail-media">
                {detailLeadImage ? (
                  <div className="home-map-detail-media-lead">
                    <img src={detailLeadImage} alt={selectedDetail?.title ?? selectedApartment.title} />
                  </div>
                ) : (
                  <div className="home-map-detail-media-empty">{getInitials(detailProjectName)}</div>
                )}

                {detailImages.length > 1 ? (
                  <div className="home-map-detail-media-strip">
                    {detailImages.slice(0, 4).map((image) => (
                      <div key={image.id} className="home-map-detail-thumb">
                        <img src={image.image_url} alt={selectedDetail?.title ?? selectedApartment.title} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="home-map-detail-price-row">
                <strong>{detailPrice}</strong>
                <span>{formatLabel(selectedDetail?.status ?? selectedApartment.status)}</span>
              </div>

              {detailStatus === "loading" ? (
                <p className="home-map-detail-feedback">Loading the full apartment information…</p>
              ) : null}

              {detailStatus === "error" ? (
                <div className="home-map-detail-feedback home-map-detail-feedback-error">
                  <p>Couldn&apos;t load the rest of the apartment details.</p>
                  <button
                    type="button"
                    className="home-map-inline-button"
                    onClick={() => {
                      loadedDetailSlugRef.current = null;
                      setDetailData(null);
                      setDetailRequestKey((current) => current + 1);
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div className="home-map-detail-grid">
                <div>
                  <span>Developer</span>
                  <strong>{detailCompanyName}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{getLocationLabel(selectedDetail)}</strong>
                </div>
                <div>
                  <span>Rooms</span>
                  <strong>{formatRooms(detailRooms)}</strong>
                </div>
                <div>
                  <span>Size</span>
                  <strong>{detailSize} sqm</strong>
                </div>
                <div>
                  <span>Floor</span>
                  <strong>{selectedDetail?.floor ?? "Not published"}</strong>
                </div>
                <div>
                  <span>Apartment</span>
                  <strong>{selectedDetail?.apartment_number ?? "Not published"}</strong>
                </div>
              </div>

              <div className="home-map-detail-address">
                <span>Address</span>
                <strong>{detailAddress}</strong>
              </div>

              {detailPaymentOptions.length ? (
                <div className="home-map-detail-tags">
                  {detailPaymentOptions.map((option) => (
                    <span key={option.payment_type}>{formatLabel(option.payment_type)}</span>
                  ))}
                </div>
              ) : null}

              <div className="home-map-detail-description">
                <h4>About this apartment</h4>
                <p>{detailDescription}</p>
              </div>

              <div className="home-map-detail-actions">
                <a href={`/apartments/${selectedApartment.slug}`} className="home-map-action-button">
                  Open residence page
                </a>
                <a
                  href={`/projects/${selectedApartment.project_slug}/buildings/${selectedApartment.building_slug}`}
                  className="home-map-inline-button"
                >
                  View building
                </a>
              </div>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
