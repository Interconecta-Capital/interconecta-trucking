
import { memo } from 'react';
import { PersonalizedGreeting } from '@/components/dashboard/PersonalizedGreeting';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { DashboardMetricsGrid } from '@/components/dashboard/DashboardMetricsGrid';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

// Memoizar el componente principal para evitar re-renders innecesarios
const Dashboard = memo(() => {
  const { cartasPorte, loading: loadingCartas } = useCartasPorte();
  const { vehiculos, loading: loadingVehiculos } = useVehiculos();
  const { conductores, loading: loadingConductores } = useConductores();
  const { socios, loading: loadingSocios } = useSocios();

  // Calcular métricas reales de forma optimizada
  const metrics = {
    // Cartas de porte
    totalCartasPorte: cartasPorte.length,
    cartasPendientes: cartasPorte.filter(c => c.status === 'borrador' || c.status === 'pendiente').length,
    cartasCompletadas: cartasPorte.filter(c => c.status === 'timbrada' || c.status === 'completada').length,
    
    // Vehículos
    totalVehiculos: vehiculos.length,
    vehiculosDisponibles: vehiculos.filter(v => v.estado === 'disponible').length,
    vehiculosEnUso: vehiculos.filter(v => v.estado === 'en_uso').length,
    vehiculosMantenimiento: vehiculos.filter(v => v.estado === 'mantenimiento').length,
    
    // Conductores
    totalConductores: conductores.length,
    conductoresDisponibles: conductores.filter(c => c.estado === 'disponible').length,
    conductoresEnViaje: conductores.filter(c => c.estado === 'en_viaje').length,
    
    // Socios
    totalSocios: socios.length,
    sociosActivos: socios.filter(s => s.estado === 'activo').length,
  };

  const isLoading = loadingCartas || loadingVehiculos || loadingConductores || loadingSocios;

  // Determinar si mostrar la tarjeta de bienvenida de forma optimizada
  const showWelcomeCard = !isLoading && 
    metrics.totalCartasPorte === 0 && 
    metrics.totalVehiculos === 0 && 
    metrics.totalConductores === 0 && 
    metrics.totalSocios === 0;

  console.log('Dashboard render - Loading:', isLoading, 'Metrics:', metrics);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Saludo personalizado */}
      <PersonalizedGreeting />

      <DashboardLayout>
        {/* Tarjeta de bienvenida - aparece primero si no hay datos */}
        <WelcomeCard show={showWelcomeCard} />

        {/* Métricas principales optimizadas */}
        <DashboardMetricsGrid
          isLoading={isLoading}
          totalCartasPorte={metrics.totalCartasPorte}
          cartasPendientes={metrics.cartasPendientes}
          cartasCompletadas={metrics.cartasCompletadas}
          totalVehiculos={metrics.totalVehiculos}
          vehiculosDisponibles={metrics.vehiculosDisponibles}
          vehiculosEnUso={metrics.vehiculosEnUso}
          vehiculosMantenimiento={metrics.vehiculosMantenimiento}
          totalConductores={metrics.totalConductores}
          conductoresDisponibles={metrics.conductoresDisponibles}
          conductoresEnViaje={metrics.conductoresEnViaje}
          totalSocios={metrics.totalSocios}
          sociosActivos={metrics.sociosActivos}
        />
      </DashboardLayout>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
