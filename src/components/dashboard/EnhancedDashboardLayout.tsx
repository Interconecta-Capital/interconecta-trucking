
import { OptimizedDashboard } from './OptimizedDashboard';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { TrialStatusCard } from './TrialStatusCard';
import { ActiveNotificationsWidget } from './ActiveNotificationsWidget';

export function EnhancedDashboardLayout() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Notificaciones importantes del plan */}
      <PlanNotifications />
      
      {/* Grid con información clave */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado del trial/suscripción */}
        <TrialStatusCard />
        
        {/* Widget de notificaciones activas */}
        <div className="lg:col-span-2">
          <ActiveNotificationsWidget />
        </div>
      </div>
      
      {/* Dashboard principal optimizado */}
      <OptimizedDashboard />
    </div>
  );
}
