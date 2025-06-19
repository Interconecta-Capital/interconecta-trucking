
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Trash2 } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';

interface MercanciasSectionProps {
  data: MercanciaCompleta[];
  onChange: (mercancias: MercanciaCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MercanciasSection({ data, onChange, onNext, onPrev }: MercanciasSectionProps) {
  
  const addMercancia = () => {
    const newMercancia: MercanciaCompleta = {
      id: crypto.randomUUID(),
      bienes_transp: '',
      descripcion: '',
      cantidad: 1,
      clave_unidad: 'KGM',
      peso_kg: 0,
      unidad_peso_bruto: 'KGM',
      valor_mercancia: 0,
      moneda: 'MXN'
    };
    onChange([...data, newMercancia]);
  };

  const removeMercancia = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateMercancia = (index: number, field: keyof MercanciaCompleta, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Mercancías
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((mercancia, index) => (
          <div key={mercancia.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Mercancía {index + 1}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeMercancia(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Clave de Bienes</Label>
                <Input
                  value={mercancia.bienes_transp}
                  onChange={(e) => updateMercancia(index, 'bienes_transp', e.target.value)}
                  placeholder="Clave SAT de bienes"
                />
              </div>
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={mercancia.cantidad}
                  onChange={(e) => updateMercancia(index, 'cantidad', parseFloat(e.target.value) || 0)}
                  placeholder="Cantidad"
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={mercancia.descripcion || ''}
                onChange={(e) => updateMercancia(index, 'descripcion', e.target.value)}
                placeholder="Descripción detallada de la mercancía"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  value={mercancia.peso_kg}
                  onChange={(e) => updateMercancia(index, 'peso_kg', parseFloat(e.target.value) || 0)}
                  placeholder="Peso en kilogramos"
                />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={mercancia.valor_mercancia}
                  onChange={(e) => updateMercancia(index, 'valor_mercancia', parseFloat(e.target.value) || 0)}
                  placeholder="Valor de la mercancía"
                />
              </div>
              <div>
                <Label>Moneda</Label>
                <Input
                  value={mercancia.moneda}
                  onChange={(e) => updateMercancia(index, 'moneda', e.target.value)}
                  placeholder="MXN"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addMercancia} variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Agregar Mercancía
        </Button>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Anterior
          </Button>
          <Button onClick={onNext} disabled={data.length === 0}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
