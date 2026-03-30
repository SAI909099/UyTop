import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { classNames } from '@/lib/utils/classnames';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className, style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={classNames('admin-button', className)}
      style={{
        ...style,
      }}
    >
      {children}
    </button>
  );
}
