
import { PersonalizedGreeting } from '@/components/dashboard/PersonalizedGreeting';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { DashboardMetricsGrid } from '@/components/dashboard/DashboardMetricsGrid';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Mostrar tarjeta de bienvenida si no hay datos */}
      {showWelcomeCard && <WelcomeCard show={showWelcomeCard} />}
      
      {/* Dashboard con métricas */}
      {!showWelcomeCard && (
        <DashboardLayout
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
      )}
    </div>
  );
}
