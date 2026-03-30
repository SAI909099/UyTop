"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AdminLanguageSwitcher } from '@/components/layout/admin-language-switcher';
import type { AdminSession } from '@/lib/auth/session';
import { adminDictionary, type LocaleCode } from '@/lib/i18n';
import { classNames } from '@/lib/utils/classnames';

type AdminSidebarProps = {
  session: AdminSession;
  locale: LocaleCode;
};

export function AdminSidebar({ session, locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const dictionary = adminDictionary[locale];
  const links = [
    { href: '/dashboard', label: dictionary.nav.dashboard },
    { href: '/catalog', label: dictionary.nav.catalog },
    { href: '/companies', label: dictionary.nav.companies },
    { href: '/projects', label: dictionary.nav.projects },
    { href: '/buildings', label: dictionary.nav.buildings },
    { href: '/apartments', label: dictionary.nav.apartments },
    { href: '/moderation', label: dictionary.nav.moderation },
    { href: '/users', label: dictionary.nav.users },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-mark">UT</span>
          <div>
            <p>UyTop Admin</p>
            <h2>{dictionary.operations}</h2>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={classNames(
                'admin-sidebar-link',
                (pathname === link.href || pathname.startsWith(`${link.href}/`)) && 'admin-sidebar-link-active',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AdminLanguageSwitcher locale={locale} label={dictionary.languageLabel} />
        <div className="admin-sidebar-session">
          <span>{dictionary.signedInAs}</span>
          <strong>{session.email}</strong>
        </div>
      </div>
    </aside>
  );
}
