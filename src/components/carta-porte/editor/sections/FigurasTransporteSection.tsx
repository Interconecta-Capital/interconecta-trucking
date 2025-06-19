
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FigurasTransporteSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function FigurasTransporteSection({ data, onChange }: FigurasTransporteSectionProps) {
  const addFigura = () => {
    const nuevaFigura = {
      id: crypto.randomUUID(),
      tipo_figura: 'Operador',
      rfc_figura: '',
      nombre_figura: '',
      num_licencia: '',
      residencia_fiscal_figura: 'MEX'
    };
    
    onChange([...data, nuevaFigura]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Configure las figuras del transporte (operadores, propietarios, etc.).
        </p>
        <Button onClick={addFigura} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Figura
        </Button>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No hay figuras configuradas</p>
            <p className="text-sm text-gray-400 mt-1">
              Agregue al menos una figura de transporte
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((figura, index) => (
            <Card key={figura.id || index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {figura.tipo_figura || 'Figura'} {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Configuración de figura pendiente de implementación completa
                </p>
                {figura.nombre_figura && (
                  <p className="text-sm mt-2">{figura.nombre_figura}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
