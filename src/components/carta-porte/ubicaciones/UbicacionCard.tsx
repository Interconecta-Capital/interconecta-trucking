
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2, Calendar, Building2 } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionCardProps {
  ubicacion: UbicacionCompleta;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function UbicacionCard({ ubicacion, index, onEdit, onDelete }: UbicacionCardProps) {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Destino':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return '🚛';
      case 'Destino':
        return '🏁';
      default:
        return '⚡';
    }
  };

  const formatDireccion = () => {
    const { domicilio } = ubicacion;
    if (!domicilio) return 'Dirección no especificada';
    
    return `${domicilio.calle} ${domicilio.numero_exterior}${domicilio.numero_interior ? ` Int. ${domicilio.numero_interior}` : ''}, ${domicilio.colonia}, ${domicilio.municipio}, ${domicilio.estado} ${domicilio.codigo_postal}`;
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return null;
    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getTipoIcon(ubicacion.tipo_ubicacion)}</div>
            <div className="flex items-center gap-2">
              <Badge className={getTipoColor(ubicacion.tipo_ubicacion)}>
                {ubicacion.tipo_ubicacion}
              </Badge>
              <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Información del remitente/destinatario */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-800">
                {ubicacion.nombre_remitente_destinatario || 'Sin nombre especificado'}
              </span>
            </div>
            {ubicacion.rfc_remitente_destinatario && (
              <p className="text-sm text-gray-600 ml-6">
                RFC: {ubicacion.rfc_remitente_destinatario}
              </p>
            )}
          </div>
          
          {/* Dirección */}
          <div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 leading-relaxed">
                {formatDireccion()}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
            {ubicacion.fecha_hora_salida_llegada && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                {formatFecha(ubicacion.fecha_hora_salida_llegada)}
              </div>
            )}
            
            {ubicacion.distancia_recorrida && ubicacion.distancia_recorrida > 0 && (
              <div className="text-xs text-blue-600 font-medium">
                📏 {ubicacion.distancia_recorrida} km
              </div>
            )}

            {ubicacion.coordenadas && (
              <div className="text-xs text-green-600 font-medium">
                📍 Geocodificada
              </div>
            )}
          </div>

          {/* ID para debugging (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 font-mono">
              ID: {ubicacion.id_ubicacion}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
