"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  LOCALE_COOKIE_NAME,
  type LocaleCode,
  localeLabels,
  replaceLocaleInPath,
  SUPPORTED_LOCALES,
} from '@/lib/i18n';

type HomeLanguageSwitcherProps = {
  locale: LocaleCode;
  label: string;
};

export function HomeLanguageSwitcher({ locale, label }: HomeLanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

    const targetPath = replaceLocaleInPath(pathname || '/', nextLocale as LocaleCode);
    const serializedSearch = searchParams.toString();
    router.replace(serializedSearch ? `${targetPath}?${serializedSearch}` : targetPath);
    router.refresh();
  }

  return (
    <label className="home-language-switcher">
      <span>{label}</span>
      <select value={locale} onChange={(event) => handleChange(event.target.value)}>
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
