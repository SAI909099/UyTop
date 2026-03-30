"use client";

import { usePathname } from 'next/navigation';

import type { AdminSession } from '@/lib/auth/session';
import { adminDictionary, type LocaleCode } from '@/lib/i18n';

type AdminTopbarProps = {
  session: AdminSession;
  locale: LocaleCode;
};

const topbarCopy: Record<LocaleCode, { brand: string; live: string }> = {
  uz: {
    brand: 'UyTop Admin',
    live: 'Jonli katalog',
  },
  en: {
    brand: 'UyTop Admin',
    live: 'Live catalog',
  },
  ru: {
    brand: 'UyTop Admin',
    live: 'Живой каталог',
  },
};

const routeKeys = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/catalog', key: 'catalog' },
  { href: '/companies', key: 'companies' },
  { href: '/projects', key: 'projects' },
  { href: '/buildings', key: 'buildings' },
  { href: '/apartments', key: 'apartments' },
  { href: '/moderation', key: 'moderation' },
  { href: '/users', key: 'users' },
] as const;

export function AdminTopbar({ session, locale }: AdminTopbarProps) {
  const pathname = usePathname();
  const dictionary = adminDictionary[locale];
  const copy = topbarCopy[locale];
  const activeItem =
    routeKeys.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? routeKeys[0];
  const activeLabel = dictionary.nav[activeItem.key];

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-copy">
        <span>{copy.brand}</span>
        <strong>{activeLabel}</strong>
      </div>

      <div className="admin-topbar-meta">
        <span className="admin-topbar-status">{copy.live}</span>
        <span className="admin-topbar-user">{session.email}</span>
      </div>
    </header>
  );
}
