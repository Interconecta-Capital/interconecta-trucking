
import React from 'react';
import { VehiculoMotorForm } from './VehiculoMotorForm';
import { PermisoSCTForm } from './PermisoSCTForm';
import { SegurosForm } from './SegurosForm';
import { RemolquesForm } from './RemolquesForm';

interface AutotransporteFormOptimizadoProps {
  data: any;
  onChange: (data: any) => void;
}

interface Remolque {
  id: string;
  placa: string;
  subtipo_rem: string;
}

export function AutotransporteFormOptimizado({ data, onChange }: AutotransporteFormOptimizadoProps) {
  const [formData, setFormData] = React.useState({
    placa_vm: data?.placa_vm || '',
    anio_modelo_vm: data?.anio_modelo_vm || new Date().getFullYear(),
    config_vehicular: data?.config_vehicular || '',
    perm_sct: data?.perm_sct || '',
    num_permiso_sct: data?.num_permiso_sct || '',
    asegura_resp_civil: data?.asegura_resp_civil || '',
    poliza_resp_civil: data?.poliza_resp_civil || '',
    asegura_med_ambiente: data?.asegura_med_ambiente || '',
    poliza_med_ambiente: data?.poliza_med_ambiente || '',
    remolques: data?.remolques || []
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'placa_vm':
        if (!value?.trim()) {
          newErrors[field] = 'La placa del vehículo es requerida';
        } else if (!/^[A-Z0-9]{6,7}$/.test(value.replace(/[-\s]/g, ''))) {
          newErrors[field] = 'Formato de placa inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'anio_modelo_vm':
        const currentYear = new Date().getFullYear();
        if (!value || value < 1990 || value > currentYear + 1) {
          newErrors[field] = `Año debe estar entre 1990 y ${currentYear + 1}`;
        } else {
          delete newErrors[field];
        }
        break;
      case 'config_vehicular':
        if (!value?.trim()) {
          newErrors[field] = 'La configuración vehicular es requerida';
        } else {
          delete newErrors[field];
        }
        break;
      case 'perm_sct':
        if (!value?.trim()) {
          newErrors[field] = 'El tipo de permiso SCT es requerido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'num_permiso_sct':
        if (!value?.trim()) {
          newErrors[field] = 'El número de permiso SCT es requerido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'asegura_resp_civil':
        if (!value?.trim()) {
          newErrors[field] = 'La aseguradora de responsabilidad civil es requerida';
        } else {
          delete newErrors[field];
        }
        break;
      case 'poliza_resp_civil':
        if (!value?.trim()) {
          newErrors[field] = 'El número de póliza de responsabilidad civil es requerido';
        } else {
          delete newErrors[field];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  return (
    <div className="space-y-6">
      <VehiculoMotorForm 
        data={formData}
        onChange={handleFieldChange}
        errors={errors}
      />
      
      <PermisoSCTForm 
        data={formData}
        onChange={handleFieldChange}
        errors={errors}
      />
      
      <SegurosForm 
        data={formData}
        onChange={handleFieldChange}
        errors={errors}
      />
      
      <RemolquesForm 
        data={formData}
        onChange={handleFieldChange}
      />
    </div>
  );
}
