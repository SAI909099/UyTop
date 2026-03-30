"use client";

import { useMemo, useState } from 'react';

import { archiveBuilding, createBuilding, restoreBuilding, updateBuilding } from '@/lib/api/catalog';
import { adminDictionary, getBrowserLocale, SUPPORTED_LOCALES, type LocaleCode } from '@/lib/i18n';
import type { CatalogBuilding, ProjectLookupOption, TranslationPayload } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { MediaUploadField } from './media-upload-field';
import { TranslationEditor } from './translation-editor';
import { createEmptyTranslations, getSourceFieldValue, pickTranslations } from './translation-utils';

type BuildingManagerProps = {
  projects: ProjectLookupOption[];
  buildings: CatalogBuilding[];
  statuses: Array<{ value: string; label: string }>;
};

type BuildingFormState = {
  selectedSlug: string;
  source_language: LocaleCode;
  translations: TranslationPayload;
  project_id: string;
  code: string;
  name: string;
  status: string;
  handover: string;
  summary: string;
  total_floors: string;
  total_apartments: string;
  price_from: string;
  price_to: string;
  cover_image_url: string;
  is_active: boolean;
};

const TRANSLATION_FIELDS = [
  { name: 'name', label: 'Building name' },
  { name: 'handover', label: 'Handover' },
  { name: 'summary', label: 'Summary', rows: 5 },
] as const;

function buildEmptyState(): BuildingFormState {
  return {
    selectedSlug: '',
    source_language: 'uz',
    translations: createEmptyTranslations(TRANSLATION_FIELDS.map((field) => field.name)),
    project_id: '',
    code: '',
    name: '',
    status: 'sales_open',
    handover: '',
    summary: '',
    total_floors: '',
    total_apartments: '',
    price_from: '',
    price_to: '',
    cover_image_url: '',
    is_active: true,
  };
}

