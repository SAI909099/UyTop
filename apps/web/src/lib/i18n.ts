export const SUPPORTED_LOCALES = ['uz', 'en', 'ru'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'uz';
export const LOCALE_COOKIE_NAME = 'uytop_locale';
export const LOCALE_HEADER = 'X-UyTop-Locale';

export function isSupportedLocale(value?: string | null): value is LocaleCode {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as LocaleCode));
}

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

export function getPathLocale(pathname?: string | null): LocaleCode | null {
  if (!pathname) {
    return null;
  }

  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPath(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const locale = getPathLocale(normalizedPath);

  if (!locale) {
    return normalizedPath || '/';
  }

  const segments = normalizedPath.split('/').filter(Boolean).slice(1);
  return segments.length ? `/${segments.join('/')}` : '/';
}

export function buildLocalizedPath(locale: LocaleCode, pathname = '/') {
  const strippedPath = stripLocaleFromPath(pathname);
  return strippedPath === '/' ? `/${locale}` : `/${locale}${strippedPath}`;
}

export function replaceLocaleInPath(pathname: string, locale: LocaleCode) {
  return buildLocalizedPath(locale, pathname);
}

export async function getServerLocale(): Promise<LocaleCode> {
  const { cookies, headers } = await import('next/headers');
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);

  if (headerLocale) {
    return normalizeLocale(headerLocale);
  }

  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export const localeLabels: Record<LocaleCode, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

export const webDictionary: Record<
  LocaleCode,
  {
    brandLine: string;
    nav: {
      map: string;
      projects: string;
      developers: string;
      residences: string;
      cta: string;
      language: string;
    };
  }
> = {
  uz: {
    brandLine: 'Tasavvur va yashash birlashadigan joy',
    nav: {
      map: 'Jonli xarita',
      projects: 'Loyihalar',
      developers: 'Quruvchilar',
      residences: 'Uylar',
      cta: 'Loyihalarni ko‘rish',
      language: 'Til',
    },
  },
  en: {
    brandLine: 'Where vision meets residence',
    nav: {
      map: 'Live map',
      projects: 'Projects',
      developers: 'Developers',
      residences: 'Residences',
      cta: 'Explore launches',
      language: 'Language',
    },
  },
  ru: {
    brandLine: 'Где замысел встречается с жильём',
    nav: {
      map: 'Живая карта',
      projects: 'Проекты',
      developers: 'Застройщики',
      residences: 'Жильё',
      cta: 'Смотреть проекты',
      language: 'Язык',
    },
  },
};
