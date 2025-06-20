
import { BusinessMetricsGrid } from './BusinessMetricsGrid';
import { OperationalAlertsPanel } from './OperationalAlertsPanel';
import { BusinessPerformanceRankings } from './BusinessPerformanceRankings';
import { ImprovedTrialStatusCard } from './ImprovedTrialStatusCard';
import { ActiveNotificationsWidget } from './ActiveNotificationsWidget';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export function EnhancedDashboardLayout() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Notificaciones importantes del plan */}
      <PlanNotifications />
      
      {/* Métricas de negocio principales */}
      <BusinessMetricsGrid />
      
      {/* Grid con información clave */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado del trial con datos reales */}
        <ImprovedTrialStatusCard />
        
        {/* Alertas operacionales */}
        <div className="lg:col-span-2">
          <OperationalAlertsPanel />
        </div>
      </div>
      
      {/* Widget de notificaciones activas */}
      <ActiveNotificationsWidget />
      
      {/* Rankings y análisis de rendimiento */}
      <BusinessPerformanceRankings />
    </div>
  );
}
