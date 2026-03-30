"use client";

import { useState } from 'react';

import { uploadCatalogImage } from '@/lib/api/catalog';

import { Button } from '@/components/ui/button';

type MediaUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  previewLabel: string;
  helpText?: string;
  disabled?: boolean;
};

export function MediaUploadField({
  label,
  value,
  onChange,
  previewLabel,
  helpText,
  disabled = false,
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploaded = await uploadCatalogImage(file);
      onChange(uploaded.image_url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="catalog-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled || uploading} />
      {helpText ? <small className="catalog-field-help">{helpText}</small> : null}

      <div className="catalog-inline-actions">
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={disabled || uploading} />
        {value ? (
          <Button type="button" onClick={() => onChange('')} disabled={disabled || uploading} style={{ background: 'var(--surface-muted)', color: 'var(--text)' }}>
            Clear image
          </Button>
        ) : null}
      </div>

      {uploading ? <small className="catalog-field-help">Uploading image...</small> : null}
      {error ? <small className="catalog-error">{error}</small> : null}

      {value ? (
        <div className="catalog-media-preview">
          <img src={value} alt={previewLabel} />
          <div className="catalog-media-preview-copy">
            <strong>{previewLabel}</strong>
            <span>{value}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
