
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MercanciaCompleta {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia?: number;
  material_peligroso?: boolean;
  moneda?: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
}

interface MercanciasListProps {
  data: MercanciaCompleta[];
  onEditMercancia: (index: number) => void;
  onRemoveMercancia: (index: number) => void;
}

export function MercanciasList({ 
  data, 
  onEditMercancia, 
  onRemoveMercancia 
}: MercanciasListProps) {
  return (
    <div className="space-y-3">
      {data.map((mercancia, index) => (
        <Card key={mercancia.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Mercancía #{index + 1}</h4>
                  {mercancia.material_peligroso && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      Material Peligroso
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {mercancia.descripcion}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cantidad:</span>
                    <span className="ml-1 font-medium">{mercancia.cantidad}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peso:</span>
                    <span className="ml-1 font-medium">{mercancia.peso_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Unit.:</span>
                    <span className="ml-1 font-medium">
                      ${(mercancia.valor_mercancia || 0).toLocaleString('es-MX')} {mercancia.moneda || 'MXN'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clave SAT:</span>
                    <span className="ml-1 font-medium">{mercancia.bienes_transp}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEditMercancia(index)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveMercancia(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
