
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MercanciasSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function MercanciasSection({ data, onChange }: MercanciasSectionProps) {
  const addMercancia = () => {
    const nuevaMercancia = {
      id: crypto.randomUUID(),
      bienes_transp: '',
      descripcion: '',
      cantidad: 0,
      clave_unidad: 'KGM',
      peso_kg: 0,
      moneda: 'MXN',
      valor_mercancia: 0
    };
    
    onChange([...data, nuevaMercancia]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Configure las mercancías que serán transportadas.
        </p>
        <Button onClick={addMercancia} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Mercancía
        </Button>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No hay mercancías configuradas</p>
            <p className="text-sm text-gray-400 mt-1">
              Agregue al menos una mercancía para transportar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((mercancia, index) => (
            <Card key={mercancia.id || index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Mercancía {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Configuración de mercancía pendiente de implementación completa
                </p>
                {mercancia.descripcion && (
                  <p className="text-sm mt-2">{mercancia.descripcion}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
