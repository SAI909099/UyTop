"use client";

import { useEffect, useMemo, useState } from 'react';

import { createApartment, deleteApartment, updateApartment, uploadCatalogImage } from '@/lib/api/catalog';
import { adminDictionary, getBrowserLocale, SUPPORTED_LOCALES, type LocaleCode } from '@/lib/i18n';
import type {
  BuildingLookupOption,
  CatalogApartment,
  CatalogImage,
  CatalogImageUpload,
  LookupOption,
  PaymentOptionLookup,
  TranslationPayload,
} from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { GoogleMapPicker } from './google-map-picker';
import { TranslationEditor } from './translation-editor';
import { createEmptyTranslations, getSourceFieldValue, pickTranslations } from './translation-utils';

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
  source_language: LocaleCode;
  translations: TranslationPayload;
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

const TRANSLATION_FIELDS = [
  { name: 'title', label: 'Apartment title' },
  { name: 'description', label: 'Description', rows: 4 },
  { name: 'address', label: 'Address' },
] as const;

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

function buildEmptyState(paymentOptions: PaymentOptionLookup[]): ApartmentFormState {
  return {
    selectedSlug: '',
    source_language: 'uz',
    translations: createEmptyTranslations(TRANSLATION_FIELDS.map((field) => field.name)),
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
  };
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
  const [form, setForm] = useState<ApartmentFormState>(() => buildEmptyState(paymentOptions));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dictionary = adminDictionary[getBrowserLocale()];

  const selectedApartment = useMemo(
    () => items.find((item) => item.slug === form.selectedSlug) ?? null,
    [items, form.selectedSlug],
  );

  const districtOptions = useMemo(
    () => districts.filter((district) => String(district.city_id) === form.city_id),
    [districts, form.city_id],
  );

  const manualImageUrls = useMemo(
    () =>
      form.image_urls_text
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
    [form.image_urls_text],
  );

  const pendingFilePreviews = useMemo(
    () =>
      files.files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files.files],
  );

  useEffect(() => {
    return () => {
      for (const preview of pendingFilePreviews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [pendingFilePreviews]);

  function hydrate(apartment: CatalogApartment | null) {
    if (!apartment) {
      setForm(buildEmptyState(paymentOptions));
      setFiles({ files: [] });
      return;
    }

    const nonUploadedUrls = (apartment.images ?? [])
      .filter((image) => !image.storage_key)
      .map((image) => image.image_url)
      .join('\n');

    setForm({
      selectedSlug: apartment.slug,
      source_language: apartment.source_language,
      translations: pickTranslations(apartment, TRANSLATION_FIELDS.map((field) => field.name)),
      building_id: String(apartment.building),
      title: getSourceFieldValue(apartment, 'title'),
      apartment_number: apartment.apartment_number,
      description: getSourceFieldValue(apartment, 'description'),
      status: apartment.status,
      is_public: apartment.is_public,
      price: apartment.price,
      currency: apartment.currency,
      rooms: String(apartment.rooms),
      size_sqm: apartment.size_sqm,
      floor: String(apartment.floor),
      address: getSourceFieldValue(apartment, 'address'),
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

  function upsertApartment(saved: CatalogApartment) {
    const nextItems = selectedApartment
      ? items.map((item) => (item.slug === selectedApartment.slug ? saved : item))
      : [saved, ...items];
    setItems(nextItems);
    hydrate(saved);
  }

  function removePendingFile(index: number) {
    setFiles(({ files: currentFiles }) => ({
      files: currentFiles.filter((_, fileIndex) => fileIndex !== index),
    }));
  }

  function removeUploadedImage(index: number) {
    setForm((current) => ({
      ...current,
      uploaded_images: current.uploaded_images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  function removeManualImage(index: number) {
    setForm((current) => {
      const nextUrls = current.image_urls_text
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((_, urlIndex) => urlIndex !== index);
      return {
        ...current,
        image_urls_text: nextUrls.join('\n'),
      };
    });
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
        source_language: form.source_language,
        translations: form.translations,
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

      upsertApartment(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save apartment.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedApartment) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedApartment.title}? This permanently removes the apartment and its images.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await deleteApartment(selectedApartment.slug);
      setItems(items.filter((item) => item.slug !== selectedApartment.slug));
      hydrate(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete apartment.');
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
                <span>{apartment.building_name ?? apartment.apartment_number} · {apartment.translation_state}</span>
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
            {selectedApartment ? (
              <div className="catalog-inline-actions">
                <Button type="button" onClick={handleDelete} disabled={saving} style={{ background: 'var(--danger)', color: '#fff' }}>
                  Delete apartment
                </Button>
              </div>
            ) : null}
          </div>

          {selectedApartment ? (
            <p className="catalog-status-pill">
              {dictionary.translationState}: {selectedApartment.translation_state}
            </p>
          ) : null}

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>{dictionary.sourceLanguage}</span>
              <select
                value={form.source_language}
                onChange={(event) => setForm({ ...form, source_language: event.target.value as LocaleCode })}
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale}
                  </option>
                ))}
              </select>
            </label>
            <label className="catalog-field">
              <span>Building</span>
              <select value={form.building_id} onChange={(event) => setForm({ ...form, building_id: event.target.value })} required>
                <option value="">Select building</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.code} · {building.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="catalog-three-column">
            <label className="catalog-field">
              <span>Apartment title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Apartment number</span>
              <input value={form.apartment_number} onChange={(event) => setForm({ ...form, apartment_number: event.target.value })} required />
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

          <div className="catalog-three-column">
            <label className="catalog-field">
              <span>Floor</span>
              <input value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Price</span>
              <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Currency</span>
              <input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} required />
            </label>
          </div>

          <label className="catalog-field">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} />
          </label>

          <div className="catalog-four-column">
            <label className="catalog-field">
              <span>Rooms</span>
              <input value={form.rooms} onChange={(event) => setForm({ ...form, rooms: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Square meter</span>
              <input value={form.size_sqm} onChange={(event) => setForm({ ...form, size_sqm: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Latitude</span>
              <input value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Longitude</span>
              <input value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} required />
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
                accept="image/*"
                onChange={(event) => setFiles({ files: Array.from(event.target.files ?? []) })}
              />
              <small>{files.files.length} file(s) selected for upload</small>
              {form.uploaded_images.length > 0 ? (
                <small>{form.uploaded_images.length} stored uploaded image(s) will be kept.</small>
              ) : null}
            </label>
          </div>

          {form.uploaded_images.length || pendingFilePreviews.length || manualImageUrls.length ? (
            <div className="catalog-form-grid">
              <p className="catalog-field-help">
                Saved order is existing uploaded images, then new file uploads, then manual URLs. The first saved image becomes the primary image.
              </p>

              {form.uploaded_images.length ? (
                <div className="catalog-media-grid">
                  {form.uploaded_images.map((image, index) => (
                    <div key={`${image.image_url}-${index}`} className="catalog-media-card">
                      <img src={image.image_url} alt={`Stored apartment image ${index + 1}`} />
                      <div className="catalog-media-card-copy">
                        <strong>{index === 0 ? 'Current primary image' : `Stored image ${index + 1}`}</strong>
                        <span>{image.image_url}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeUploadedImage(index)}
                        style={{ background: 'var(--surface-muted)', color: 'var(--text)' }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}

              {pendingFilePreviews.length ? (
                <div className="catalog-media-grid">
                  {pendingFilePreviews.map((file, index) => (
                    <div key={file.id} className="catalog-media-card">
                      <img src={file.url} alt={file.name} />
                      <div className="catalog-media-card-copy">
                        <strong>{file.name}</strong>
                        <span>Uploads when you save</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removePendingFile(index)}
                        style={{ background: 'var(--surface-muted)', color: 'var(--text)' }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}

              {manualImageUrls.length ? (
                <div className="catalog-media-grid">
                  {manualImageUrls.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="catalog-media-card">
                      <img src={imageUrl} alt={`Manual apartment image ${index + 1}`} />
                      <div className="catalog-media-card-copy">
                        <strong>{`Manual URL ${index + 1}`}</strong>
                        <span>{imageUrl}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeManualImage(index)}
                        style={{ background: 'var(--surface-muted)', color: 'var(--text)' }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <TranslationEditor
            title={dictionary.manualTranslations}
            sourceLanguage={form.source_language}
            translations={form.translations}
            fields={TRANSLATION_FIELDS.map((field) => ({ ...field }))}
            onChange={(translations) => setForm({ ...form, translations })}
          />

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
