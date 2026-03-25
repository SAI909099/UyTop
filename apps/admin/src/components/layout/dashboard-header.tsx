type DashboardHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DashboardHeader({ eyebrow, title, description }: DashboardHeaderProps) {
  return (
    <header style={{ display: 'grid', gap: '10px' }}>
      <p style={{ margin: 0, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{eyebrow}</p>
      <h1 style={{ margin: 0, fontSize: '2.4rem' }}>{title}</h1>
      <p style={{ margin: 0, maxWidth: '720px', color: 'var(--text-muted)' }}>{description}</p>
    </header>
  );
}
