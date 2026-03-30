"use client";

import { useMemo, useState } from 'react';

import { archiveCompany, createCompany, restoreCompany, updateCompany } from '@/lib/api/catalog';
import { adminDictionary, getBrowserLocale, SUPPORTED_LOCALES, type LocaleCode } from '@/lib/i18n';
import type { CatalogCompany, TranslationPayload } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { MediaUploadField } from './media-upload-field';
import { TranslationEditor } from './translation-editor';
import { createEmptyTranslations, getSourceFieldValue, pickTranslations } from './translation-utils';

type CompanyManagerProps = {
  companies: CatalogCompany[];
};

type CompanyFormState = {
  selectedSlug: string;
  source_language: LocaleCode;
  translations: TranslationPayload;
  name: string;
  tagline: string;
  short_description: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  founded_year: string;
  headquarters: string;
  trust_note: string;
  is_verified: boolean;
  is_active: boolean;
};

const TRANSLATION_FIELDS = [
  { name: 'name', label: 'Company name' },
  { name: 'tagline', label: 'Tagline' },
  { name: 'short_description', label: 'Short description', rows: 3 },
  { name: 'description', label: 'Full description', rows: 5 },
  { name: 'headquarters', label: 'Headquarters' },
  { name: 'trust_note', label: 'Trust note', rows: 3 },
] as const;

function buildEmptyState(): CompanyFormState {
  return {
    selectedSlug: '',
    source_language: 'uz',
    translations: createEmptyTranslations(TRANSLATION_FIELDS.map((field) => field.name)),
    name: '',
    tagline: '',
    short_description: '',
    description: '',
    logo_url: '',
    hero_image_url: '',
    founded_year: '',
    headquarters: '',
    trust_note: '',
    is_verified: true,
    is_active: true,
  };
}

