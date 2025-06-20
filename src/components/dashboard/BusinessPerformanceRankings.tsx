
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Users, 
  Truck, 
  MapPin,
  TrendingUp
} from 'lucide-react';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

export function BusinessPerformanceRankings() {
  const { cartasPorte } = useCartasPorte();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();
  const { socios } = useSocios();

  // Ranking de socios por actividad
  const sociosRanking = socios
    .map(socio => ({
      ...socio,
      viajes: cartasPorte.filter(cp => 
        cp.rfc_receptor === socio.rfc || cp.rfc_emisor === socio.rfc
      ).length
    }))
    .sort((a, b) => b.viajes - a.viajes)
    .slice(0, 5);

  // Ranking de vehículos por uso
  const vehiculosRanking = vehiculos
    .map(vehiculo => ({
      ...vehiculo,
      viajes: cartasPorte.filter(cp => 
        cp.datos_formulario?.autotransporte?.placa_vm === vehiculo.placa
      ).length
    }))
    .sort((a, b) => b.viajes - a.viajes)
    .slice(0, 5);

  // Ranking de conductores por actividad
  const conductoresRanking = conductores
    .map(conductor => ({
      ...conductor,
      viajes: cartasPorte.filter(cp => {
        const figuras = cp.datos_formulario?.figuras || [];
        return figuras.some((figura: any) => figura.rfc_figura === conductor.rfc);
      }).length
    }))
    .sort((a, b) => b.viajes - a.viajes)
    .slice(0, 5);

  // Rutas más frecuentes
  const rutasFrecuentes = cartasPorte
    .map(cp => {
      const ubicaciones = cp.datos_formulario?.ubicaciones || [];
      const origen = ubicaciones.find((u: any) => u.tipo_ubicacion === 'Origen');
      const destino = ubicaciones.find((u: any) => u.tipo_ubicacion === 'Destino');
      
      if (!origen || !destino) return null;
      
      return {
        ruta: `${origen.domicilio?.municipio || 'N/A'} → ${destino.domicilio?.municipio || 'N/A'}`,
        estado_origen: origen.domicilio?.estado || 'N/A',
        estado_destino: destino.domicilio?.estado || 'N/A'
      };
    })
    .filter(Boolean)
    .reduce((acc: any, ruta: any) => {
      const key = ruta.ruta;
      if (!acc[key]) {
        acc[key] = { ...ruta, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {});

  const rutasRanking = Object.values(rutasFrecuentes)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5) as any[];

  const maxViajes = Math.max(...sociosRanking.map(s => s.viajes), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Ranking de Socios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Top Socios Comerciales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {sociosRanking.map((socio, index) => (
                <div key={socio.id} className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {socio.nombre_razon_social}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={(socio.viajes / maxViajes) * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">
                        {socio.viajes} viajes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ranking de Vehículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Vehículos Más Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {vehiculosRanking.map((vehiculo, index) => (
                <div key={vehiculo.id} className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {vehiculo.estado}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {vehiculo.viajes} viajes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ranking de Conductores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Conductores Más Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {conductoresRanking.map((conductor, index) => (
                <div key={conductor.id} className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {conductor.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {conductor.estado}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {conductor.viajes} viajes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Rutas Más Frecuentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            Rutas Más Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {rutasRanking.map((ruta, index) => (
                <div key={`${ruta.ruta}-${index}`} className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {ruta.ruta}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ruta.estado_origen} → {ruta.estado_destino}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-muted-foreground">
                        {ruta.count} viajes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
