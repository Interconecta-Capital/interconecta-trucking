
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { ViajesAnalytics } from '@/components/analytics/ViajesAnalytics';

export default function ViajesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto">
        <ViajesAnalytics />
      </div>
    </div>
  );
}
