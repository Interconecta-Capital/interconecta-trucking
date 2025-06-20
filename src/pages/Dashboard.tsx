
import { PersonalizedGreeting } from '@/components/dashboard/PersonalizedGreeting';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { DashboardMetricsGrid } from '@/components/dashboard/DashboardMetricsGrid';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PersonalProgressDashboard } from '@/components/dashboard/PersonalProgressDashboard';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanBadge } from '@/components/common/PlanBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

export default function Dashboard() {
  const { cartasPorte, loading: loadingCartas } = useCartasPorte();
  const { vehiculos, loading: loadingVehiculos } = useVehiculos();
  const { conductores, loading: loadingConductores } = useConductores();
  const { socios, loading: loadingSocios } = useSocios();

  // Calcular métricas reales
  const totalCartasPorte = cartasPorte.length;
  const cartasPendientes = cartasPorte.filter(c => c.status === 'borrador' || c.status === 'pendiente').length;
  const cartasCompletadas = cartasPorte.filter(c => c.status === 'timbrada' || c.status === 'completada').length;

  const totalVehiculos = vehiculos.length;
  const vehiculosDisponibles = vehiculos.filter(v => v.estado === 'disponible').length;
  const vehiculosEnUso = vehiculos.filter(v => v.estado === 'en_uso').length;
  const vehiculosMantenimiento = vehiculos.filter(v => v.estado === 'mantenimiento').length;

  const totalConductores = conductores.length;
  const conductoresDisponibles = conductores.filter(c => c.estado === 'disponible').length;
  const conductoresEnViaje = conductores.filter(c => c.estado === 'en_viaje').length;

  const totalSocios = socios.length;
  const sociosActivos = socios.filter(s => s.estado === 'activo').length;

  const isLoading = loadingCartas || loadingVehiculos || loadingConductores || loadingSocios;

  // Determinar si mostrar la tarjeta de bienvenida
  const showWelcomeCard = !isLoading && 
    totalCartasPorte === 0 && 
    totalVehiculos === 0 && 
    totalConductores === 0 && 
    totalSocios === 0;

  return (
    <ProtectedContent requiredFeature="dashboard">
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header con badge de plan */}
        <div className="flex items-center justify-between">
          <PersonalizedGreeting />
          <PlanBadge size="md" />
        </div>

        {/* Pestañas principales del dashboard */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">📊 Mi Progreso Personal</TabsTrigger>
            <TabsTrigger value="operations">🚛 Vista Operacional</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-6">
            <PersonalProgressDashboard />
          </TabsContent>

          <TabsContent value="operations" className="mt-6">
            <DashboardLayout>
              {/* Tarjeta de bienvenida - aparece primero si no hay datos */}
              <WelcomeCard show={showWelcomeCard} />

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

              {/* Indicadores de límites */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LimitUsageIndicator resourceType="cartas_porte" />
                <LimitUsageIndicator resourceType="vehiculos" />
                <LimitUsageIndicator resourceType="conductores" />
                <LimitUsageIndicator resourceType="socios" />
              </div>
            </DashboardLayout>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
