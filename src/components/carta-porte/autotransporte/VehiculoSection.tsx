
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { useConfiguracionesVehiculo } from '@/hooks/useCatalogos';
import { VehicleValidator } from '@/utils/vehicleValidation';
import { AutotransporteData } from '@/hooks/useAutotransporte';

interface VehiculoSectionProps {
  data: AutotransporteData;
  onChange: (data: Partial<AutotransporteData>) => void;
}

export function VehiculoSection({ data, onChange }: VehiculoSectionProps) {
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string[]>>({});
  const { data: configuraciones } = useConfiguracionesVehiculo();

  const handlePlacaChange = (value: string) => {
    const placaFormateada = VehicleValidator.formatearPlaca(value);
    const validacion = VehicleValidator.validarPlaca(placaFormateada);
    
    setErroresValidacion(prev => ({
      ...prev,
      placa_vm: validacion.errores
    }));

    onChange({ placa_vm: placaFormateada });
  };

  const handleAnioChange = (value: string) => {
    const anio = parseInt(value, 10);
    const validacion = VehicleValidator.validarAnioModelo(anio);
    
    setErroresValidacion(prev => ({
      ...prev,
      anio_modelo_vm: validacion.errores
    }));

    onChange({ anio_modelo_vm: anio });
  };

  const handleConfiguracionChange = (configuracion: any) => {
    onChange({ config_vehicular: configuracion.clave });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Datos del Vehículo Motor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="placa_vm">Placa del Vehículo Motor *</Label>
          <Input
            id="placa_vm"
            value={data.placa_vm || ''}
            onChange={(e) => handlePlacaChange(e.target.value)}
            placeholder="ABC-1234"
            className={erroresValidacion.placa_vm?.length ? 'border-red-500' : ''}
          />
          {erroresValidacion.placa_vm?.map((error, index) => (
            <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
          ))}
        </div>

        <div>
          <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
          <Input
            id="anio_modelo_vm"
            type="number"
            value={data.anio_modelo_vm || ''}
            onChange={(e) => handleAnioChange(e.target.value)}
            placeholder="2024"
            min="1990"
            max={new Date().getFullYear() + 1}
            className={erroresValidacion.anio_modelo_vm?.length ? 'border-red-500' : ''}
          />
          {erroresValidacion.anio_modelo_vm?.map((error, index) => (
            <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
          ))}
        </div>
      </div>

      <div>
        <Label>Configuración Vehicular *</Label>
        <CatalogoSelector
          items={configuraciones || []}
          value={data.config_vehicular}
          onSelect={handleConfiguracionChange}
          placeholder="Seleccionar configuración vehicular..."
          searchPlaceholder="Buscar configuración..."
          displayFormat={(item) => `${item.clave} - ${item.descripcion}`}
        />
      </div>
    </div>
  );
}
