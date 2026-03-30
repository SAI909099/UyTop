import type { ReactNode } from 'react';

type DashboardHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function DashboardHeader({ eyebrow, title, description, actions }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-copy">
        <p className="dashboard-header-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="dashboard-header-actions">{actions}</div> : null}
    </header>
  );
}
