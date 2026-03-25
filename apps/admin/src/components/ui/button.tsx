import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        border: 0,
        borderRadius: '999px',
        padding: '12px 18px',
        background: 'var(--accent)',
        color: 'white',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
