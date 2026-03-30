"use client";

import { useEffect, useRef, useState } from 'react';

import { buildLocalizedPath, type LocaleCode } from '@/lib/i18n';
import { formatCompactCurrency, formatCurrency, formatRooms } from '@/lib/utils/format';
import type { PublicMapApartment } from '@/types/home';

type MapExplorerProps = {
  items: PublicMapApartment[];
  locale: LocaleCode;
  autoLocate?: boolean;
};

type AggregationMode = 'district' | 'radius' | 'exact';
type RoomsFilter = 'all' | '1plus' | '2plus' | '3plus';
type PriceFilter = 'all' | 'under200' | '200to300' | 'over300';
type LocationStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable' | 'unsupported';

type MapViewport = {
  zoom: number;
  north: number;
  south: number;
  east: number;
  west: number;
};

type UserLocation = {
  accuracy: number;
  lat: number;
  lng: number;
};

type NormalizedApartment = PublicMapApartment & {
  lat: number;
  lng: number;
};

type ClusterGroup = {
  count: number;
  items: NormalizedApartment[];
  kind: 'district' | 'radius';
  lat: number;
  lng: number;
  bounds: [number, number][];
  title: string;
};

type LeafletMap = import('leaflet').Map;
type LeafletLayerGroup = import('leaflet').LayerGroup;

type ExplorerCopy = {
  backHome: string;
  searchPlaceholder: string;
  roomsFilter: string;
  priceFilter: string;
  roomsAll: string;
  roomsOnePlus: string;
  roomsTwoPlus: string;
  roomsThreePlus: string;
  priceAll: string;
  priceUnder200: string;
  price200To300: string;
  priceOver300: string;
  showingResults: (visible: number, total: number) => string;
  modeDistrict: string;
  modeRadius: string;
  modeExact: string;
  clearFilters: string;
  resetView: string;
  openResidence: string;
  zoomIn: string;
  zoomOut: string;
  locate: string;
  locating: string;
  location: string;
  noInventoryTitle: string;
  noInventoryCopy: string;
  noFilterResultsTitle: string;
  noFilterResultsCopy: string;
  noViewportResultsTitle: string;
  noViewportResultsCopy: string;
  findingLocation: string;
  showingLocation: string;
  locationDenied: string;
  locationUnavailable: string;
  locationUnsupported: string;
  homesUnit: string;
};