export function BuildingManager({ projects, buildings, statuses }: BuildingManagerProps) {
  const [items, setItems] = useState(buildings);
  const [form, setForm] = useState<BuildingFormState>(buildEmptyState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dictionary = adminDictionary[getBrowserLocale()];

  const selectedBuilding = useMemo(
    () => items.find((item) => item.slug === form.selectedSlug) ?? null,
    [items, form.selectedSlug],
  );

  function hydrate(building: CatalogBuilding | null) {
    if (!building) {
      setForm(buildEmptyState());
      return;
    }

    setForm({
      selectedSlug: building.slug,
      source_language: building.source_language,
      translations: pickTranslations(building, TRANSLATION_FIELDS.map((field) => field.name)),
      project_id: String(building.project),
      code: building.code,
      name: getSourceFieldValue(building, 'name'),
      status: building.status,
      handover: getSourceFieldValue(building, 'handover'),
      summary: getSourceFieldValue(building, 'summary'),
      total_floors: building.total_floors ? String(building.total_floors) : '',
      total_apartments: String(building.total_apartments),
      price_from: building.price_from,
      price_to: building.price_to,
      cover_image_url: building.cover_image_url ?? '',
      is_active: building.is_active ?? true,
    });
  }

  function upsertBuilding(saved: CatalogBuilding) {
    const nextItems = selectedBuilding
      ? items.map((item) => (item.slug === selectedBuilding.slug ? saved : item))
      : [saved, ...items];
    setItems(nextItems);
    hydrate(saved);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        source_language: form.source_language,
        translations: form.translations,
        project_id: Number(form.project_id),
        code: form.code,
        name: form.name,
        status: form.status,
        handover: form.handover,
        summary: form.summary,
        total_floors: form.total_floors ? Number(form.total_floors) : null,
        total_apartments: Number(form.total_apartments || '0'),
        price_from: form.price_from,
        price_to: form.price_to,
        cover_image_url: form.cover_image_url,
        is_active: form.is_active,
      };

      const saved = selectedBuilding ? await updateBuilding(selectedBuilding.slug, payload) : await createBuilding(payload);
      upsertBuilding(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save building.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveToggle() {
    if (!selectedBuilding) {
      return;
    }

    const nextActiveState = !(selectedBuilding.is_active ?? true);
    const confirmed = window.confirm(
      nextActiveState
        ? `Restore ${selectedBuilding.name} so it becomes active again?`
        : `Archive ${selectedBuilding.name}? Archived buildings stay in admin but disappear from public catalog lists.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const saved = nextActiveState
        ? await restoreBuilding(selectedBuilding.slug)
        : await archiveBuilding(selectedBuilding.slug);
      upsertBuilding(saved);
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Failed to update building status.');
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
              <p className="catalog-eyebrow">Building records</p>
              <h2>Buildings</h2>
            </div>
            <Button type="button" onClick={() => hydrate(null)} style={{ background: 'var(--accent-strong)' }}>
              New building
            </Button>
          </div>

          <div className="catalog-record-list">
            {items.map((building) => (
              <button
                key={building.id}
                type="button"
                className={`catalog-record-item ${form.selectedSlug === building.slug ? 'catalog-record-item-active' : ''}`}
                onClick={() => hydrate(building)}
              >
                <strong>{building.name}</strong>
                <span>
                  {building.code} · {building.translation_state}
                  {building.is_active ? '' : ' · archived'}
                </span>
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
              <h2>{selectedBuilding ? `Edit ${selectedBuilding.name}` : 'New building'}</h2>
            </div>
            {selectedBuilding ? (
              <div className="catalog-inline-actions">
                <Button
                  type="button"
                  onClick={handleArchiveToggle}
                  disabled={saving}
                  style={selectedBuilding.is_active ? { background: 'var(--danger)' } : { background: 'var(--surface-muted)', color: 'var(--text)' }}
                >
                  {selectedBuilding.is_active ? 'Archive building' : 'Restore building'}
                </Button>
              </div>
            ) : null}
          </div>

          {selectedBuilding ? (
            <p className="catalog-status-pill">
              {dictionary.translationState}: {selectedBuilding.translation_state}
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
              <span>Project</span>
              <select value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })} required>
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Building code</span>
              <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Building name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {statuses.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                ))}
              </select>
            </label>
            <label className="catalog-field">
              <span>Handover</span>
              <input value={form.handover} onChange={(event) => setForm({ ...form, handover: event.target.value })} />
            </label>
          </div>

          <label className="catalog-field">
            <span>Summary</span>
            <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={5} />
          </label>

          <div className="catalog-three-column">
            <label className="catalog-field">
              <span>Total floors</span>
              <input value={form.total_floors} onChange={(event) => setForm({ ...form, total_floors: event.target.value })} />
            </label>
            <label className="catalog-field">
              <span>Total apartments</span>
              <input value={form.total_apartments} onChange={(event) => setForm({ ...form, total_apartments: event.target.value })} />
            </label>
            <MediaUploadField
              label="Cover image URL"
              value={form.cover_image_url}
              onChange={(cover_image_url) => setForm((current) => ({ ...current, cover_image_url }))}
              previewLabel={form.name ? `${form.name} cover image` : 'Building cover image'}
              disabled={saving}
            />
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Price from</span>
              <input value={form.price_from} onChange={(event) => setForm({ ...form, price_from: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Price to</span>
              <input value={form.price_to} onChange={(event) => setForm({ ...form, price_to: event.target.value })} required />
            </label>
          </div>

          <TranslationEditor
            title={dictionary.manualTranslations}
            sourceLanguage={form.source_language}
            translations={form.translations}
            fields={TRANSLATION_FIELDS.map((field) => ({ ...field }))}
            onChange={(translations) => setForm({ ...form, translations })}
          />

          <label className="catalog-checkbox-row">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
            Active building
          </label>

          {error ? <p className="catalog-error">{error}</p> : null}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : selectedBuilding ? 'Update building' : 'Create building'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
