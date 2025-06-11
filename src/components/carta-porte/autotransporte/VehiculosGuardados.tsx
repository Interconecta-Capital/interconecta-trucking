
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Truck } from 'lucide-react';
import { useAutotransporte, VehiculoGuardado } from '@/hooks/useAutotransporte';

interface VehiculosGuardadosProps {
  vehiculos: VehiculoGuardado[];
  onCargarVehiculo: (vehiculo: VehiculoGuardado) => void;
  onCerrar: () => void;
}

export function VehiculosGuardados({ 
  vehiculos, 
  onCargarVehiculo, 
  onCerrar 
}: VehiculosGuardadosProps) {
  const { eliminarVehiculo } = useAutotransporte();

  const handleEliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de eliminar este vehículo guardado?')) {
      await eliminarVehiculo(id);
    }
  };

  return (
    <Card className="mb-6 bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Vehículos Guardados</span>
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
          {vehiculos.map((vehiculo) => (
            <Button
              key={vehiculo.id}
              type="button"
              variant="ghost"
              className="text-left justify-start h-auto p-3 relative group"
              onClick={() => onCargarVehiculo(vehiculo)}
            >
              <div className="flex-1">
                <div className="font-medium">{vehiculo.nombre_perfil}</div>
                <div className="text-sm text-muted-foreground">
                  {vehiculo.placa_vm} - {vehiculo.anio_modelo_vm}
                </div>
                <div className="text-xs text-muted-foreground">
                  {vehiculo.config_vehicular}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleEliminar(vehiculo.id, e)}
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
