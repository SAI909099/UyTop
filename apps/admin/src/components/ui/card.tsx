import type { PropsWithChildren } from 'react';

import { classNames } from '@/lib/utils/classnames';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return <section className={classNames('admin-card', className)}>{children}</section>;
}
