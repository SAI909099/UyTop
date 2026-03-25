import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <DashboardHeader
        eyebrow="Users"
        title="User management"
        description="User and owner list views will be implemented on top of this route shell."
      />
      <Card>
        <p style={{ margin: 0 }}>Table and filters will be added in a later phase.</p>
      </Card>
    </div>
  );
}
