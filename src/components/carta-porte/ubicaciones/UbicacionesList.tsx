
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, MapPin } from 'lucide-react';
import { UbicacionDistanciaDisplay } from './UbicacionDistanciaDisplay';

interface UbicacionesListProps {
  ubicaciones: any[];
  distanciaTotal?: number;
  onEditarUbicacion: (index: number) => void;
  onEliminarUbicacion: (index: number) => void;
  onAgregarUbicacion: () => void;
}

export function UbicacionesList({
  ubicaciones,
  distanciaTotal,
  onEditarUbicacion,
  onEliminarUbicacion,
  onAgregarUbicacion,
}: UbicacionesListProps) {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Origen': return 'bg-green-100 text-green-800';
      case 'Destino': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (ubicaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay ubicaciones agregadas
        </h3>
        <p className="text-gray-500 mb-4">
          Agrega las ubicaciones de origen, destino y puntos intermedios para tu carta porte.
        </p>
        <Button
          onClick={onAgregarUbicacion}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Primera Ubicación
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ubicaciones.map((ubicacion, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getTipoColor(ubicacion.tipoUbicacion)}>
                    {ubicacion.tipoUbicacion}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {ubicacion.idUbicacion}
                  </span>
                </div>
                
                <h3 className="font-medium text-lg mb-1">
                  {ubicacion.nombreRemitenteDestinatario}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  RFC: {ubicacion.rfcRemitenteDestinatario}
                </p>
                
                <div className="text-sm text-gray-600">
                  <p>
                    {ubicacion.domicilio?.calle} {ubicacion.domicilio?.numExterior}
                    {ubicacion.domicilio?.numInterior && ` Int. ${ubicacion.domicilio.numInterior}`}
                  </p>
                  <p>
                    {ubicacion.domicilio?.colonia}, {ubicacion.domicilio?.municipio}
                  </p>
                  <p>
                    {ubicacion.domicilio?.estado} {ubicacion.domicilio?.codigoPostal}
                  </p>
                </div>

                {ubicacion.fechaHoraSalidaLlegada && (
                  <p className="text-sm text-blue-600 mt-2">
                    {ubicacion.tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}: {' '}
                    {new Date(ubicacion.fechaHoraSalidaLlegada).toLocaleString()}
                  </p>
                )}

                {ubicacion.distanciaRecorrida > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Distancia: {ubicacion.distanciaRecorrida} km
                  </p>
                )}

                {/* ✅ FASE 4: Mostrar componente visual de distancia y coordenadas */}
                <UbicacionDistanciaDisplay 
                  ubicacion={ubicacion}
                  distanciaTotal={distanciaTotal}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEditarUbicacion(index)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEliminarUbicacion(index)}
                  className="text-red-600 hover:text-red-700"
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
