
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import ReportesAutomaticos from '@/components/reportes/ReportesAutomaticos';

export default function ReportesAutomaticosPage() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto p-6">
        <ReportesAutomaticos />
      </div>
    </div>
  );
}
