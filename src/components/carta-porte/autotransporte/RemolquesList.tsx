
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Truck } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { RemolqueCompleto } from '@/types/cartaPorte';

interface RemolquesListProps {
  remolques: RemolqueCompleto[];
  onChange: (remolques: RemolqueCompleto[]) => void;
}

export function RemolquesList({ remolques, onChange }: RemolquesListProps) {
  const addRemolque = () => {
    const newRemolque: RemolqueCompleto = {
      id: crypto.randomUUID(),
      subtipo_rem: '',
      placa: ''
    };
    onChange([...remolques, newRemolque]);
  };

  const removeRemolque = (index: number) => {
    const updatedRemolques = remolques.filter((_, i) => i !== index);
    onChange(updatedRemolques);
  };

  const updateRemolque = (index: number, field: keyof RemolqueCompleto, value: string) => {
    const updatedRemolques = remolques.map((remolque, i) =>
      i === index ? { ...remolque, [field]: value } : remolque
    );
    onChange(updatedRemolques);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Remolques
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRemolque}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Remolque
        </Button>
      </div>

      {remolques.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay remolques agregados
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {remolques.map((remolque, index) => (
            <Card key={remolque.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Remolque {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRemolque(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CatalogoSelectorMejorado
                    tipo="remolques"
                    label="Subtipo de Remolque"
                    value={remolque.subtipo_rem}
                    onValueChange={(value) => updateRemolque(index, 'subtipo_rem', value)}
                    placeholder="Seleccionar subtipo..."
                    required
                  />

                  <div className="space-y-2">
                    <Label htmlFor={`placa_remolque_${index}`}>
                      Placa del Remolque
                    </Label>
                    <Input
                      id={`placa_remolque_${index}`}
                      value={remolque.placa}
                      onChange={(e) => updateRemolque(index, 'placa', e.target.value.toUpperCase())}
                      placeholder="Ej: ABC-123"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
