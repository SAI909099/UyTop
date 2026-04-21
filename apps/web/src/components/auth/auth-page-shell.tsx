import type { ReactNode } from 'react';

import { authDictionary, type LocaleCode } from '@/lib/i18n';

import { HomePrimaryNav } from '../home/home-nav';

type AuthPageShellProps = {
  locale: LocaleCode;
  mode: 'login' | 'register';
  children: ReactNode;
};

export async function AuthPageShell({ locale, mode, children }: AuthPageShellProps) {
  const copy = authDictionary[locale];
  const sectionCopy = copy[mode];

  return (
    <main className="auth-page">
      <HomePrimaryNav locale={locale} />

      <section className="auth-stage">
        <div className="site-shell auth-grid">
          <div className="auth-copy-panel">
            <p className="auth-eyebrow">{sectionCopy.pageEyebrow}</p>
            <h1 className="auth-title">{sectionCopy.title}</h1>
            <p className="auth-body">{sectionCopy.body}</p>

            <div className="auth-insight">
              <p className="auth-insight-eyebrow">{copy.shared.panelEyebrow}</p>
              <h2>{copy.shared.panelTitle}</h2>
              <p>{copy.shared.panelBody}</p>
            </div>

            <div className="auth-highlight-grid">
              {copy.shared.highlights.map((item) => (
                <article key={item.title} className="auth-highlight-card">
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="auth-card premium-surface">{children}</div>
        </div>
      </section>
    </main>
  );
}
