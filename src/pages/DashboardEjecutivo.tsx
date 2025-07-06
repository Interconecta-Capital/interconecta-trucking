
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import DashboardRentabilidad from '@/components/dashboard/DashboardRentabilidad';

export default function DashboardEjecutivo() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto p-6">
        <DashboardRentabilidad />
      </div>
    </div>
  );
}
