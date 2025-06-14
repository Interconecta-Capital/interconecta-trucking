
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useConfiguracionesVehiculo } from '@/hooks/useCatalogos';

interface Remolque {
  id: string;
  placa: string;
  subtipo_rem: string;
}

interface RemolquesFormProps {
  data: {
    config_vehicular: string;
    remolques: Remolque[];
  };
  onChange: (field: string, value: any) => void;
}

export function RemolquesForm({ data, onChange }: RemolquesFormProps) {
  const { data: configuracionesVehiculares = [] } = useConfiguracionesVehiculo();

  const esConfiguracionConRemolque = () => {
    const config = configuracionesVehiculares.find(c => 
      (c.clave || c.descripcion) === data.config_vehicular
    );
    // Assume configurations with "remolque" or "semi" in description need trailers
    return config?.descripcion?.toLowerCase().includes('remolque') || 
           config?.descripcion?.toLowerCase().includes('semi');
  };

  const agregarRemolque = () => {
    const nuevoRemolque: Remolque = {
      id: `remolque-${Date.now()}`,
      placa: '',
      subtipo_rem: ''
    };
    onChange('remolques', [...data.remolques, nuevoRemolque]);
  };

  const eliminarRemolque = (index: number) => {
    onChange('remolques', data.remolques.filter((_, i) => i !== index));
  };

  const actualizarRemolque = (index: number, campo: string, valor: string) => {
    const remolquesActualizados = data.remolques.map((remolque, i) => 
      i === index ? { ...remolque, [campo]: valor } : remolque
    );
    onChange('remolques', remolquesActualizados);
  };

  if (!esConfiguracionConRemolque()) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Remolques y Semirremolques</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={agregarRemolque}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Remolque
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.remolques.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            La configuración seleccionada requiere remolques. Haz clic en "Agregar Remolque" para comenzar.
          </p>
        ) : (
          <div className="space-y-4">
            {data.remolques.map((remolque: Remolque, index: number) => (
              <div key={remolque.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium">Remolque #{index + 1}</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarRemolque(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`remolque_placa_${index}`}>Placa</Label>
                    <Input
                      id={`remolque_placa_${index}`}
                      value={remolque.placa}
                      onChange={(e) => actualizarRemolque(index, 'placa', e.target.value.toUpperCase())}
                      placeholder="Ej: REM-1234"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`remolque_subtipo_${index}`}>Subtipo de Remolque</Label>
                    <Select 
                      value={remolque.subtipo_rem} 
                      onValueChange={(value) => actualizarRemolque(index, 'subtipo_rem', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona subtipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CTR001">CTR001 - Remolque carga general</SelectItem>
                        <SelectItem value="CTR002">CTR002 - Semirremolque carga general</SelectItem>
                        <SelectItem value="CTR003">CTR003 - Remolque tanque</SelectItem>
                        <SelectItem value="CTR004">CTR004 - Semirremolque tanque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
