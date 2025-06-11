
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User, Truck } from 'lucide-react';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';

interface FigurasListProps {
  figuras: FiguraTransporte[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const tiposFigura: Record<string, { nombre: string; icono: React.ReactNode }> = {
  '01': { nombre: 'Operador', icono: <Truck className="h-4 w-4" /> },
  '02': { nombre: 'Propietario', icono: <User className="h-4 w-4" /> },
  '03': { nombre: 'Arrendador', icono: <User className="h-4 w-4" /> },
  '04': { nombre: 'Notificado', icono: <User className="h-4 w-4" /> },
};

export function FigurasList({ figuras, onEdit, onDelete }: FigurasListProps) {
  if (figuras.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se han agregado figuras del transporte</p>
          <p className="text-sm">Se requiere al menos un operador</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {figuras.map((figura, index) => {
        const tipoInfo = tiposFigura[figura.tipo_figura] || { nombre: 'Desconocido', icono: <User className="h-4 w-4" /> };
        
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {tipoInfo.icono}
                    <Badge variant={figura.tipo_figura === '01' ? 'default' : 'secondary'}>
                      {tipoInfo.nombre}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium">{figura.nombre_figura}</div>
                    <div className="text-sm text-muted-foreground">RFC: {figura.rfc_figura}</div>
                    
                    {figura.num_licencia && (
                      <div className="text-sm text-muted-foreground">
                        Licencia: {figura.num_licencia}
                      </div>
                    )}
                    
                    {figura.domicilio && (
                      <div className="text-sm text-muted-foreground">
                        {figura.domicilio.calle} {figura.domicilio.numero_exterior}
                        {figura.domicilio.numero_interior && ` Int. ${figura.domicilio.numero_interior}`}
                        {figura.domicilio.colonia && `, ${figura.domicilio.colonia}`}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
