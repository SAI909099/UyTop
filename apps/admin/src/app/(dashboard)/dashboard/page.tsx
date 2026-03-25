import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card } from '@/components/ui/card';

const cards = [
  { label: 'Pending moderation', value: '0' },
  { label: 'Open reports', value: '0' },
  { label: 'Active owners', value: '0' },
];

export default function DashboardPage() {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <DashboardHeader
        eyebrow="Operations"
        title="Admin dashboard"
        description="This shell will expand into moderation, anti-fraud, and owner operations in the next phases."
      />
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {cards.map((card) => (
          <Card key={card.label}>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{card.label}</p>
            <h2 style={{ margin: '12px 0 0', fontSize: '2rem' }}>{card.value}</h2>
          </Card>
        ))}
      </section>
    </div>
  );
}
