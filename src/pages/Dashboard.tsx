
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';
import { FileText, Car, User, Users, TrendingUp, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de control
          </p>
        </div>
      </div>

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

      {/* Acciones rápidas y calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <QuickActionsCard />
        </div>
        <div className="lg:col-span-2">
          <CalendarView />
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TrendChart />
        <AnalyticsPanel />
      </div>

      {/* Métricas adicionales si no hay datos */}
      {!isLoading && totalCartasPorte === 0 && totalVehiculos === 0 && totalConductores === 0 && totalSocios === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>¡Bienvenido a tu Dashboard!</CardTitle>
            <CardDescription>
              Comienza configurando tu sistema para ver estadísticas en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Cartas de Porte</h3>
                <p className="text-sm text-muted-foreground">Crea tu primera carta porte</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Car className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Vehículos</h3>
                <p className="text-sm text-muted-foreground">Registra tu flota</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Conductores</h3>
                <p className="text-sm text-muted-foreground">Añade tu equipo</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold">Socios</h3>
                <p className="text-sm text-muted-foreground">Gestiona clientes y proveedores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
