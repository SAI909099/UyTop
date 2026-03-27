"use client";

import { useMemo, useState } from 'react';

import { createApartment, updateApartment, uploadCatalogImage } from '@/lib/api/catalog';
import type {
  BuildingLookupOption,
  CatalogApartment,
  CatalogImage,
  CatalogImageUpload,
  LookupOption,
  PaymentOptionLookup,
} from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { GoogleMapPicker } from './google-map-picker';

type ApartmentManagerProps = {
  apartments: CatalogApartment[];
  buildings: BuildingLookupOption[];
  cities: LookupOption[];
  districts: Array<LookupOption & { city_id: number }>;
  paymentOptions: PaymentOptionLookup[];
  statuses: PaymentOptionLookup[];
};

type ApartmentFormState = {
  selectedSlug: string;
  building_id: string;
  title: string;
  apartment_number: string;
  description: string;
  status: string;
  is_public: boolean;
  price: string;
  currency: string;
  rooms: string;
  size_sqm: string;
  floor: string;
  address: string;
  city_id: string;
  district_id: string;
  latitude: string;
  longitude: string;
  image_urls_text: string;
  uploaded_images: CatalogImage[];
  selected_payment_types: Record<string, boolean>;
  payment_options: Record<string, string>;
};

type FileUploadState = {
  files: File[];
};

function buildEmptyPaymentState(options: PaymentOptionLookup[]) {
  return Object.fromEntries(options.map((option) => [option.value, '']));
}

function buildEmptyPaymentSelection(options: PaymentOptionLookup[]) {
  return Object.fromEntries(options.map((option) => [option.value, false]));
}

function buildPaymentState(options: PaymentOptionLookup[], apartment: CatalogApartment | null) {
  const base = buildEmptyPaymentState(options);
  if (!apartment) {
    return base;
  }

  for (const option of apartment.payment_options) {
    base[option.payment_type] = option.notes ?? '';
  }
  return base;
}

function buildPaymentSelection(options: PaymentOptionLookup[], apartment: CatalogApartment | null) {
  const base = buildEmptyPaymentSelection(options);
  if (!apartment) {
    return base;
  }

  for (const option of apartment.payment_options) {
    base[option.payment_type] = true;
  }
  return base;
}

