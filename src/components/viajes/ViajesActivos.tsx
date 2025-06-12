
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Clock, User } from 'lucide-react';
import { useViajesEstados } from '@/hooks/useViajesEstados';

export function ViajesActivos() {
  const { viajesActivos, isLoading } = useViajesEstados();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando viajes activos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Viajes en Curso ({viajesActivos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viajesActivos.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay viajes activos en este momento</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {viajesActivos.map((viaje) => (
                <Card key={viaje.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Carta Porte: {viaje.carta_porte_id}</h3>
                        <Badge variant={viaje.estado === 'en_transito' ? 'default' : 'secondary'}>
                          {viaje.estado}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Tracking
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Origen:</span> {viaje.origen}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="font-medium">Destino:</span> {viaje.destino}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Inicio programado:</span> 
                          {new Date(viaje.fecha_inicio_programada).toLocaleString()}
                        </div>
                        {viaje.fecha_inicio_real && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Inicio real:</span> 
                            {new Date(viaje.fecha_inicio_real).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {viaje.observaciones && (
                      <div className="mt-3 p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Observaciones:</span> {viaje.observaciones}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
