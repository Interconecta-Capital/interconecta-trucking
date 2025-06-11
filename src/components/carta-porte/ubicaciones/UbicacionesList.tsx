
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ubicacion } from '@/hooks/useUbicaciones';
import { 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  GripVertical,
  Navigation,
  Route
} from 'lucide-react';

interface UbicacionesListProps {
  ubicaciones: Ubicacion[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  distanciaTotal?: number;
}

export function UbicacionesList({ 
  ubicaciones, 
  onEdit, 
  onDelete, 
  onReorder,
  distanciaTotal = 0
}: UbicacionesListProps) {
  if (ubicaciones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay ubicaciones agregadas</p>
        <p className="text-sm">Agrega al menos un origen y un destino para continuar</p>
      </div>
    );
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return 'bg-green-500';
      case 'Destino':
        return 'bg-red-500';
      case 'Paso Intermedio':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return 'O';
      case 'Destino':
        return 'D';
      case 'Paso Intermedio':
        return 'I';
      default:
        return '?';
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumen de ruta */}
      {distanciaTotal > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Route className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Resumen de Ruta</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Paradas: </span>
                  <span className="font-medium">{ubicaciones.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Distancia Total: </span>
                  <span className="font-medium">{distanciaTotal.toFixed(2)} km</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de ubicaciones */}
      {ubicaciones.map((ubicacion, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Drag handle */}
                {onReorder && (
                  <div className="cursor-move">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                )}

                {/* Tipo e ID */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getTipoColor(ubicacion.tipoUbicacion)}`}>
                    {getTipoIcon(ubicacion.tipoUbicacion)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {ubicacion.idUbicacion}
                  </span>
                </div>
                
                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{ubicacion.tipoUbicacion}</h3>
                    <Badge variant="outline">{ubicacion.rfcRemitenteDestinatario}</Badge>
                    <span className="text-sm text-muted-foreground truncate">
                      {ubicacion.nombreRemitenteDestinatario}
                    </span>
                  </div>
                  
                  {/* Dirección */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {ubicacion.domicilio.calle} {ubicacion.domicilio.numExterior}
                        {ubicacion.domicilio.numInterior && ` Int. ${ubicacion.domicilio.numInterior}`}
                      </span>
                    </p>
                    <p className="ml-4">
                      {ubicacion.domicilio.colonia}, {ubicacion.domicilio.municipio}
                    </p>
                    <p className="ml-4">
                      {ubicacion.domicilio.estado} {ubicacion.domicilio.codigoPostal}, {ubicacion.domicilio.pais}
                    </p>
                    
                    {ubicacion.domicilio.referencia && (
                      <p className="ml-4 text-xs italic">
                        Ref: {ubicacion.domicilio.referencia}
                      </p>
                    )}
                  </div>
                  
                  {/* Información adicional */}
                  <div className="flex items-center space-x-4 mt-2">
                    {ubicacion.fechaHoraSalidaLlegada && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(ubicacion.fechaHoraSalidaLlegada).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {ubicacion.distanciaRecorrida && ubicacion.distanciaRecorrida > 0 && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Navigation className="h-3 w-3" />
                        <span>{ubicacion.distanciaRecorrida} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(index)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
