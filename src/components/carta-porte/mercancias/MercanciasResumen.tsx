
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

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

interface Totales {
  totalCantidad: number;
  totalPeso: number;
  totalValor: number;
  materialesPeligrosos: number;
}

interface MercanciasResumenProps {
  data: MercanciaCompleta[];
  totales: Totales;
}

export function MercanciasResumen({ data, totales }: MercanciasResumenProps) {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Resumen de Mercancías
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Artículos:</span>
            <span className="ml-1 font-medium">{data.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cantidad Total:</span>
            <span className="ml-1 font-medium">{totales.totalCantidad.toLocaleString('es-MX')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Peso Total:</span>
            <span className="ml-1 font-medium">{totales.totalPeso.toLocaleString('es-MX')} kg</span>
          </div>
          <div>
            <span className="text-muted-foreground">Valor Total:</span>
            <span className="ml-1 font-medium">
              ${totales.totalValor.toLocaleString('es-MX')}
            </span>
          </div>
        </div>

        {totales.materialesPeligrosos > 0 && (
          <div className="mt-3 p-2 bg-orange-100 rounded text-sm">
            <span className="text-orange-800">
              ⚠️ Contiene {totales.materialesPeligrosos} material(es) peligroso(s)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
