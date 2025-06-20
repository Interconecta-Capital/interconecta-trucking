
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, 
  Users, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

export function BusinessMetricsGrid() {
  const { cartasPorte } = useCartasPorte();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();
  const { socios } = useSocios();

  // Calcular métricas de negocio
  const vehiculosActivos = vehiculos.filter(v => v.estado === 'disponible' || v.estado === 'en_ruta').length;
  const vehiculosEnRuta = vehiculos.filter(v => v.estado === 'en_ruta').length;
  const conductoresActivos = conductores.filter(c => c.estado === 'disponible' || c.estado === 'en_ruta').length;
  
  const viajesEsteMes = cartasPorte.filter(cp => {
    const fecha = new Date(cp.created_at);
    const hoy = new Date();
    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  }).length;

  const viajesCompletados = cartasPorte.filter(cp => cp.status === 'completado').length;
  const viajesPendientes = cartasPorte.filter(cp => cp.status === 'en_transito' || cp.status === 'programado').length;

  const sociosConMasActividad = socios
    .map(socio => ({
      ...socio,
      viajes: cartasPorte.filter(cp => 
        cp.rfc_receptor === socio.rfc || cp.rfc_emisor === socio.rfc
      ).length
    }))
    .sort((a, b) => b.viajes - a.viajes)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Unidades en Movimiento */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            Unidades en Movimiento
          </CardTitle>
          <Truck className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{vehiculosEnRuta}</div>
          <p className="text-xs text-blue-700">
            de {vehiculosActivos} unidades activas
          </p>
          <Progress value={(vehiculosEnRuta / Math.max(vehiculosActivos, 1)) * 100} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Viajes Este Mes */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            Viajes Este Mes
          </CardTitle>
          <MapPin className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{viajesEsteMes}</div>
          <p className="text-xs text-green-700">
            {viajesCompletados} completados, {viajesPendientes} pendientes
          </p>
          <div className="flex gap-1 mt-2">
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {viajesCompletados}
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {viajesPendientes}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Conductores Activos */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">
            Conductores Activos
          </CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{conductoresActivos}</div>
          <p className="text-xs text-purple-700">
            de {conductores.length} conductores registrados
          </p>
          <Progress value={(conductoresActivos / Math.max(conductores.length, 1)) * 100} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Ingresos Estimados */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">
            Actividad Mensual
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{socios.length}</div>
          <p className="text-xs text-orange-700">
            socios comerciales activos
          </p>
          {sociosConMasActividad.length > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              Top: {sociosConMasActividad[0].nombre_razon_social.slice(0, 20)}...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
