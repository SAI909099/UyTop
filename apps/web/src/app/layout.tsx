import 'leaflet/dist/leaflet.css';
import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { getServerLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'UyTop',
  description: 'Premium map-first real estate discovery for verified projects, developers, and residences.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