export function ApartmentManager({
  apartments,
  buildings,
  cities,
  districts,
  paymentOptions,
  statuses,
}: ApartmentManagerProps) {
  const [items, setItems] = useState(apartments);
  const [files, setFiles] = useState<FileUploadState>({ files: [] });
  const [form, setForm] = useState<ApartmentFormState>({
    selectedSlug: '',
    building_id: '',
    title: '',
    apartment_number: '',
    description: '',
    status: 'draft',
    is_public: false,
    price: '',
    currency: 'USD',
    rooms: '',
    size_sqm: '',
    floor: '',
    address: '',
    city_id: '',
    district_id: '',
    latitude: '41.311081',
    longitude: '69.240562',
    image_urls_text: '',
    uploaded_images: [],
    selected_payment_types: buildEmptyPaymentSelection(paymentOptions),
    payment_options: buildEmptyPaymentState(paymentOptions),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedApartment = useMemo(
    () => items.find((item) => item.slug === form.selectedSlug) ?? null,
    [items, form.selectedSlug],
  );

  const districtOptions = useMemo(
    () => districts.filter((district) => String(district.city_id) === form.city_id),
    [districts, form.city_id],
  );

  function hydrate(apartment: CatalogApartment | null) {
    if (!apartment) {
      setForm({
        selectedSlug: '',
        building_id: '',
        title: '',
        apartment_number: '',
        description: '',
        status: 'draft',
        is_public: false,
        price: '',
        currency: 'USD',
        rooms: '',
        size_sqm: '',
        floor: '',
        address: '',
        city_id: '',
        district_id: '',
        latitude: '41.311081',
        longitude: '69.240562',
        image_urls_text: '',
        uploaded_images: [],
        selected_payment_types: buildEmptyPaymentSelection(paymentOptions),
        payment_options: buildEmptyPaymentState(paymentOptions),
      });
      setFiles({ files: [] });
      return;
    }

    const nonUploadedUrls = (apartment.images ?? [])
      .filter((image) => !image.storage_key)
      .map((image) => image.image_url)
      .join('\n');

    setForm({
      selectedSlug: apartment.slug,
      building_id: String(apartment.building),
      title: apartment.title,
      apartment_number: apartment.apartment_number,
      description: apartment.description ?? '',
      status: apartment.status,
      is_public: apartment.is_public,
      price: apartment.price,
      currency: apartment.currency,
      rooms: String(apartment.rooms),
      size_sqm: apartment.size_sqm,
      floor: String(apartment.floor),
      address: apartment.address,
      city_id: String(apartment.city.id),
      district_id: apartment.district ? String(apartment.district.id) : '',
      latitude: apartment.latitude,
      longitude: apartment.longitude,
      image_urls_text: nonUploadedUrls,
      uploaded_images: (apartment.images ?? []).filter((image) => image.storage_key),
      selected_payment_types: buildPaymentSelection(paymentOptions, apartment),
      payment_options: buildPaymentState(paymentOptions, apartment),
    });
    setFiles({ files: [] });
  }

  async function uploadSelectedFiles() {
    const uploaded: CatalogImageUpload[] = [];
    for (const file of files.files) {
      uploaded.push(await uploadCatalogImage(file));
    }
    return uploaded;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const uploaded = await uploadSelectedFiles();
      const payment_payload = paymentOptions
        .filter((option) => form.selected_payment_types[option.value])
        .map((option) => ({
          payment_type: option.value,
          notes: form.payment_options[option.value],
        }));

      const manualUrls = form.image_urls_text
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean);

      const payload = {
        building_id: Number(form.building_id),
        title: form.title,
        apartment_number: form.apartment_number,
        description: form.description,
        status: form.status,
        is_public: form.is_public,
        price: form.price,
        currency: form.currency,
        rooms: Number(form.rooms),
        size_sqm: form.size_sqm,
        floor: Number(form.floor),
        address: form.address,
        city_id: Number(form.city_id),
        district_id: form.district_id ? Number(form.district_id) : null,
        latitude: form.latitude,
        longitude: form.longitude,
        image_urls: manualUrls,
        uploaded_images: [...form.uploaded_images, ...uploaded],
        payment_options: payment_payload,
      };

      const saved = selectedApartment
        ? await updateApartment(selectedApartment.slug, payload)
        : await createApartment(payload);

      const nextItems = selectedApartment
        ? items.map((item) => (item.slug === selectedApartment.slug ? saved : item))
        : [saved, ...items];
      setItems(nextItems);
      hydrate(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save apartment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="catalog-manager-grid">
      <Card>
        <div className="catalog-list-panel">
          <div className="catalog-panel-head">
            <div>
              <p className="catalog-eyebrow">Apartment records</p>
              <h2>Apartments</h2>
            </div>
            <Button type="button" onClick={() => hydrate(null)} style={{ background: 'var(--accent-strong)' }}>
              New apartment
            </Button>
          </div>

          <div className="catalog-record-list">
            {items.map((apartment) => (
              <button
                key={apartment.id}
                type="button"
                className={`catalog-record-item ${form.selectedSlug === apartment.slug ? 'catalog-record-item-active' : ''}`}
                onClick={() => hydrate(apartment)}
              >
                <strong>{apartment.title}</strong>
                <span>{apartment.building_name ?? apartment.apartment_number} · {apartment.price} {apartment.currency}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <form className="catalog-form-grid" onSubmit={handleSubmit}>
          <div className="catalog-panel-head">
            <div>
              <p className="catalog-eyebrow">Create or edit</p>
              <h2>{selectedApartment ? `Edit ${selectedApartment.title}` : 'New apartment'}</h2>
            </div>
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Building</span>
              <select value={form.building_id} onChange={(event) => setForm({ ...form, building_id: event.target.value })} required>
                <option value="">Select building</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.code} · {building.name}</option>
                ))}
              </select>
            </label>
            <label className="catalog-field">
              <span>Apartment title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>
          </div>

          <div className="catalog-three-column">
            <label className="catalog-field">
              <span>Apartment number</span>
              <input value={form.apartment_number} onChange={(event) => setForm({ ...form, apartment_number: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Floor</span>
              <input value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {statuses.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="catalog-field">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} />
          </label>

          <div className="catalog-four-column">
            <label className="catalog-field">
              <span>Price</span>
              <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Currency</span>
              <input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Rooms</span>
              <input value={form.rooms} onChange={(event) => setForm({ ...form, rooms: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Square meter</span>
              <input value={form.size_sqm} onChange={(event) => setForm({ ...form, size_sqm: event.target.value })} required />
            </label>
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>City</span>
              <select value={form.city_id} onChange={(event) => setForm({ ...form, city_id: event.target.value, district_id: '' })} required>
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </label>
            <label className="catalog-field">
              <span>District</span>
              <select value={form.district_id} onChange={(event) => setForm({ ...form, district_id: event.target.value })}>
                <option value="">Select district</option>
                {districtOptions.map((district) => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="catalog-field">
            <span>Address</span>
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
          </label>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Latitude</span>
              <input value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Longitude</span>
              <input value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} required />
            </label>
          </div>

          <GoogleMapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={({ latitude, longitude }) => setForm({ ...form, latitude, longitude })}
          />

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Image URLs</span>
              <textarea
                value={form.image_urls_text}
                onChange={(event) => setForm({ ...form, image_urls_text: event.target.value })}
                rows={5}
                placeholder="One image URL per line"
              />
            </label>
            <label className="catalog-field">
              <span>Upload image files</span>
              <input
                type="file"
                multiple
                onChange={(event) => setFiles({ files: Array.from(event.target.files ?? []) })}
              />
              <small>{files.files.length} file(s) selected for upload</small>
              {form.uploaded_images.length > 0 ? (
                <small>{form.uploaded_images.length} stored uploaded image(s) will be kept.</small>
              ) : null}
            </label>
          </div>

          <div className="catalog-payment-grid">
            {paymentOptions.map((option) => (
              <div key={option.value} className="catalog-payment-card">
                <label className="catalog-checkbox-inline">
                  <input
                    type="checkbox"
                    checked={form.selected_payment_types[option.value] ?? false}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        selected_payment_types: {
                          ...form.selected_payment_types,
                          [option.value]: event.target.checked,
                        },
                      })
                    }
                  />
                  {option.label}
                </label>
                <input
                  value={form.payment_options[option.value] ?? ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      payment_options: {
                        ...form.payment_options,
                        [option.value]: event.target.value,
                      },
                    })
                  }
                  placeholder={`Optional ${option.label.toLowerCase()} note`}
                  disabled={!form.selected_payment_types[option.value]}
                />
              </div>
            ))}
          </div>

          <label className="catalog-checkbox-row">
            <input type="checkbox" checked={form.is_public} onChange={(event) => setForm({ ...form, is_public: event.target.checked })} />
            Expose through public catalog APIs
          </label>

          {error ? <p className="catalog-error">{error}</p> : null}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : selectedApartment ? 'Update apartment' : 'Create apartment'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
