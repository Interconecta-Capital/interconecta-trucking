
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, User, Truck } from 'lucide-react';
import { useFigurasTransporte, FiguraFrecuente } from '@/hooks/useFigurasTransporte';

interface FigurasFrecuentesProps {
  figuras: FiguraFrecuente[];
  onCargarFigura: (figura: FiguraFrecuente) => void;
  onCerrar: () => void;
}

const tiposFigura: Record<string, { nombre: string; icono: React.ReactNode }> = {
  '01': { nombre: 'Operador', icono: <Truck className="h-4 w-4" /> },
  '02': { nombre: 'Propietario', icono: <User className="h-4 w-4" /> },
  '03': { nombre: 'Arrendador', icono: <User className="h-4 w-4" /> },
  '04': { nombre: 'Notificado', icono: <User className="h-4 w-4" /> },
};

export function FigurasFrecuentes({ 
  figuras, 
  onCargarFigura, 
  onCerrar 
}: FigurasFrecuentesProps) {
  const { eliminarFiguraFrecuente } = useFigurasTransporte();

  const handleEliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de eliminar esta figura frecuente?')) {
      await eliminarFiguraFrecuente(id);
    }
  };

  return (
    <Card className="mb-6 bg-purple-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Figuras Frecuentes</span>
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCerrar}
          >
            ✕
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {figuras.map((figura) => {
            const tipoInfo = tiposFigura[figura.tipo_figura] || { nombre: 'Desconocido', icono: <User className="h-4 w-4" /> };
            
            return (
              <Button
                key={figura.id}
                type="button"
                variant="ghost"
                className="text-left justify-start h-auto p-3 relative group"
                onClick={() => onCargarFigura(figura)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {tipoInfo.icono}
                    <Badge variant={figura.tipo_figura === '01' ? 'default' : 'secondary'} className="text-xs">
                      {tipoInfo.nombre}
                    </Badge>
                  </div>
                  
                  <div className="font-medium">{figura.nombre_figura}</div>
                  <div className="text-sm text-muted-foreground">RFC: {figura.rfc_figura}</div>
                  
                  {figura.num_licencia && (
                    <div className="text-xs text-muted-foreground">
                      Licencia: {figura.num_licencia}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Usado {figura.uso_count} {figura.uso_count === 1 ? 'vez' : 'veces'}
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleEliminar(figura.id, e)}
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
