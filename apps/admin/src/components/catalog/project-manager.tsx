"use client";

import { useMemo, useState } from 'react';

import { archiveProject, createProject, restoreProject, updateProject } from '@/lib/api/catalog';
import { adminDictionary, getBrowserLocale, SUPPORTED_LOCALES, type LocaleCode } from '@/lib/i18n';
import type { CatalogCompany, CatalogProject, LookupOption, TranslationPayload } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { MediaUploadField } from './media-upload-field';
import { TranslationEditor } from './translation-editor';
import { createEmptyTranslations, getSourceFieldValue, pickTranslations } from './translation-utils';

type ProjectManagerProps = {
  companies: CatalogCompany[];
  projects: CatalogProject[];
  cities: LookupOption[];
  districts: Array<LookupOption & { city_id: number }>;
};

type ProjectFormState = {
  selectedSlug: string;
  source_language: LocaleCode;
  translations: TranslationPayload;
  company_id: string;
  name: string;
  headline: string;
  description: string;
  city_id: string;
  district_id: string;
  address: string;
  location_label: string;
  starting_price: string;
  currency: string;
  delivery_window: string;
  hero_image_url: string;
  is_active: boolean;
};

const TRANSLATION_FIELDS = [
  { name: 'name', label: 'Project name' },
  { name: 'headline', label: 'Headline' },
  { name: 'description', label: 'Description', rows: 5 },
  { name: 'address', label: 'Address' },
  { name: 'location_label', label: 'Location label' },
  { name: 'delivery_window', label: 'Delivery window' },
] as const;

function buildEmptyState(): ProjectFormState {
  return {
    selectedSlug: '',
    source_language: 'uz',
    translations: createEmptyTranslations(TRANSLATION_FIELDS.map((field) => field.name)),
    company_id: '',
    name: '',
    headline: '',
    description: '',
    city_id: '',
    district_id: '',
    address: '',
    location_label: '',
    starting_price: '',
    currency: 'USD',
    delivery_window: '',
    hero_image_url: '',
    is_active: true,
  };
}

