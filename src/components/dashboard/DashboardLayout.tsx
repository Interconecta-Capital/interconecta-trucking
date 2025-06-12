
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { QuickActionsCard } from './QuickActionsCard';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { ProximosEventos } from './ProximosEventos';
import { NotificationsPanel } from './NotificationsPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { RealtimeMetrics } from './RealtimeMetrics';
import { useIsMobile } from '@/hooks/use-mobile';

export function DashboardLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="space-y-4">
        <PersonalizedGreeting />
        
        <div className="grid gap-4 md:gap-6 lg:gap-8">
          {/* Métricas principales */}
          <DashboardMetricsGrid />
          
          {/* Layout principal con tres columnas en desktop, una en móvil */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {/* Primera columna - Acciones rápidas y métricas detalladas */}
            <div className="space-y-4">
              <QuickActionsCard />
              <RealtimeMetrics />
            </div>
            
            {/* Segunda columna - Calendario y próximos eventos */}
            <div className="space-y-4">
              <EnhancedCalendarView />
              <ProximosEventos />
            </div>
            
            {/* Tercera columna - Notificaciones y análisis */}
            <div className="space-y-4">
              <NotificationsPanel />
              <AnalyticsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
