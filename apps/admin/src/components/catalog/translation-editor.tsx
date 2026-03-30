"use client";

import { SUPPORTED_LOCALES, localeLabels, type LocaleCode } from '@/lib/i18n';
import type { TranslationPayload } from '@/types/api';

import { updateTranslationValue } from './translation-utils';

type TranslationFieldConfig = {
  name: string;
  label: string;
  rows?: number;
};

type TranslationEditorProps = {
  title: string;
  sourceLanguage: LocaleCode;
  translations: TranslationPayload;
  fields: TranslationFieldConfig[];
  onChange: (translations: TranslationPayload) => void;
};

export function TranslationEditor({
  title,
  sourceLanguage,
  translations,
  fields,
  onChange,
}: TranslationEditorProps) {
  const targetLocales = SUPPORTED_LOCALES.filter((locale) => locale !== sourceLanguage);

  return (
    <section className="catalog-translation-stack">
      <div>
        <p className="catalog-eyebrow">{title}</p>
        <h3 className="catalog-translation-title">English and Russian overrides</h3>
      </div>

      {fields.map((field) => (
        <article key={field.name} className="catalog-translation-card">
          <div className="catalog-translation-card-head">
            <strong>{field.label}</strong>
            <span>Source stays in {localeLabels[sourceLanguage]}</span>
          </div>

          <div className="catalog-translation-grid">
            {targetLocales.map((locale) => {
              const value = translations[field.name]?.[locale] ?? '';

              return (
                <label key={locale} className="catalog-field">
                  <span>{localeLabels[locale]}</span>
                  {field.rows ? (
                    <textarea
                      rows={field.rows}
                      value={value}
                      onChange={(event) =>
                        onChange(updateTranslationValue(translations, field.name, locale, event.target.value))
                      }
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(event) =>
                        onChange(updateTranslationValue(translations, field.name, locale, event.target.value))
                      }
                    />
                  )}
                </label>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
}
