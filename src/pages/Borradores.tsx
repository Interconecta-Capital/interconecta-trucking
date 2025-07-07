
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { BorradoresManager } from '@/components/borradores';

export default function BorradoresPage() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto p-6">
        <BorradoresManager />
      </div>
    </div>
  );
}
