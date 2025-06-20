
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { WelcomeCard } from './WelcomeCard';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { TrialStatusCard } from './TrialStatusCard';
import { PlanNotifications } from '../common/PlanNotifications';
import { LimitUsageIndicator } from '../common/LimitUsageIndicator';
import { PlanBadge } from '../common/PlanBadge';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';
import { AccessControlDebug } from '../debug/AccessControlDebug';
import { useSimpleAccessControl } from '@/hooks/useSimpleAccessControl';

export function EnhancedDashboardLayout() {
  const accessControl = useSimpleAccessControl();
  const { cartasPorte } = useCartasPorte();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();
  const { socios } = useSocios();

  console.log('🏠 EnhancedDashboardLayout - Estado simple:', {
    hasFullAccess: accessControl.hasFullAccess,
    isBlocked: accessControl.isBlocked,
    isInActiveTrial: accessControl.isInActiveTrial,
    daysRemaining: accessControl.daysRemaining,
    statusMessage: accessControl.statusMessage
  });

  const cartasPorteCount = cartasPorte.length;
  const vehiculosCount = vehiculos.length;
  const conductoresCount = conductores.length;
  const sociosCount = socios.length;

  // Mostrar WelcomeCard si no hay datos
  const showWelcomeCard = cartasPorteCount === 0 && vehiculosCount === 0 && conductoresCount === 0 && sociosCount === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header con saludo personalizado */}
        <PersonalizedGreeting />
        
        {/* Debug panel */}
        <AccessControlDebug />
        
        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Tarjetas de estado */}
          <div className="space-y-4">
            <WelcomeCard show={showWelcomeCard} />
            <TrialStatusCard />
            <PlanBadge size="lg" className="w-full justify-center py-3" />
          </div>
          
          {/* Columna central - Métricas principales */}
          <div className="lg:col-span-2">
            <DashboardMetricsGrid 
              isLoading={false}
              totalCartasPorte={cartasPorteCount}
              cartasPendientes={0}
              cartasCompletadas={cartasPorteCount}
              totalVehiculos={vehiculosCount}
              vehiculosDisponibles={vehiculosCount}
              vehiculosEnUso={0}
              vehiculosMantenimiento={0}
              totalConductores={conductoresCount}
              conductoresDisponibles={conductoresCount}
              conductoresEnViaje={0}
              totalSocios={sociosCount}
              sociosActivos={sociosCount}
            />
          </div>
        </div>

        {/* Notificaciones de plan */}
        <PlanNotifications />
        
        {/* Indicadores de uso de límites */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LimitUsageIndicator 
            resourceType="cartas_porte"
          />
          <LimitUsageIndicator 
            resourceType="vehiculos"
          />
          <LimitUsageIndicator 
            resourceType="conductores"
          />
          <LimitUsageIndicator 
            resourceType="socios"
          />
        </div>
      </div>
    </div>
  );
}
