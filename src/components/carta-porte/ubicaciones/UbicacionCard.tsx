
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2 } from 'lucide-react';
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
        return 'bg-green-100 text-green-800';
      case 'Destino':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <Badge className={getTipoColor(ubicacion.tipo_ubicacion)}>
              {ubicacion.tipo_ubicacion}
            </Badge>
            <span className="text-sm text-gray-500">#{index + 1}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="font-medium">{ubicacion.nombre_remitente_destinatario || 'Sin nombre'}</p>
            <p className="text-sm text-gray-600">{ubicacion.rfc_remitente_destinatario || 'Sin RFC'}</p>
          </div>
          
          {ubicacion.domicilio && (
            <div className="text-sm text-gray-600">
              <p>{ubicacion.domicilio.calle} {ubicacion.domicilio.numero_exterior}</p>
              <p>{ubicacion.domicilio.colonia}, {ubicacion.domicilio.municipio}</p>
              <p>{ubicacion.domicilio.estado}, CP {ubicacion.domicilio.codigo_postal}</p>
            </div>
          )}

          {ubicacion.distancia_recorrida && (
            <div className="text-sm text-blue-600">
              Distancia: {ubicacion.distancia_recorrida} km
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
