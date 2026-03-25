import { formatCurrency, titleize } from "@/lib/utils/format";
import type { ApartmentMapPreview } from "@/types/developers";

const popupFallbackImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getApartmentPaymentOptionLabels(apartment: ApartmentMapPreview) {
  return apartment.paymentOptions.map((option) => titleize(option.paymentType));
}

export function getApartmentMapPopupMarkup(apartment: ApartmentMapPreview) {
  const paymentOptions = getApartmentPaymentOptionLabels(apartment);
  const paymentChips = paymentOptions.length
    ? `<div class="apartment-map-popup-chip-row">${paymentOptions
        .map((label) => `<span class="apartment-map-popup-chip">${escapeHtml(label)}</span>`)
        .join("")}</div>`
    : "";

  return `
    <article class="apartment-map-popup">
      <img
        class="apartment-map-popup-media"
        src="${escapeHtml(apartment.primaryImage ?? popupFallbackImage)}"
        alt="${escapeHtml(apartment.title)}"
      />
      <div class="apartment-map-popup-body">
        <p class="apartment-map-popup-eyebrow">Apartment preview</p>
        <h3>${escapeHtml(apartment.title)}</h3>
        <strong class="apartment-map-popup-price">${escapeHtml(formatCurrency(apartment.price, apartment.currency))}</strong>
        <p class="apartment-map-popup-context">${escapeHtml(`${apartment.projectName} · ${apartment.buildingName}`)}</p>
        <p class="apartment-map-popup-meta">${escapeHtml(`${apartment.rooms} rooms · ${apartment.sizeSqm} sqm`)}</p>
        ${paymentChips}
        <a class="button button-secondary apartment-map-popup-link" href="/projects/${escapeHtml(apartment.projectSlug)}/buildings/${escapeHtml(apartment.buildingSlug)}">
          Explore details
        </a>
      </div>
    </article>
  `;
}
