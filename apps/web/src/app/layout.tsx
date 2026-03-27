import 'leaflet/dist/leaflet.css';
import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'UyTop',
  description: 'Premium map-first real estate discovery for verified projects, developers, and residences.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
