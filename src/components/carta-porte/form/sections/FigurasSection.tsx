
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { FiguraCompleta } from '@/types/cartaPorte';

interface FigurasSectionProps {
  figuras: FiguraCompleta[];
  onChange: (figuras: FiguraCompleta[]) => void;
}

export function FigurasSection({ figuras, onChange }: FigurasSectionProps) {
  const addFigura = () => {
    const newFigura: FiguraCompleta = {
      id: Date.now().toString(),
      tipo_figura: 'Operador',
      rfc_figura: '',
      nombre_figura: '',
      num_licencia: '',
      tipo_licencia: 'A'
    };
    onChange([...figuras, newFigura]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Figuras del Transporte
            </CardTitle>
            <Button onClick={addFigura} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Figura
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {figuras.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>No hay figuras configuradas</p>
              <p className="text-sm">Agrega al menos una figura de transporte (conductor, propietario, etc.)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {figuras.map((figura, index) => (
                <div key={figura.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">
                    {figura.tipo_figura} {index + 1}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    RFC: {figura.rfc_figura || 'No especificado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nombre: {figura.nombre_figura || 'No especificado'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