export function ProjectManager({ companies, projects, cities, districts }: ProjectManagerProps) {
  const [items, setItems] = useState(projects);
  const [form, setForm] = useState<ProjectFormState>(buildEmptyState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dictionary = adminDictionary[getBrowserLocale()];

  const selectedProject = useMemo(
    () => items.find((item) => item.slug === form.selectedSlug) ?? null,
    [items, form.selectedSlug],
  );

  const districtOptions = useMemo(
    () => districts.filter((district) => String(district.city_id) === form.city_id),
    [districts, form.city_id],
  );

  function hydrate(project: CatalogProject | null) {
    if (!project) {
      setForm(buildEmptyState());
      return;
    }

    setForm({
      selectedSlug: project.slug,
      source_language: project.source_language,
      translations: pickTranslations(project, TRANSLATION_FIELDS.map((field) => field.name)),
      company_id: String(project.company),
      name: getSourceFieldValue(project, 'name'),
      headline: getSourceFieldValue(project, 'headline'),
      description: getSourceFieldValue(project, 'description'),
      city_id: String(project.city.id),
      district_id: project.district ? String(project.district.id) : '',
      address: getSourceFieldValue(project, 'address'),
      location_label: getSourceFieldValue(project, 'location_label'),
      starting_price: project.starting_price ?? '',
      currency: project.currency ?? 'USD',
      delivery_window: getSourceFieldValue(project, 'delivery_window'),
      hero_image_url: project.hero_image_url ?? '',
      is_active: project.is_active ?? true,
    });
  }

  function upsertProject(saved: CatalogProject) {
    const nextItems = selectedProject
      ? items.map((item) => (item.slug === selectedProject.slug ? saved : item))
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
        company_id: Number(form.company_id),
        name: form.name,
        headline: form.headline,
        description: form.description,
        city_id: Number(form.city_id),
        district_id: form.district_id ? Number(form.district_id) : null,
        address: form.address,
        location_label: form.location_label,
        starting_price: form.starting_price,
        currency: form.currency,
        delivery_window: form.delivery_window,
        hero_image_url: form.hero_image_url,
        is_active: form.is_active,
      };

      const saved = selectedProject ? await updateProject(selectedProject.slug, payload) : await createProject(payload);
      upsertProject(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveToggle() {
    if (!selectedProject) {
      return;
    }

    const nextActiveState = !(selectedProject.is_active ?? true);
    const confirmed = window.confirm(
      nextActiveState
        ? `Restore ${selectedProject.name} so it becomes active again?`
        : `Archive ${selectedProject.name}? Archived projects stay available in admin but disappear from public catalog lists.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const saved = nextActiveState
        ? await restoreProject(selectedProject.slug)
        : await archiveProject(selectedProject.slug);
      upsertProject(saved);
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Failed to update project status.');
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
              <p className="catalog-eyebrow">Project records</p>
              <h2>Projects</h2>
            </div>
            <Button type="button" onClick={() => hydrate(null)} style={{ background: 'var(--accent-strong)' }}>
              New project
            </Button>
          </div>

          <div className="catalog-record-list">
            {items.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`catalog-record-item ${form.selectedSlug === project.slug ? 'catalog-record-item-active' : ''}`}
                onClick={() => hydrate(project)}
              >
                <strong>{project.name}</strong>
                <span>
                  {project.location_label} · {project.translation_state}
                  {project.is_active ? '' : ' · archived'}
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
              <h2>{selectedProject ? `Edit ${selectedProject.name}` : 'New project'}</h2>
            </div>
            {selectedProject ? (
              <div className="catalog-inline-actions">
                <Button
                  type="button"
                  onClick={handleArchiveToggle}
                  disabled={saving}
                  style={selectedProject.is_active ? { background: 'var(--danger)' } : { background: 'var(--surface-muted)', color: 'var(--text)' }}
                >
                  {selectedProject.is_active ? 'Archive project' : 'Restore project'}
                </Button>
              </div>
            ) : null}
          </div>

          {selectedProject ? (
            <p className="catalog-status-pill">
              {dictionary.translationState}: {selectedProject.translation_state}
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
              <span>Company</span>
              <select value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })} required>
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                    {company.is_active ? '' : ' (archived)'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="catalog-field">
            <span>Project name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>

          <label className="catalog-field">
            <span>Headline</span>
            <input value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} />
          </label>

          <label className="catalog-field">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} />
          </label>

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

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Address</span>
              <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>
            <label className="catalog-field">
              <span>Location label</span>
              <input value={form.location_label} onChange={(event) => setForm({ ...form, location_label: event.target.value })} />
            </label>
          </div>

          <div className="catalog-three-column">
            <label className="catalog-field">
              <span>Starting price</span>
              <input value={form.starting_price} onChange={(event) => setForm({ ...form, starting_price: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Currency</span>
              <input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} required />
            </label>
            <label className="catalog-field">
              <span>Delivery window</span>
              <input value={form.delivery_window} onChange={(event) => setForm({ ...form, delivery_window: event.target.value })} />
            </label>
          </div>

          <MediaUploadField
            label="Hero image URL"
            value={form.hero_image_url}
            onChange={(hero_image_url) => setForm((current) => ({ ...current, hero_image_url }))}
            previewLabel={form.name ? `${form.name} hero image` : 'Project hero image'}
            disabled={saving}
          />

          <TranslationEditor
            title={dictionary.manualTranslations}
            sourceLanguage={form.source_language}
            translations={form.translations}
            fields={TRANSLATION_FIELDS.map((field) => ({ ...field }))}
            onChange={(translations) => setForm({ ...form, translations })}
          />

          <label className="catalog-checkbox-row">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
            Active project
          </label>

          {error ? <p className="catalog-error">{error}</p> : null}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : selectedProject ? 'Update project' : 'Create project'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
