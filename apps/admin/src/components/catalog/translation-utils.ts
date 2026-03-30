import type { TranslationPayload, TranslatableRecordMeta } from '@/types/api';

type TranslatableRecord = TranslatableRecordMeta & Record<string, unknown>;

export function createEmptyTranslations(fields: string[]): TranslationPayload {
  return Object.fromEntries(fields.map((field) => [field, {}]));
}

export function pickTranslations(record: TranslatableRecord, fields: string[]): TranslationPayload {
  return Object.fromEntries(fields.map((field) => [field, record.translations?.[field] ?? {}]));
}

export function getSourceFieldValue(record: TranslatableRecord, field: string): string {
  const translatedSource = record.translations?.[field]?.[record.source_language];
  if (typeof translatedSource === 'string' && translatedSource.length > 0) {
    return translatedSource;
  }

  const rawValue = record[field];
  return typeof rawValue === 'string' ? rawValue : '';
}

export function updateTranslationValue(
  current: TranslationPayload,
  field: string,
  locale: 'uz' | 'en' | 'ru',
  value: string,
): TranslationPayload {
  return {
    ...current,
    [field]: {
      ...(current[field] ?? {}),
      [locale]: value,
    },
  };
}
