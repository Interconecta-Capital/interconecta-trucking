
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2, GripVertical } from 'lucide-react';

interface UbicacionesListProps {
  ubicaciones: any[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  distanciaTotal?: number;
}

export function UbicacionesList({ ubicaciones, onEdit, onDelete, onReorder, distanciaTotal }: UbicacionesListProps) {
  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return { label: 'Origen', color: 'bg-green-100 text-green-800' };
      case 'Destino':
        return { label: 'Destino', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Intermedio', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const formatAddress = (domicilio: any) => {
    return `${domicilio.calle} ${domicilio.numExterior}, ${domicilio.colonia}, ${domicilio.municipio}, ${domicilio.estado} ${domicilio.codigoPostal}`;
  };

  if (ubicaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          No hay ubicaciones agregadas. Agrega al menos una ubicación de origen y destino.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mostrar distancia total si está disponible */}
      {distanciaTotal && distanciaTotal > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Distancia Total: {distanciaTotal.toFixed(2)} km
            </span>
          </div>
        </div>
      )}

      {ubicaciones.map((ubicacion, index) => {
        const tipoInfo = getTipoLabel(ubicacion.tipoUbicacion);
        
        return (
          <Card key={ubicacion.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {onReorder && (
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                  )}
                  
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">
                        Ubicación #{index + 1}
                      </h4>
                      <Badge className={tipoInfo.color}>
                        {tipoInfo.label}
                      </Badge>
                      {ubicacion.distanciaRecorrida > 0 && (
                        <Badge variant="outline">
                          {ubicacion.distanciaRecorrida} km
                        </Badge>
                      )}
                    </div>
                    
                    <p className="font-medium text-gray-900 mb-1">
                      {ubicacion.nombreRemitenteDestinatario}
                    </p>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      RFC: {ubicacion.rfcRemitenteDestinatario}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      {formatAddress(ubicacion.domicilio)}
                    </p>
                    
                    {ubicacion.coordenadas && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {ubicacion.coordenadas.lat.toFixed(4)}, {ubicacion.coordenadas.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
