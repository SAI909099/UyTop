"use client";

import { useMemo, useState } from 'react';

import { createProject, updateProject } from '@/lib/api/catalog';
import type { CatalogCompany, CatalogProject, LookupOption } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ProjectManagerProps = {
  companies: CatalogCompany[];
  projects: CatalogProject[];
  cities: LookupOption[];
  districts: Array<LookupOption & { city_id: number }>;
};

type ProjectFormState = {
  selectedSlug: string;
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

const emptyState: ProjectFormState = {
  selectedSlug: '',
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

export function ProjectManager({ companies, projects, cities, districts }: ProjectManagerProps) {
  const [items, setItems] = useState(projects);
  const [form, setForm] = useState<ProjectFormState>(emptyState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
      setForm(emptyState);
      return;
    }

    setForm({
      selectedSlug: project.slug,
      company_id: String(project.company),
      name: project.name,
      headline: project.headline ?? '',
      description: project.description ?? '',
      city_id: String(project.city.id),
      district_id: project.district ? String(project.district.id) : '',
      address: project.address ?? '',
      location_label: project.location_label ?? '',
      starting_price: project.starting_price ?? '',
      currency: project.currency ?? 'USD',
      delivery_window: project.delivery_window ?? '',
      hero_image_url: project.hero_image_url ?? '',
      is_active: true,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
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
      const nextItems = selectedProject
        ? items.map((item) => (item.slug === selectedProject.slug ? saved : item))
        : [saved, ...items];
      setItems(nextItems);
      hydrate(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save project.');
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
                <span>{project.location_label}</span>
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
          </div>

          <div className="catalog-two-column">
            <label className="catalog-field">
              <span>Company</span>
              <select value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })} required>
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </label>
            <label className="catalog-field">
              <span>Project name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          </div>

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

          <label className="catalog-field">
            <span>Hero image URL</span>
            <input value={form.hero_image_url} onChange={(event) => setForm({ ...form, hero_image_url: event.target.value })} />
          </label>

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
