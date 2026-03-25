import Link from 'next/link';

import type { AdminSession } from '@/lib/auth/session';

type AdminSidebarProps = {
  session: AdminSession;
};

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/companies', label: 'Companies' },
  { href: '/projects', label: 'Projects' },
  { href: '/buildings', label: 'Buildings' },
  { href: '/apartments', label: 'Apartments' },
  { href: '/moderation', label: 'Moderation' },
  { href: '/users', label: 'Users' },
];

export function AdminSidebar({ session }: AdminSidebarProps) {
  return (
    <aside
      style={{
        borderRight: '1px solid var(--border)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '32px 24px',
      }}
    >
      <div style={{ display: 'grid', gap: '24px' }}>
        <div>
          <p style={{ margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            UyTop Admin
          </p>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.6rem' }}>Operations and catalog</h2>
        </div>
        <nav style={{ display: 'grid', gap: '8px' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--surface-muted)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', color: 'var(--text-muted)' }}>
          Signed in as {session.email}
        </div>
      </div>
    </aside>
  );
}
