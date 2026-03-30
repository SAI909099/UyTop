import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SUPPORTED_LOCALES, isSupportedLocale, type LocaleCode } from '@/lib/i18n';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

const metadataByLocale: Record<LocaleCode, Metadata> = {
  uz: {
    title: 'UyTop',
    description: 'Tasdiqlangan loyihalar, quruvchilar va uylar uchun xarita markazli ko‘chmas mulk platformasi.',
  },
  en: {
    title: 'UyTop',
    description: 'Map-first real estate discovery for verified projects, developers, and residences.',
  },
  ru: {
    title: 'UyTop',
    description: 'Карта-ориентированная платформа недвижимости для проверенных проектов, застройщиков и квартир.',
  },
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<LocaleLayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return metadataByLocale.uz;
  }

  return metadataByLocale[locale];
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return children;
}
