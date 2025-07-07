
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { ConfiguracionFiscal } from '@/components/configuracion/ConfiguracionFiscal';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto p-6">
        <ConfiguracionFiscal />
      </div>
    </div>
  );
}