const copyByLocale: Record<LocaleCode, ExplorerCopy> = {
  uz: {
    backHome: 'Bosh sahifa',
    searchPlaceholder: 'Loyiha, uy, manzil yoki developer bo‘yicha qidiring',
    roomsFilter: 'Xonalar',
    priceFilter: 'Narx',
    roomsAll: 'Barchasi',
    roomsOnePlus: '1+ xona',
    roomsTwoPlus: '2+ xona',
    roomsThreePlus: '3+ xona',
    priceAll: 'Barcha narxlar',
    priceUnder200: '$200k gacha',
    price200To300: '$200k–$300k',
    priceOver300: '$300k+',
    showingResults: (visible, total) => `${visible} / ${total} ta natija ko‘rinishda`,
    modeDistrict: 'Hududlar kesimi',
    modeRadius: 'Yaqin guruhlar',
    modeExact: 'Aniq obyektlar',
    clearFilters: 'Tozalash',
    resetView: 'Ko‘rinishni tiklash',
    openResidence: 'Uy sahifasi',
    zoomIn: 'Kattalashtirish',
    zoomOut: 'Kichraytirish',
    locate: 'Menga yaqin',
    locating: 'Aniqlanmoqda',
    location: 'Joylashuv',
    noInventoryTitle: 'Jonli xarita uchun e’lonlar hali yo‘q.',
    noInventoryCopy: 'Ommaviy katalogga uylar chiqarilgach, bu sahifa avtomatik ravishda to‘ladi.',
    noFilterResultsTitle: 'Bu filtrlar bo‘yicha natija topilmadi.',
    noFilterResultsCopy: 'Qidiruv yoki tezkor filtrlarni tozalab, barcha mavjud uylarni ko‘ring.',
    noViewportResultsTitle: 'Joriy xarita ko‘rinishida natija yo‘q.',
    noViewportResultsCopy: 'Xaritani uzoqlashtiring yoki ko‘rinishni tiklash tugmasidan foydalaning.',
    findingLocation: 'Joriy joylashuvingiz aniqlanmoqda…',
    showingLocation: 'Yaqin uylarni ko‘rish uchun joriy joylashuvingiz ko‘rsatildi.',
    locationDenied: 'Brauzerda geolokatsiya ruxsati yopiq. Uni yoqing va yana urinib ko‘ring.',
    locationUnavailable: 'Joylashuvni hozir aniqlab bo‘lmadi. Keyinroq yana urinib ko‘ring.',
    locationUnsupported: 'Bu brauzer geolokatsiyani qo‘llab-quvvatlamaydi.',
    homesUnit: 'uy',
  },
  en: {
    backHome: 'Back home',
    searchPlaceholder: 'Search by project, home, location, or developer',
    roomsFilter: 'Rooms',
    priceFilter: 'Price',
    roomsAll: 'All rooms',
    roomsOnePlus: '1+ rooms',
    roomsTwoPlus: '2+ rooms',
    roomsThreePlus: '3+ rooms',
    priceAll: 'All prices',
    priceUnder200: 'Under $200k',
    price200To300: '$200k–$300k',
    priceOver300: '$300k+',
    showingResults: (visible, total) => `${visible} of ${total} results in view`,
    modeDistrict: 'District totals',
    modeRadius: 'Nearby groups',
    modeExact: 'Exact homes',
    clearFilters: 'Clear',
    resetView: 'Reset view',
    openResidence: 'Open residence',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    locate: 'Near me',
    locating: 'Locating',
    location: 'Location',
    noInventoryTitle: 'No live homes are available on the map yet.',
    noInventoryCopy: 'As soon as public inventory is published, this page will populate automatically.',
    noFilterResultsTitle: 'No homes match the current filters.',
    noFilterResultsCopy: 'Clear the search or quick filters to return to the full live map set.',
    noViewportResultsTitle: 'No homes are visible in the current map view.',
    noViewportResultsCopy: 'Zoom out or reset the map view to bring filtered homes back into frame.',
    findingLocation: 'Finding your current location…',
    showingLocation: 'Showing your location so you can inspect homes nearby.',
    locationDenied: 'Location access is blocked in your browser. Enable it and try again.',
    locationUnavailable: 'Your location could not be detected right now. Try again shortly.',
    locationUnsupported: 'This browser does not support geolocation.',
    homesUnit: 'homes',
  },
  ru: {
    backHome: 'На главную',
    searchPlaceholder: 'Поиск по проекту, квартире, району или застройщику',
    roomsFilter: 'Комнаты',
    priceFilter: 'Цена',
    roomsAll: 'Все комнаты',
    roomsOnePlus: '1+ комнаты',
    roomsTwoPlus: '2+ комнаты',
    roomsThreePlus: '3+ комнаты',
    priceAll: 'Все цены',
    priceUnder200: 'До $200k',
    price200To300: '$200k–$300k',
    priceOver300: '$300k+',
    showingResults: (visible, total) => `${visible} из ${total} объектов в текущем виде`,
    modeDistrict: 'Сводка по районам',
    modeRadius: 'Ближайшие группы',
    modeExact: 'Точные объекты',
    clearFilters: 'Сбросить',
    resetView: 'Сбросить вид',
    openResidence: 'Страница квартиры',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    locate: 'Рядом со мной',
    locating: 'Поиск',
    location: 'Локация',
    noInventoryTitle: 'На карте пока нет живых объектов.',
    noInventoryCopy: 'Когда публичный каталог будет опубликован, эта страница заполнится автоматически.',
    noFilterResultsTitle: 'По текущим фильтрам ничего не найдено.',
    noFilterResultsCopy: 'Сбросьте поиск или быстрые фильтры, чтобы вернуть весь доступный набор объектов.',
    noViewportResultsTitle: 'В текущем виде карты объектов не видно.',
    noViewportResultsCopy: 'Уменьшите масштаб или сбросьте вид карты, чтобы снова увидеть подходящие объекты.',
    findingLocation: 'Определяем ваше местоположение…',
    showingLocation: 'Показываем ваше местоположение, чтобы вы могли смотреть квартиры рядом.',
    locationDenied: 'Доступ к геолокации закрыт в браузере. Включите его и попробуйте снова.',
    locationUnavailable: 'Сейчас не удалось определить ваше местоположение. Попробуйте позже.',
    locationUnsupported: 'Этот браузер не поддерживает геолокацию.',
    homesUnit: 'объектов',
  },
};

