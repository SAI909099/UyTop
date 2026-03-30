export const SUPPORTED_LOCALES = ['uz', 'en', 'ru'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'uz';
export const LOCALE_COOKIE_NAME = 'uytop_locale';
export const LOCALE_HEADER = 'X-UyTop-Locale';

export function normalizeLocale(value?: string | null): LocaleCode {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const normalized = value.trim().toLowerCase().replace('_', '-');
  if (SUPPORTED_LOCALES.includes(normalized as LocaleCode)) {
    return normalized as LocaleCode;
  }

  const short = normalized.split('-', 1)[0];
  return SUPPORTED_LOCALES.includes(short as LocaleCode) ? (short as LocaleCode) : DEFAULT_LOCALE;
}

export async function getServerLocale(): Promise<LocaleCode> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export function getBrowserLocale(): LocaleCode {
  if (typeof document === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const value = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return normalizeLocale(value ? decodeURIComponent(value) : '');
}

export const localeLabels: Record<LocaleCode, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

export const adminDictionary: Record<
  LocaleCode,
  {
    operations: string;
    signedInAs: string;
    languageLabel: string;
    sourceLanguage: string;
    manualTranslations: string;
    translationState: string;
    nav: {
      dashboard: string;
      catalog: string;
      companies: string;
      projects: string;
      buildings: string;
      apartments: string;
      moderation: string;
      users: string;
    };
  }
> = {
  uz: {
    operations: 'Operatsiyalar va katalog',
    signedInAs: 'Kirish qilgan foydalanuvchi',
    languageLabel: 'Til',
    sourceLanguage: 'Asosiy til',
    manualTranslations: 'Qo‘lda tarjimalar',
    translationState: 'Tarjima holati',
    nav: {
      dashboard: 'Boshqaruv',
      catalog: 'Katalog',
      companies: 'Kompaniyalar',
      projects: 'Loyihalar',
      buildings: 'Binolar',
      apartments: 'Kvartiralar',
      moderation: 'Moderatsiya',
      users: 'Foydalanuvchilar',
    },
  },
  en: {
    operations: 'Operations and catalog',
    signedInAs: 'Signed in as',
    languageLabel: 'Language',
    sourceLanguage: 'Source language',
    manualTranslations: 'Manual translations',
    translationState: 'Translation state',
    nav: {
      dashboard: 'Dashboard',
      catalog: 'Catalog',
      companies: 'Companies',
      projects: 'Projects',
      buildings: 'Buildings',
      apartments: 'Apartments',
      moderation: 'Moderation',
      users: 'Users',
    },
  },
  ru: {
    operations: 'Операции и каталог',
    signedInAs: 'Вход выполнен как',
    languageLabel: 'Язык',
    sourceLanguage: 'Исходный язык',
    manualTranslations: 'Ручные переводы',
    translationState: 'Статус перевода',
    nav: {
      dashboard: 'Панель',
      catalog: 'Каталог',
      companies: 'Компании',
      projects: 'Проекты',
      buildings: 'Корпуса',
      apartments: 'Квартиры',
      moderation: 'Модерация',
      users: 'Пользователи',
    },
  },
};