export function CompanyManager({ companies }: CompanyManagerProps) {
  const [items, setItems] = useState(companies);
  const [form, setForm] = useState<CompanyFormState>(buildEmptyState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dictionary = adminDictionary[getBrowserLocale()];

  const selectedCompany = useMemo(
    () => items.find((item) => item.slug === form.selectedSlug) ?? null,
    [items, form.selectedSlug],
  );

  function hydrate(company: CatalogCompany | null) {
    if (!company) {
      setForm(buildEmptyState());
      return;
    }

    setForm({
      selectedSlug: company.slug,
      source_language: company.source_language,
      translations: pickTranslations(company, TRANSLATION_FIELDS.map((field) => field.name)),
      name: getSourceFieldValue(company, 'name'),
      tagline: getSourceFieldValue(company, 'tagline'),
      short_description: getSourceFieldValue(company, 'short_description'),
      description: getSourceFieldValue(company, 'description'),
      logo_url: company.logo_url ?? '',
      hero_image_url: company.hero_image_url ?? '',
      founded_year: company.founded_year ? String(company.founded_year) : '',
      headquarters: getSourceFieldValue(company, 'headquarters'),
      trust_note: getSourceFieldValue(company, 'trust_note'),
      is_verified: company.is_verified,
      is_active: company.is_active,
    });
  }

  function upsertCompany(saved: CatalogCompany) {
    const nextItems = selectedCompany
      ? items.map((item) => (item.slug === selectedCompany.slug ? saved : item))
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
        name: form.name,
        tagline: form.tagline,
        short_description: form.short_description,
        description: form.description,
        logo_url: form.logo_url,
        hero_image_url: form.hero_image_url,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        headquarters: form.headquarters,
        trust_note: form.trust_note,
        is_verified: form.is_verified,
        is_active: form.is_active,
      };

      const saved = selectedCompany
        ? await updateCompany(selectedCompany.slug, payload)
        : await createCompany(payload);

      upsertCompany(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveToggle() {
    if (!selectedCompany) {
      return;
    }

    const nextActiveState = !selectedCompany.is_active;
    const confirmed = window.confirm(
      nextActiveState
        ? `Restore ${selectedCompany.name} so it becomes active again?`
        : `Archive ${selectedCompany.name}? Archived companies stay in admin but disappear from public catalog lists.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const saved = nextActiveState
        ? await restoreCompany(selectedCompany.slug)
        : await archiveCompany(selectedCompany.slug);
      upsertCompany(saved);
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Failed to update company status.');
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
              <p className="catalog-eyebrow">Company records</p>
              <h2>Companies</h2>
            </div>
            <Button type="button" onClick={() => hydrate(null)} style={{ background: 'var(--accent-strong)' }}>
              New company
            </Button>
          </div>

          <div className="catalog-record-list">
            {items.length ? (
              items.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  className={`catalog-record-item ${form.selectedSlug === company.slug ? 'catalog-record-item-active' : ''}`}
                  onClick={() => hydrate(company)}
                >
                  <strong>{company.name}</strong>
                  <span>
                    {company.project_count ?? 0} projects · {company.translation_state}
                    {company.is_active ? '' : ' · archived'}
                  </span>
                </button>
              ))
            ) : (
              <p className="catalog-empty-state">No companies yet. Create one and it will appear here.</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <form className="catalog-form-grid" onSubmit={handleSubmit}>
          <div className="catalog-panel-head">
            <div>
              <p className="catalog-eyebrow">Create or edit</p>
              <h2>{selectedCompany ? `Edit ${selectedCompany.name}` : 'New company'}</h2>
            </div>
            {selectedCompany ? (
              <div className="catalog-inline-actions">
                <Button
                  type="button"
                  onClick={handleArchiveToggle}
                  disabled={saving}
                  style={selectedCompany.is_active ? { background: 'var(--danger)' } : { background: 'var(--surface-muted)', color: 'var(--text)' }}
                >
                  {selectedCompany.is_active ? 'Archive company' : 'Restore company'}
                </Button>
              </div>
            ) : null}
          </div>

          {selectedCompany ? (
            <p className="catalog-status-pill">
              {dictionary.translationState}: {selectedCompany.translation_state}
            </p>
          ) : null}

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
            <span>Company name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>

          <label className="catalog-field">
            <span>Tagline</span>
            <input value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} />
          </label>

          <label className="catalog-field">
            <span>Short description</span>
            <textarea
              value={form.short_description}
              onChange={(event) => setForm({ ...form, short_description: event.target.value })}
              rows={3}
            />
          </label>

          <label className="catalog-field">
            <span>Full description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} />
          </label>

          <div className="catalog-two-column">
            <MediaUploadField
              label="Logo URL"
              value={form.logo_url}
              onChange={(logo_url) => setForm((current) => ({ ...current, logo_url }))}
              helpText="Used in the homepage developer logo strip under the map."
              previewLabel={form.name || 'Developer logo preview'}
              disabled={saving}
            />
            <MediaUploadField
              label="Hero image URL"
              value={form.hero_image_url}
              onChange={(hero_image_url) => setForm((current) => ({ ...current, hero_image_url }))}
              previewLabel={form.name ? `${form.name} hero image` : 'Company hero image'}
              disabled={saving}
            />
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Founded year</span>
              <input value={form.founded_year} onChange={(event) => setForm({ ...form, founded_year: event.target.value })} />
            </label>
            <label className="catalog-field">
              <span>Headquarters</span>
              <input value={form.headquarters} onChange={(event) => setForm({ ...form, headquarters: event.target.value })} />
            </label>
          </div>

          <label className="catalog-field">
            <span>Trust note</span>
            <textarea value={form.trust_note} onChange={(event) => setForm({ ...form, trust_note: event.target.value })} rows={3} />
          </label>

          <TranslationEditor
            title={dictionary.manualTranslations}
            sourceLanguage={form.source_language}
            translations={form.translations}
            fields={TRANSLATION_FIELDS.map((field) => ({ ...field }))}
            onChange={(translations) => setForm({ ...form, translations })}
          />

          <div className="catalog-checkbox-row">
            <label><input type="checkbox" checked={form.is_verified} onChange={(event) => setForm({ ...form, is_verified: event.target.checked })} /> Verified company</label>
            <label><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label>
          </div>

          {error ? <p className="catalog-error">{error}</p> : null}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : selectedCompany ? 'Update company' : 'Create company'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
