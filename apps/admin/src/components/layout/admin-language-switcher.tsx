"use client";

import { useRouter } from 'next/navigation';

import { LOCALE_COOKIE_NAME, type LocaleCode, localeLabels, SUPPORTED_LOCALES } from '@/lib/i18n';

type AdminLanguageSwitcherProps = {
  locale: LocaleCode;
  label: string;
};

export function AdminLanguageSwitcher({ locale, label }: AdminLanguageSwitcherProps) {
  const router = useRouter();

  function handleChange(nextLocale: string) {
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="admin-locale-switcher">
      <span>{label}</span>
      <select value={locale} onChange={(event) => handleChange(event.target.value)} className="admin-locale-select">
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
