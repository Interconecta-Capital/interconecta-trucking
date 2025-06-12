
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { EnhancedCalendarView } from '@/components/dashboard/EnhancedCalendarView';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel';
import { PersonalizedGreeting } from '@/components/dashboard/PersonalizedGreeting';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';
import { FileText, Car, User, Users, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const { cartasPorte, loading: loadingCartas } = useCartasPorte();
  const { vehiculos, loading: loadingVehiculos } = useVehiculos();
  const { conductores, loading: loadingConductores } = useConductores();
  const { socios, loading: loadingSocios } = useSocios();
  const isMobile = useIsMobile();

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
      {/* Saludo personalizado */}
      <PersonalizedGreeting />

      {/* Tarjeta de bienvenida - aparece primero si no hay datos */}
      <WelcomeCard show={showWelcomeCard} />

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartas de Porte</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalCartasPorte}</div>
                <p className="text-xs text-muted-foreground">
                  {cartasPendientes} pendientes, {cartasCompletadas} completadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalVehiculos}</div>
                <p className="text-xs text-muted-foreground">
                  {vehiculosDisponibles} disponibles, {vehiculosEnUso} en uso
                </p>
                {vehiculosMantenimiento > 0 && (
                  <p className="text-xs text-orange-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {vehiculosMantenimiento} en mantenimiento
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalConductores}</div>
                <p className="text-xs text-muted-foreground">
                  {conductoresDisponibles} disponibles, {conductoresEnViaje} en viaje
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios Comerciales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalSocios}</div>
                <p className="text-xs text-muted-foreground">
                  {sociosActivos} activos
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribución para Web y Móvil */}
      {isMobile ? (
        // Layout para móvil - estructura vertical
        <div className="space-y-4">
          <QuickActionsCard />
          <EnhancedCalendarView />
          <AnalyticsPanel />
        </div>
      ) : (
        // Layout para desktop - calendario a la izquierda, acciones a la derecha
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <EnhancedCalendarView />
            </div>
            <div className="lg:col-span-1">
              <QuickActionsCard />
            </div>
          </div>

          {/* Solo Analytics Panel - sin TrendChart */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 md:gap-6">
            <AnalyticsPanel />
          </div>
        </>
      )}
    </div>
  );
}
