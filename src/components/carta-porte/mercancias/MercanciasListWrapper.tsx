
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2, AlertTriangle, Hash } from 'lucide-react';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciasListWrapperProps {
  mercancias: Mercancia[];
  onEdit: (mercancia: Mercancia) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function MercanciasListWrapper({
  mercancias,
  onEdit,
  onDelete,
  isLoading
}: MercanciasListWrapperProps) {
  if (mercancias.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          No hay mercancías agregadas. Agrega mercancías manualmente o importa desde un documento.
        </p>
      </div>
    );
  }

  const calcularTotales = () => {
    return {
      totalCantidad: mercancias.reduce((sum, m) => sum + (m.cantidad || 0), 0),
      totalPeso: mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0),
      totalValor: mercancias.reduce((sum, m) => sum + ((m.cantidad || 0) * (m.valor_mercancia || 0)), 0),
      materialesPeligrosos: mercancias.filter(m => m.material_peligroso).length
    };
  };

  const totales = calcularTotales();

  return (
    <div className="space-y-4">
      {/* Lista de mercancías */}
      <div className="space-y-3">
        {mercancias.map((mercancia, index) => (
          <Card key={mercancia.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">Mercancía #{index + 1}</h4>
                    {mercancia.material_peligroso && (
                      <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Material Peligroso
                      </Badge>
                    )}
                    {mercancia.codigo_producto && (
                      <Badge variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {mercancia.codigo_producto}
                      </Badge>
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
                        ${mercancia.valor_mercancia?.toLocaleString('es-MX')} {mercancia.moneda}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clave SAT:</span>
                      <span className="ml-1 font-medium">{mercancia.bienes_transp}</span>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-2 text-xs text-gray-600">
                    {mercancia.embalaje && (
                      <span className="mr-4">Embalaje: {mercancia.embalaje}</span>
                    )}
                    {mercancia.fraccion_arancelaria && (
                      <span className="mr-4">Fracción: {mercancia.fraccion_arancelaria}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(mercancia)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => mercancia.id && onDelete(mercancia.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen de totales */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-4 w-4" />
            Resumen de Mercancías
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Artículos:</span>
              <span className="ml-1 font-medium">{mercancias.length}</span>
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
              <span className="text-orange-800 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Contiene {totales.materialesPeligrosos} material(es) peligroso(s)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
