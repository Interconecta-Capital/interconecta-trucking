
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { QuickActionsCard } from './QuickActionsCard';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { NotificationsPanel } from './NotificationsPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { RealtimeMetrics } from './RealtimeMetrics';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  isLoading?: boolean;
  totalCartasPorte?: number;
  cartasPendientes?: number;
  cartasCompletadas?: number;
  totalVehiculos?: number;
  vehiculosDisponibles?: number;
  vehiculosEnUso?: number;
  vehiculosMantenimiento?: number;
  totalConductores?: number;
  conductoresDisponibles?: number;
  conductoresEnViaje?: number;
  totalSocios?: number;
  sociosActivos?: number;
}

export function DashboardLayout({
  isLoading = false,
  totalCartasPorte = 0,
  cartasPendientes = 0,
  cartasCompletadas = 0,
  totalVehiculos = 0,
  vehiculosDisponibles = 0,
  vehiculosEnUso = 0,
  vehiculosMantenimiento = 0,
  totalConductores = 0,
  conductoresDisponibles = 0,
  conductoresEnViaje = 0,
  totalSocios = 0,
  sociosActivos = 0,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  // Mock metrics para RealtimeMetrics con la estructura correcta
  const mockMetrics = {
    vehiculosActivos: vehiculosEnUso,
    alertasActivas: vehiculosMantenimiento,
    eficienciaPromedio: 85.5,
    consumoCombustible: 15.2,
    tiempoPromedioEntrega: 4.5,
    satisfaccionCliente: 4.8,
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
          
          {/* Layout principal con tres columnas en desktop, una en móvil */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {/* Primera columna - Acciones rápidas (incluyendo próximos eventos) */}
            <div className="space-y-4">
              <QuickActionsCard />
              <RealtimeMetrics metrics={mockMetrics} />
            </div>
            
            {/* Segunda columna - Calendario */}
            <div className="space-y-4">
              <EnhancedCalendarView />
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
