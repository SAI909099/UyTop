import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';
import { getAdminSession } from '@/lib/auth/session';
import { getServerLocale } from '@/lib/i18n';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getAdminSession();
  const locale = await getServerLocale();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="admin-shell">
      <AdminSidebar session={session} locale={locale} />
      <div className="admin-shell-main">
        <AdminTopbar session={session} locale={locale} />
        <main className="admin-shell-content">{children}</main>
      </div>
    </div>
  );
}
