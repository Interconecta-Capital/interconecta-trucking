
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoBasicFields } from './VehiculoBasicFields';
import { VehiculoSegurosFields } from './VehiculoSegurosFields';
import { VehiculoPermisosSCTFields } from './VehiculoPermisosSCTFields';
import { VehiculoEspecificacionesFields } from './VehiculoEspecificacionesFields';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';

interface VehiculoFormRefactoredProps {
  vehiculoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VehiculoFormRefactored({ vehiculoId, onSuccess, onCancel }: VehiculoFormRefactoredProps) {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    numero_serie_vin: '',
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    vigencia_permiso: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    vigencia_seguro: '',
    capacidad_carga: '',
    tipo_carroceria: '',
    peso_bruto_vehicular: '',
    verificacion_vigencia: '',
    estado: 'disponible'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { crearVehiculo, actualizarVehiculo, vehiculos, loading } = useVehiculos();

  const vehiculoActual = vehiculoId ? vehiculos.find(v => v.id === vehiculoId) : null;

  useEffect(() => {
    if (vehiculoActual) {
      setFormData({
        placa: vehiculoActual.placa || '',
        marca: vehiculoActual.marca || '',
        modelo: vehiculoActual.modelo || '',
        anio: vehiculoActual.anio?.toString() || '',
        numero_serie_vin: vehiculoActual.numero_serie_vin || vehiculoActual.num_serie || '',
        config_vehicular: vehiculoActual.config_vehicular || '',
        perm_sct: vehiculoActual.perm_sct || '',
        num_permiso_sct: vehiculoActual.num_permiso_sct || '',
        vigencia_permiso: vehiculoActual.vigencia_permiso || '',
        asegura_resp_civil: vehiculoActual.asegura_resp_civil || '',
        poliza_resp_civil: vehiculoActual.poliza_resp_civil || vehiculoActual.poliza_seguro || '',
        asegura_med_ambiente: vehiculoActual.asegura_med_ambiente || '',
        poliza_med_ambiente: vehiculoActual.poliza_med_ambiente || '',
        vigencia_seguro: vehiculoActual.vigencia_seguro || '',
        capacidad_carga: vehiculoActual.capacidad_carga?.toString() || '',
        tipo_carroceria: vehiculoActual.tipo_carroceria || '',
        peso_bruto_vehicular: vehiculoActual.peso_bruto_vehicular?.toString() || '',
        verificacion_vigencia: vehiculoActual.verificacion_vigencia || '',
        estado: vehiculoActual.estado || 'disponible'
      });
    }
  }, [vehiculoActual]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.placa?.trim()) {
      newErrors.placa = 'La placa es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const vehiculoData = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : undefined,
        capacidad_carga: formData.capacidad_carga ? parseFloat(formData.capacidad_carga) : undefined,
        peso_bruto_vehicular: formData.peso_bruto_vehicular ? parseFloat(formData.peso_bruto_vehicular) : undefined,
        activo: true
      };

      if (vehiculoId) {
        await actualizarVehiculo({ id: vehiculoId, data: vehiculoData });
      } else {
        await crearVehiculo(vehiculoData);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast.error('Error al guardar el vehículo');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {vehiculoId ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <VehiculoBasicFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />

          <VehiculoPermisosSCTFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />

          <VehiculoSegurosFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />

          <VehiculoEspecificacionesFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />

          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (vehiculoId ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
