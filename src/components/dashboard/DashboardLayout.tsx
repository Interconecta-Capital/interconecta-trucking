
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { QuickActionsCard } from './QuickActionsCard';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { NotificationsPanel } from './NotificationsPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { RealtimeMetrics } from './RealtimeMetrics';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  isLoading: boolean;
  totalCartasPorte: number;
  cartasPendientes: number;
  cartasCompletadas: number;
  totalVehiculos: number;
  vehiculosDisponibles: number;
  vehiculosEnUso: number;
  vehiculosMantenimiento: number;
  totalConductores: number;
  conductoresDisponibles: number;
  conductoresEnViaje: number;
  totalSocios: number;
  sociosActivos: number;
}

export function DashboardLayout({
  isLoading,
  totalCartasPorte,
  cartasPendientes,
  cartasCompletadas,
  totalVehiculos,
  vehiculosDisponibles,
  vehiculosEnUso,
  vehiculosMantenimiento,
  totalConductores,
  conductoresDisponibles,
  conductoresEnViaje,
  totalSocios,
  sociosActivos,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  // Métricas para el componente RealtimeMetrics
  const realtimeMetrics = {
    vehiculosActivos: vehiculosEnUso,
    alertasActivas: vehiculosMantenimiento,
    eficienciaPromedio: 85.4,
    consumoCombustible: 12.8,
    tiempoPromedioEntrega: 4.2,
    satisfaccionCliente: 4.7,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="space-y-4">
        <PersonalizedGreeting />
        
        <div className="grid gap-4 md:gap-6 lg:gap-8">
          {/* Métricas principales */}
          <DashboardMetricsGrid
            isLoading={isLoading}
            totalCartasPorte={totalCartasPorte}
            cartasPendientes={cartasPendientes}
            cartasCompletadas={cartasCompletadas}
            totalVehiculos={totalVehiculos}
            vehiculosDisponibles={vehiculosDisponibles}
            vehiculosEnUso={vehiculosEnUso}
            vehiculosMantenimiento={vehiculosMantenimiento}
            totalConductores={totalConductores}
            conductoresDisponibles={conductoresDisponibles}
            conductoresEnViaje={conductoresEnViaje}
            totalSocios={totalSocios}
            sociosActivos={sociosActivos}
          />
          
          {/* Layout principal con dos columnas en desktop, una en móvil */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Primera columna - Acciones rápidas y métricas detalladas */}
            <div className="space-y-4">
              <QuickActionsCard />
              <RealtimeMetrics metrics={realtimeMetrics} isLoading={isLoading} />
            </div>
            
            {/* Segunda columna - Calendario, notificaciones y análisis */}
            <div className="space-y-4">
              <EnhancedCalendarView />
              <NotificationsPanel />
              <AnalyticsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
