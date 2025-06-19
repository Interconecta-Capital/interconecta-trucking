
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Route } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionesMVPFieldsProps {
  ubicacion: UbicacionCompleta;
  onChange: (ubicacion: UbicacionCompleta) => void;
  esDestino?: boolean;
}

export function UbicacionesMVPFields({ 
  ubicacion, 
  onChange, 
  esDestino = false 
}: UbicacionesMVPFieldsProps) {
  
  const handleChange = (field: keyof UbicacionCompleta, value: any) => {
    onChange({
      ...ubicacion,
      [field]: value
    });
  };

  const generarIdUbicacion = (tipo: string, index: number = 1) => {
    const prefijo = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'PI';
    return `${prefijo}${String(index).padStart(6, '0')}`;
  };

  // Auto-generar ID si no existe
  React.useEffect(() => {
    if (!ubicacion.id_ubicacion) {
      const nuevoId = generarIdUbicacion(ubicacion.tipo_ubicacion);
      handleChange('id_ubicacion', nuevoId);
    }
  }, [ubicacion.tipo_ubicacion]);

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <MapPin className="h-5 w-5" />
          <span>Campos Obligatorios {ubicacion.tipo_ubicacion}</span>
          <Badge variant="destructive" className="text-xs">
            REQUERIDO SAT v3.1
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ID Ubicación - OBLIGATORIO formato específico */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            ID Ubicación *
            <Badge variant="destructive" className="text-xs">OBLIGATORIO</Badge>
          </Label>
          <Input
            value={ubicacion.id_ubicacion || ''}
            onChange={(e) => handleChange('id_ubicacion', e.target.value.toUpperCase())}
            placeholder="OR000001 / DE000001 / PI000001"
            maxLength={8}
            className="uppercase font-mono"
            required
          />
          <p className="text-xs text-gray-600">
            Formato: OR######, DE######, PI###### (según tipo de ubicación)
          </p>
        </div>

        {/* Fecha y Hora - OBLIGATORIO v3.1 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Fecha y Hora de {esDestino ? 'Llegada' : 'Salida'} *
            <Badge variant="destructive" className="text-xs">OBLIGATORIO v3.1</Badge>
          </Label>
          <Input
            type="datetime-local"
            value={ubicacion.fecha_hora_salida_llegada || ''}
            onChange={(e) => handleChange('fecha_hora_salida_llegada', e.target.value)}
            required
          />
          <p className="text-xs text-gray-600">
            Fecha y hora programada de {esDestino ? 'llegada' : 'salida'} en esta ubicación
          </p>
        </div>

        {/* Distancia Recorrida - OBLIGATORIO para destino */}
        {esDestino && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Distancia Recorrida (km) *
              <Badge variant="destructive" className="text-xs">OBLIGATORIO DESTINO</Badge>
            </Label>
            <Input
              type="number"
              value={ubicacion.distancia_recorrida || ''}
              onChange={(e) => handleChange('distancia_recorrida', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
            <p className="text-xs text-gray-600">
              Distancia total recorrida hasta esta ubicación (obligatorio para destino)
            </p>
          </div>
        )}

        {/* RFC y Nombre Remitente/Destinatario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              RFC {ubicacion.tipo_ubicacion === 'Origen' ? 'Remitente' : 'Destinatario'}
            </Label>
            <Input
              value={ubicacion.rfc_remitente_destinatario || ''}
              onChange={(e) => handleChange('rfc_remitente_destinatario', e.target.value.toUpperCase())}
              placeholder="XAXX010101000"
              maxLength={13}
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Nombre {ubicacion.tipo_ubicacion === 'Origen' ? 'Remitente' : 'Destinatario'}
            </Label>
            <Input
              value={ubicacion.nombre_remitente_destinatario || ''}
              onChange={(e) => handleChange('nombre_remitente_destinatario', e.target.value)}
              placeholder="Nombre completo o razón social"
            />
          </div>
        </div>

        {/* Información adicional de estación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo Estación</Label>
            <Input
              value={ubicacion.tipo_estacion || ''}
              onChange={(e) => handleChange('tipo_estacion', e.target.value)}
              placeholder="Ej: Ferroviaria"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Número Estación</Label>
            <Input
              value={ubicacion.numero_estacion || ''}
              onChange={(e) => handleChange('numero_estacion', e.target.value)}
              placeholder="Ej: EST001"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Kilómetro</Label>
            <Input
              type="number"
              value={ubicacion.kilometro || ''}
              onChange={(e) => handleChange('kilometro', parseFloat(e.target.value) || undefined)}
              placeholder="0.0"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        {/* Coordenadas (si están disponibles) */}
        {ubicacion.coordenadas && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Latitud</Label>
              <Input
                type="number"
                value={ubicacion.coordenadas.latitud}
                readOnly
                className="bg-gray-100"
                step="0.000001"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Longitud</Label>
              <Input
                type="number"
                value={ubicacion.coordenadas.longitud}
                readOnly
                className="bg-gray-100"
                step="0.000001"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
