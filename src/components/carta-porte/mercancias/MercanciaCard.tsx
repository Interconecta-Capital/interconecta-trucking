
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

interface MercanciaCardProps {
  mercancia: MercanciaCompleta;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function MercanciaCard({ mercancia, index, onEdit, onDelete }: MercanciaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Mercancía {index + 1}</h4>
            {mercancia.material_peligroso && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Material Peligroso
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="font-medium text-sm text-gray-600">Descripción:</p>
            <p className="text-sm">{mercancia.descripcion || 'Sin descripción'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Clave SAT:</p>
              <p>{mercancia.bienes_transp || 'No especificada'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Unidad:</p>
              <p>{mercancia.clave_unidad || 'No especificada'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Cantidad:</p>
              <p>{mercancia.cantidad || 0}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Peso (kg):</p>
              <p>{mercancia.peso_kg || 0}</p>
            </div>
          </div>

          {mercancia.valor_mercancia && mercancia.valor_mercancia > 0 && (
            <div className="pt-2 border-t">
              <p className="font-medium text-gray-600 text-sm">Valor:</p>
              <p className="text-sm">
                ${mercancia.valor_mercancia.toLocaleString()} {mercancia.moneda || 'MXN'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
