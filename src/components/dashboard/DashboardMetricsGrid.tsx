
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Car, User, Users, AlertTriangle } from 'lucide-react';

interface DashboardMetricsGridProps {
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

export function DashboardMetricsGrid({
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
}: DashboardMetricsGridProps) {
  const LoadingSkeleton = () => (
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cartas de Porte</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
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
            <LoadingSkeleton />
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
            <LoadingSkeleton />
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
            <LoadingSkeleton />
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
  );
}
