import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card } from '@/components/ui/card';

export default function ModerationPage() {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <DashboardHeader
        eyebrow="Moderation"
        title="Moderation queue"
        description="Listing review workflows and report triage will be built here."
      />
      <Card>
        <p style={{ margin: 0 }}>Queue widgets and review tables are intentionally deferred.</p>
      </Card>
    </div>
  );
}