const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562];
const DISTRICT_VIEW_MAX_ZOOM = 11;
const EXACT_MARKER_ZOOM_THRESHOLD = 14;
const ROOMS_FILTER_ORDER: RoomsFilter[] = ['all', '1plus', '2plus', '3plus'];
const PRICE_FILTER_ORDER: PriceFilter[] = ['all', 'under200', '200to300', 'over300'];

let leafletPromise: Promise<typeof import('leaflet')> | null = null;

function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = import('leaflet');
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

function getPriceValue(value: string | number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
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
    return 'district';
  }

  if (zoom < EXACT_MARKER_ZOOM_THRESHOLD) {
    return 'radius';
  }

  return 'exact';
}

function getNearbyRadiusMeters(zoom: number) {
  return zoom <= 12 ? 3000 : 2000;
}

function buildClusterGroup(items: NormalizedApartment[], kind: ClusterGroup['kind'], title: string): ClusterGroup {
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
    title,
  };
}

function buildDistrictGroups(items: NormalizedApartment[]) {
  const buckets = new Map<string, { items: NormalizedApartment[]; title: string }>();

  items.forEach((item) => {
    const key = item.district ? `district:${item.district.id}` : `city:${item.city.id}`;
    const title = item.district?.name ?? item.city.name;
    const existing = buckets.get(key);

    if (existing) {
      existing.items.push(item);
      return;
    }

    buckets.set(key, {
      items: [item],
      title,
    });
  });

  return Array.from(buckets.values())
    .map((bucket) => buildClusterGroup(bucket.items, 'district', bucket.title))
    .sort((left, right) => right.count - left.count);
}

function buildRadiusGroups(items: NormalizedApartment[], map: LeafletMap, radiusMeters: number) {
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

    groups.push(buildClusterGroup(grouped, 'radius', `${Math.round(radiusMeters / 1000)} km`));
  }

  return groups.sort((left, right) => right.count - left.count);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createClusterIcon(
  L: typeof import('leaflet'),
  group: ClusterGroup,
  isSelected: boolean,
  copy: ExplorerCopy,
) {
  const label =
    group.kind === 'district' && group.title.length < 18
      ? `${group.title} · ${group.count}`
      : `${group.count} ${copy.homesUnit}`;
  const width = Math.min(176, Math.max(92, 40 + label.length * 8));

  return L.divIcon({
    className: 'map-explorer-marker-shell',
    html: `<span class="map-explorer-cluster-marker${isSelected ? ' is-selected' : ''}">${escapeHtml(label)}</span>`,
    iconSize: [width, 48],
    iconAnchor: [width / 2, 24],
  });
}

function createPropertyIcon(
  L: typeof import('leaflet'),
  apartment: NormalizedApartment,
  isSelected: boolean,
) {
  const priceLabel = escapeHtml(formatCompactCurrency(apartment.price, apartment.currency));
  const width = Math.min(136, Math.max(78, 34 + priceLabel.length * 9));

  return L.divIcon({
    className: 'map-explorer-marker-shell',
    html: `<span class="map-explorer-price-marker${isSelected ? ' is-selected' : ''}">${priceLabel}</span>`,
    iconSize: [width, 48],
    iconAnchor: [width / 2, 24],
  });
}

function getLocationLabel(item: NormalizedApartment) {
  return item.district?.name ?? item.city.name;
}

