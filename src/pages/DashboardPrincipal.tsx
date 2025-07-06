
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

export default function DashboardPrincipal() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <DashboardLayout hideWidgetsForPrincipal={true}>
        <UnifiedDashboard />
      </DashboardLayout>
    </div>
  );
}
