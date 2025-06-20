import { PersonalizedGreeting } from './PersonalizedGreeting';
import { WelcomeCard } from './WelcomeCard';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { PlanNotifications } from '../common/PlanNotifications';
import { LimitUsageIndicator } from '../common/LimitUsageIndicator';
import { PlanBadge } from '../common/PlanBadge';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';
import { AccessControlDebug } from '../debug/AccessControlDebug';
import { usePermissionCheck } from '@/hooks/useUnifiedAccessControl';

export function EnhancedDashboardLayout() {
  const accessControl = usePermissionCheck();
  const { cartasPorte } = useCartasPorte();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();
  const { socios } = useSocios();

  const cartasPorteCount = cartasPorte.length;
  const vehiculosCount = vehiculos.length;
  const conductoresCount = conductores.length;
  const sociosCount = socios.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header con saludo personalizado */}
        <PersonalizedGreeting />
        
        {/* Debug panel - solo visible para superusers o cuando se activa */}
        <AccessControlDebug />
        
        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Tarjetas de estado */}
          <div className="space-y-4">
            <WelcomeCard />
            <TrialStatusCard />
            <PlanBadge size="lg" className="w-full justify-center py-3" />
          </div>
          
          {/* Columna central - Métricas principales */}
          <div className="lg:col-span-2">
            <DashboardMetricsGrid />
          </div>
        </div>

        {/* Notificaciones de plan */}
        <PlanNotifications />
        
        {/* Indicadores de uso de límites */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LimitUsageIndicator 
            resource="cartas_porte" 
            used={cartasPorteCount} 
            limit={accessControl.limits.cartas_porte}
            label="Cartas Porte"
          />
          <LimitUsageIndicator 
            resource="vehiculos" 
            used={vehiculosCount} 
            limit={accessControl.limits.vehiculos}
            label="Vehículos"
          />
          <LimitUsageIndicator 
            resource="conductores" 
            used={conductoresCount} 
            limit={accessControl.limits.conductores}
            label="Conductores"
          />
          <LimitUsageIndicator 
            resource="socios" 
            used={sociosCount} 
            limit={accessControl.limits.socios}
            label="Socios"
          />
        </div>
      </div>
    </div>
  );
}