function getSearchableText(item: NormalizedApartment) {
  return [
    item.title,
    item.project_name,
    item.building_name,
    item.company_name,
    item.city.name,
    item.district?.name ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

function matchesRoomsFilter(item: NormalizedApartment, filter: RoomsFilter) {
  if (filter === 'all') {
    return true;
  }

  if (filter === '1plus') {
    return item.rooms >= 1;
  }

  if (filter === '2plus') {
    return item.rooms >= 2;
  }

  return item.rooms >= 3;
}

function matchesPriceFilter(item: NormalizedApartment, filter: PriceFilter) {
  const price = getPriceValue(item.price);

  if (filter === 'all') {
    return true;
  }

  if (filter === 'under200') {
    return price > 0 && price < 200000;
  }

  if (filter === '200to300') {
    return price >= 200000 && price <= 300000;
  }

  return price > 300000;
}

function getRoomsFilterLabel(copy: ExplorerCopy, filter: RoomsFilter) {
  if (filter === '1plus') {
    return `${copy.roomsFilter}: ${copy.roomsOnePlus}`;
  }

  if (filter === '2plus') {
    return `${copy.roomsFilter}: ${copy.roomsTwoPlus}`;
  }

  if (filter === '3plus') {
    return `${copy.roomsFilter}: ${copy.roomsThreePlus}`;
  }

  return `${copy.roomsFilter}: ${copy.roomsAll}`;
}

function getPriceFilterLabel(copy: ExplorerCopy, filter: PriceFilter) {
  if (filter === 'under200') {
    return `${copy.priceFilter}: ${copy.priceUnder200}`;
  }

  if (filter === '200to300') {
    return `${copy.priceFilter}: ${copy.price200To300}`;
  }

  if (filter === 'over300') {
    return `${copy.priceFilter}: ${copy.priceOver300}`;
  }

  return `${copy.priceFilter}: ${copy.priceAll}`;
}

function getLocationFeedback(status: LocationStatus, copy: ExplorerCopy) {
  if (status === 'requesting') {
    return {
      tone: 'neutral',
      message: copy.findingLocation,
    };
  }

  if (status === 'ready') {
    return {
      tone: 'success',
      message: copy.showingLocation,
    };
  }

  if (status === 'denied') {
    return {
      tone: 'error',
      message: copy.locationDenied,
    };
  }

  if (status === 'unavailable') {
    return {
      tone: 'error',
      message: copy.locationUnavailable,
    };
  }

  if (status === 'unsupported') {
    return {
      tone: 'error',
      message: copy.locationUnsupported,
    };
  }

  return null;
}

export function MapExplorer({ items, locale, autoLocate = false }: MapExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomsFilter, setRoomsFilter] = useState<RoomsFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapViewport, setMapViewport] = useState<MapViewport | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const leafletLibRef = useRef<typeof import('leaflet') | null>(null);
  const markerLayerRef = useRef<LeafletLayerGroup | null>(null);
  const userLocationLayerRef = useRef<LeafletLayerGroup | null>(null);
  const itemRefs = useRef<Record<number, HTMLElement | null>>({});
  const filterSignatureRef = useRef('');
  const autoLocateHandledRef = useRef(false);

  const copy = copyByLocale[locale];
  const homePath = buildLocalizedPath(locale, '/');
  const apartments = normalizeItems(items);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredItems = apartments
    .filter((item) => {
      if (normalizedSearch && !getSearchableText(item).includes(normalizedSearch)) {
        return false;
      }

      if (!matchesRoomsFilter(item, roomsFilter)) {
        return false;
      }

      return matchesPriceFilter(item, priceFilter);
    })
    .sort((left, right) => getPriceValue(left.price) - getPriceValue(right.price));
  const visibleItems = getVisibleItems(filteredItems, mapViewport);
  const listItems = mapViewport ? visibleItems : filteredItems;
  const selectedApartment = filteredItems.find((item) => item.id === selectedId) ?? null;
  const locationFeedback = getLocationFeedback(locationStatus, copy);
  const canLocateUser = true;
  const mapZoom = mapViewport?.zoom ?? DISTRICT_VIEW_MAX_ZOOM;
  const aggregationMode = filteredItems.length > 1 ? getAggregationMode(mapZoom) : 'exact';
  const nearbyRadiusMeters = aggregationMode === 'radius' ? getNearbyRadiusMeters(mapZoom) : null;

  const resetMapView = () => {
    const map = leafletMapRef.current;
    if (!map || !filteredItems.length) {
      return;
    }

    fitMapToApartments(map, filteredItems, 14);
    setMapViewport(getViewport(map));
  };

  const requestUserLocation = () => {
    if (!canLocateUser || typeof window === 'undefined') {
      return;
    }

    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      return;
    }

    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          accuracy: position.coords.accuracy,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('ready');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
          return;
        }

        setLocationStatus('unavailable');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
  };

  const selectApartment = (apartment: NormalizedApartment) => {
    setSelectedId(apartment.id);

    const map = leafletMapRef.current;
    if (!map) {
      return;
    }

    map.setView([apartment.lat, apartment.lng], Math.max(map.getZoom(), EXACT_MARKER_ZOOM_THRESHOLD + 1), {
      animate: true,
    });
    setMapViewport(getViewport(map));
  };

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }

    if (selectedId !== null && !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredItems, selectedId]);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    itemRefs.current[selectedId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [selectedId]);

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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        markerLayerRef.current = L.layerGroup().addTo(map);
        userLocationLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;

        const syncViewport = () => {
          setMapViewport(getViewport(map));
        };

        map.on('moveend zoomend resize', syncViewport);
        detachEvents = () => {
          map.off('moveend zoomend resize', syncViewport);
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
    if (!map) {
      return;
    }

    const nextSignature = `${normalizedSearch}|${roomsFilter}|${priceFilter}|${filteredItems.map((item) => item.id).join(',')}`;
    if (filterSignatureRef.current === nextSignature) {
      return;
    }

    filterSignatureRef.current = nextSignature;

    if (!filteredItems.length) {
      return;
    }

    fitMapToApartments(map, filteredItems, 14);
    setMapViewport(getViewport(map));
  }, [filteredItems, normalizedSearch, roomsFilter, priceFilter]);

  useEffect(() => {
    const L = leafletLibRef.current;
    const map = leafletMapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!L || !map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();

    if (!filteredItems.length) {
      return;
    }

    const renderItems = mapViewport ? visibleItems : filteredItems;

    if (aggregationMode === 'district') {
      buildDistrictGroups(renderItems).forEach((cluster) => {
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: createClusterIcon(L, cluster, cluster.items.some((item) => item.id === selectedId), copy),
        });

        marker.on('click', () => {
          if (cluster.count === 1) {
            selectApartment(cluster.items[0]);
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

    if (aggregationMode === 'radius') {
      buildRadiusGroups(renderItems, map, nearbyRadiusMeters ?? 2000).forEach((cluster) => {
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: createClusterIcon(L, cluster, cluster.items.some((item) => item.id === selectedId), copy),
        });

        marker.on('click', () => {
          if (cluster.count === 1) {
            selectApartment(cluster.items[0]);
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

        marker.on('click', () => {
          selectApartment(apartment);
        });

        marker.addTo(markerLayer);
      });
  }, [aggregationMode, copy, filteredItems, mapViewport, nearbyRadiusMeters, selectedId, visibleItems]);

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
      color: '#f5c044',
      fillColor: '#f5c044',
      fillOpacity: 0.14,
      opacity: 0.3,
      weight: 1,
    }).addTo(userLocationLayer);

    L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 8,
      color: '#0b1120',
      fillColor: '#f5c044',
      fillOpacity: 1,
      weight: 2,
    }).addTo(userLocationLayer);
  }, [userLocation]);

  useEffect(() => {
    const map = leafletMapRef.current;

    if (!mapReady || !map || !userLocation || locationStatus !== 'ready') {
      return;
    }

    map.setView([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 15), {
      animate: true,
    });
    setMapViewport(getViewport(map));
  }, [locationStatus, mapReady, userLocation]);

  useEffect(() => {
    if (!autoLocate || !mapReady || autoLocateHandledRef.current) {
      return;
    }

    autoLocateHandledRef.current = true;
    requestUserLocation();

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('locate');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [autoLocate, mapReady]);

  const hasActiveFilters = Boolean(searchTerm.trim()) || roomsFilter !== 'all' || priceFilter !== 'all';

  return (
    <div className="map-explorer">
      <header className="map-explorer-topbar">
        <a href={homePath} className="map-explorer-brand">
          <span className="map-explorer-brand-mark">UT</span>
          <span>{copy.backHome}</span>
        </a>

        <div className="map-explorer-toolbar">
          <label className="map-explorer-search">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </label>

          <div className="map-explorer-filter-row">
            <button
              type="button"
              className={`map-explorer-filter-button${roomsFilter !== 'all' ? ' is-active' : ''}`}
              onClick={() =>
                setRoomsFilter((current) => ROOMS_FILTER_ORDER[(ROOMS_FILTER_ORDER.indexOf(current) + 1) % ROOMS_FILTER_ORDER.length])
              }
            >
              {getRoomsFilterLabel(copy, roomsFilter)}
            </button>
            <button
              type="button"
              className={`map-explorer-filter-button${priceFilter !== 'all' ? ' is-active' : ''}`}
              onClick={() =>
                setPriceFilter((current) => PRICE_FILTER_ORDER[(PRICE_FILTER_ORDER.indexOf(current) + 1) % PRICE_FILTER_ORDER.length])
              }
            >
              {getPriceFilterLabel(copy, priceFilter)}
            </button>
          </div>
        </div>
      </header>

      <div className="map-explorer-layout">
        <aside className="map-explorer-sidebar">
          <div className="map-explorer-sidebar-head">
            <strong>{copy.showingResults(listItems.length, filteredItems.length)}</strong>
            <div className="map-explorer-sidebar-actions">
              {hasActiveFilters ? (
                <button
                  type="button"
                  className="map-explorer-inline-button"
                  onClick={() => {
                    setSearchTerm('');
                    setRoomsFilter('all');
                    setPriceFilter('all');
                  }}
                >
                  {copy.clearFilters}
                </button>
              ) : null}
              <button type="button" className="map-explorer-inline-button" onClick={resetMapView}>
                {copy.resetView}
              </button>
            </div>
          </div>

          <div className="map-explorer-list">
            {!apartments.length ? (
              <div className="map-explorer-empty-state">
                <h3>{copy.noInventoryTitle}</h3>
                <p>{copy.noInventoryCopy}</p>
              </div>
            ) : null}

            {apartments.length && !filteredItems.length ? (
              <div className="map-explorer-empty-state">
                <h3>{copy.noFilterResultsTitle}</h3>
                <p>{copy.noFilterResultsCopy}</p>
              </div>
            ) : null}

            {filteredItems.length > 0 && !listItems.length ? (
              <div className="map-explorer-empty-state">
                <h3>{copy.noViewportResultsTitle}</h3>
                <p>{copy.noViewportResultsCopy}</p>
              </div>
            ) : null}

            {listItems.map((item) => (
              <article
                key={item.id}
                ref={(node) => {
                  itemRefs.current[item.id] = node;
                }}
                className={`map-explorer-card${item.id === selectedId ? ' is-selected' : ''}`}
              >
                <button type="button" className="map-explorer-card-button" onClick={() => selectApartment(item)}>
                  <div className="map-explorer-card-media">
                    {item.primary_image ? (
                      <img src={item.primary_image} alt={item.title} />
                    ) : (
                      <div className="map-explorer-card-fallback" aria-hidden="true" />
                    )}
                  </div>

                  <div className="map-explorer-card-content">
                    <h3>{item.title}</h3>
                    <p className="map-explorer-card-price">{formatCurrency(item.price, item.currency)}</p>
                    <div className="map-explorer-card-info">
                      <span>{item.project_name}</span>
                      <span>
                        {formatRooms(item.rooms)} · {item.size_sqm} sqm
                      </span>
                      <span>{getLocationLabel(item)}</span>
                    </div>
                  </div>
                </button>

                <div className="map-explorer-card-footer">
                  <a href={buildLocalizedPath(locale, `/apartments/${item.slug}`)}>{copy.openResidence}</a>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <section className="map-explorer-stage">
          <div ref={mapRef} className="map-explorer-map" />

          <div className="map-explorer-stage-pills">
            <span className="map-explorer-stage-pill">
              {aggregationMode === 'district'
                ? copy.modeDistrict
                : aggregationMode === 'radius'
                  ? copy.modeRadius
                  : copy.modeExact}
            </span>
            <span className="map-explorer-stage-pill">{copy.showingResults(visibleItems.length, filteredItems.length)}</span>
          </div>

          <div className="map-explorer-controls">
            <button
              type="button"
              className="map-explorer-control-button"
              aria-label={copy.zoomIn}
              onClick={() => leafletMapRef.current?.zoomIn()}
            >
              +
            </button>
            <button
              type="button"
              className="map-explorer-control-button"
              aria-label={copy.zoomOut}
              onClick={() => leafletMapRef.current?.zoomOut()}
            >
              -
            </button>
            <button type="button" className="map-explorer-control-button" aria-label={copy.resetView} onClick={resetMapView}>
              ⌂
            </button>
            <button
              type="button"
              className="map-explorer-control-button"
              aria-label={copy.locate}
              onClick={requestUserLocation}
              disabled={locationStatus === 'requesting'}
            >
              {locationStatus === 'requesting' ? '…' : '◎'}
            </button>
          </div>

          {locationFeedback ? (
            <div className={`map-explorer-feedback map-explorer-feedback-${locationFeedback.tone}`} aria-live="polite">
              <strong>{copy.location}</strong>
              <p>{locationFeedback.message}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
