
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function UbicacionesSection({ data, onChange }: UbicacionesSectionProps) {
  const addUbicacion = () => {
    const nuevaUbicacion = {
      id: crypto.randomUUID(),
      tipo_ubicacion: data.length === 0 ? 'origen' : 'destino',
      rfc: '',
      nombre: '',
      fecha_llegada_salida: '',
      distancia_recorrida: 0
    };
    
    onChange([...data, nuevaUbicacion]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Configure al menos un origen y un destino para el transporte.
        </p>
        <Button onClick={addUbicacion} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Ubicación
        </Button>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No hay ubicaciones configuradas</p>
            <p className="text-sm text-gray-400 mt-1">
              Agregue al menos una ubicación de origen y una de destino
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((ubicacion, index) => (
            <Card key={ubicacion.id || index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Ubicación {index + 1} - {ubicacion.tipo_ubicacion || 'Sin definir'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Configuración de ubicación pendiente de implementación completa
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
