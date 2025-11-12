import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Flag, Clock, Route } from 'lucide-react';

interface RutaVisualProps {
  ubicaciones: any[];
}

export function RutaVisual({ ubicaciones }: RutaVisualProps) {
  if (!ubicaciones || ubicaciones.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay ubicaciones registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  const origen = ubicaciones.find(u => 
    u.tipoUbicacion === 'Origen' || u.tipo_ubicacion === 'Origen'
  );
  const destino = ubicaciones.find(u => 
    u.tipoUbicacion === 'Destino' || u.tipo_ubicacion === 'Destino'
  );
  const intermedias = ubicaciones.filter(u => 
    u.tipoUbicacion === 'Paso Intermedio' || u.tipo_ubicacion === 'Paso Intermedio'
  );

  const formatearDireccion = (ubicacion: any) => {
    const domicilio = ubicacion.domicilio || {};
    const partes = [
      domicilio.calle,
      domicilio.numeroExterior || domicilio.numero_exterior,
      domicilio.colonia,
      domicilio.municipio,
      domicilio.estado
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(', ') : 'Dirección no especificada';
  };

  const UbicacionCard = ({ ubicacion, tipo, icon: Icon, iconColor }: any) => (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`rounded-full p-2 ${iconColor}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {tipo !== 'destino' && (
          <div className="w-0.5 h-full bg-border my-2" />
        )}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{ubicacion.tipoUbicacion || ubicacion.tipo_ubicacion}</Badge>
          <span className="text-xs text-muted-foreground">
            {ubicacion.fechaHoraSalidaLlegada || ubicacion.fecha_hora_salida_llegada || 'Sin fecha'}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {ubicacion.nombreRemitenteDestinatario || ubicacion.nombre_remitente_destinatario || ubicacion.nombre || 'Sin nombre'}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatearDireccion(ubicacion)}
        </p>
        {ubicacion.domicilio?.codigo_postal && (
          <p className="text-xs text-muted-foreground mt-1">
            CP: {ubicacion.domicilio.codigo_postal}
          </p>
        )}
      </div>
    </div>
  );

  // Calcular distancia total si está disponible
  const distanciaTotal = ubicaciones.reduce((sum, u) => 
    sum + (u.distanciaRecorrida || u.distancia_recorrida || 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Resumen de la Ruta */}
      {distanciaTotal > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Distancia Total
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                {distanciaTotal.toFixed(2)} km
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Ubicaciones */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {origen && (
              <UbicacionCard
                ubicacion={origen}
                tipo="origen"
                icon={Flag}
                iconColor="bg-success"
              />
            )}

            {intermedias.map((ubicacion, index) => (
              <UbicacionCard
                key={index}
                ubicacion={ubicacion}
                tipo="intermedia"
                icon={Navigation}
                iconColor="bg-primary"
              />
            ))}

            {destino && (
              <UbicacionCard
                ubicacion={destino}
                tipo="destino"
                icon={MapPin}
                iconColor="bg-destructive"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total de Puntos</p>
                <p className="text-lg font-bold text-foreground">{ubicaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Paradas Intermedias</p>
                <p className="text-lg font-bold text-foreground">{intermedias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
