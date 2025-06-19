
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';

interface MercanciasSectionProps {
  mercancias: MercanciaCompleta[];
  onChange: (mercancias: MercanciaCompleta[]) => void;
}

export function MercanciasSection({ mercancias, onChange }: MercanciasSectionProps) {
  const addMercancia = () => {
    const newMercancia: MercanciaCompleta = {
      id: Date.now().toString(),
      descripcion: '',
      bienes_transp: '',
      clave_unidad: '',
      cantidad: 0,
      peso_kg: 0,
      valor_mercancia: 0,
      material_peligroso: false
    };
    onChange([...mercancias, newMercancia]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mercancías a Transportar
            </CardTitle>
            <Button onClick={addMercancia} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Mercancía
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mercancias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No hay mercancías configuradas</p>
              <p className="text-sm">Agrega al menos una mercancía para transportar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mercancias.map((mercancia, index) => (
                <div key={mercancia.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Mercancía {index + 1}</h4>
                  <p className="text-sm text-muted-foreground">
                    Descripción: {mercancia.descripcion || 'No especificada'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {mercancia.cantidad} - Peso: {mercancia.peso_kg} kg
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
