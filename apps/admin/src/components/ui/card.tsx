import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren;

export function Card({ children }: CardProps) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(16, 24, 20, 0.04)',
      }}
    >
      {children}
    </section>
  );
}
