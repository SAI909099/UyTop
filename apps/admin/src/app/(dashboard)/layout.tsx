import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { getAdminSession } from '@/lib/auth/session';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
      }}
    >
      <AdminSidebar session={session} />
      <main style={{ padding: '32px' }}>{children}</main>
    </div>
  );
}
