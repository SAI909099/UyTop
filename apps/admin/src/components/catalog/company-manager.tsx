"use client";

import { useMemo, useState } from 'react';

import { createCompany, updateCompany } from '@/lib/api/catalog';
import type { CatalogCompany } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type CompanyManagerProps = {
  companies: CatalogCompany[];
};

type CompanyFormState = {
  selectedSlug: string;
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

const emptyState: CompanyFormState = {
  selectedSlug: '',
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

export function CompanyManager({ companies }: CompanyManagerProps) {
  const [items, setItems] = useState(companies);
  const [form, setForm] = useState<CompanyFormState>(emptyState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCompany = useMemo(
    () => items.find((item) => item.slug === form.selectedSlug) ?? null,
    [items, form.selectedSlug],
  );

  function hydrate(company: CatalogCompany | null) {
    if (!company) {
      setForm(emptyState);
      return;
    }

    setForm({
      selectedSlug: company.slug,
      name: company.name,
      tagline: company.tagline ?? '',
      short_description: company.short_description ?? '',
      description: company.description ?? '',
      logo_url: company.logo_url ?? '',
      hero_image_url: company.hero_image_url ?? '',
      founded_year: company.founded_year ? String(company.founded_year) : '',
      headquarters: company.headquarters ?? '',
      trust_note: company.trust_note ?? '',
      is_verified: company.is_verified,
      is_active: company.is_active,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
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

      const nextItems = selectedCompany
        ? items.map((item) => (item.slug === selectedCompany.slug ? saved : item))
        : [saved, ...items];
      setItems(nextItems);
      hydrate(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save company.');
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
                  <span>{company.project_count ?? 0} projects</span>
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
          </div>

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
            <textarea value={form.short_description} onChange={(event) => setForm({ ...form, short_description: event.target.value })} rows={3} />
          </label>

          <label className="catalog-field">
            <span>Full description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} />
          </label>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Logo URL</span>
              <input value={form.logo_url} onChange={(event) => setForm({ ...form, logo_url: event.target.value })} />
            </label>
            <label className="catalog-field">
              <span>Hero image URL</span>
              <input value={form.hero_image_url} onChange={(event) => setForm({ ...form, hero_image_url: event.target.value })} />
            </label>
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
