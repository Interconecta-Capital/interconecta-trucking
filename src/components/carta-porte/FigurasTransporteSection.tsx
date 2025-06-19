
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Users, Plus } from 'lucide-react';
import { FiguraCompleta } from '@/types/cartaPorte';
import { FiguraTransporteForm } from './figuras/FiguraTransporteForm';

interface FigurasTransporteSectionProps {
  data: FiguraCompleta[];
  onChange: (figuras: FiguraCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FigurasTransporteSection({
  data,
  onChange,
  onNext,
  onPrev
}: FigurasTransporteSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFigura, setEditingFigura] = useState<FiguraCompleta | null>(null);

  const handleAddFigura = () => {
    const newFigura: FiguraCompleta = {
      id: crypto.randomUUID(),
      tipo_figura: '01',
      rfc_transportista: '',
      nombre_transportista: '',
      carta_porte_id: undefined
    };
    setEditingFigura(newFigura);
    setIsDialogOpen(true);
  };

  const handleEditFigura = (figura: FiguraCompleta) => {
    setEditingFigura(figura);
    setIsDialogOpen(true);
  };

  const handleSaveFigura = (figura: FiguraCompleta) => {
    if (editingFigura?.id && data.find(f => f.id === editingFigura.id)) {
      // Actualizar figura existente
      onChange(data.map(f => f.id === figura.id ? figura : f));
    } else {
      // Agregar nueva figura
      onChange([...data, figura]);
    }
    setIsDialogOpen(false);
    setEditingFigura(null);
  };

  const handleDeleteFigura = (id: string) => {
    onChange(data.filter(f => f.id !== id));
  };

  const canContinue = data.length > 0 && data.every(f => f.rfc_transportista && f.tipo_figura);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Figuras de Transporte
              <Badge variant="outline">{data.length} figura(s)</Badge>
            </div>
            <Button onClick={handleAddFigura} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Figura
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay figuras de transporte registradas</p>
              <p className="text-sm">Agrega al menos una figura (conductor, transportista, etc.)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((figura, index) => (
                <Card key={figura.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge>{figura.tipo_figura}</Badge>
                          <span className="font-medium">{figura.nombre_transportista || 'Sin nombre'}</span>
                        </div>
                        <p className="text-sm text-gray-600">RFC: {figura.rfc_transportista}</p>
                        {figura.num_licencia && (
                          <p className="text-sm text-gray-600">Licencia: {figura.num_licencia}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFigura(figura)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFigura(figura.id!)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Requerimientos:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                {data.length > 0 ? '✅' : '❌'} Al menos una figura de transporte
              </div>
              <div className="flex items-center gap-2">
                {data.every(f => f.rfc_transportista && f.tipo_figura) ? '✅' : '❌'} Información completa de todas las figuras
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button 
              onClick={onNext} 
              disabled={!canContinue}
              className="flex items-center gap-2"
            >
              Continuar a Generación
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <FiguraTransporteForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        figura={editingFigura}
        onSave={handleSaveFigura}
      />
    </div>
  );
}
