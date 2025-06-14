
import React from 'react';
import { AutotransporteFormOptimizado } from './AutotransporteFormOptimizado';
import { AutotransporteHeader } from './AutotransporteHeader';
import { AutotransporteValidation } from './AutotransporteValidation';
import { AutotransporteSummary } from './AutotransporteSummary';
import { AutotransporteNavigation } from './AutotransporteNavigation';

interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques?: any[];
}

interface AutotransporteSectionOptimizadaProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSectionOptimizada({ data, onChange, onNext, onPrev }: AutotransporteSectionOptimizadaProps) {
  // Validar que los datos mínimos estén completos
  const isDataComplete = () => {
    return (
      data.placa_vm &&
      data.anio_modelo_vm &&
      data.config_vehicular &&
      data.perm_sct &&
      data.num_permiso_sct &&
      data.asegura_resp_civil &&
      data.poliza_resp_civil
    );
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (!data.placa_vm?.trim()) {
      errors.push('La placa del vehículo es requerida');
    }
    
    if (!data.anio_modelo_vm || data.anio_modelo_vm < 1990) {
      errors.push('El año del modelo es requerido y debe ser válido');
    }
    
    if (!data.config_vehicular?.trim()) {
      errors.push('La configuración vehicular es requerida');
    }
    
    if (!data.perm_sct?.trim()) {
      errors.push('El tipo de permiso SCT es requerido');
    }
    
    if (!data.num_permiso_sct?.trim()) {
      errors.push('El número de permiso SCT es requerido');
    }
    
    if (!data.asegura_resp_civil?.trim()) {
      errors.push('La aseguradora de responsabilidad civil es requerida');
    }
    
    if (!data.poliza_resp_civil?.trim()) {
      errors.push('El número de póliza de responsabilidad civil es requerido');
    }
    
    return errors;
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      'placa_vm',
      'anio_modelo_vm', 
      'config_vehicular',
      'perm_sct',
      'num_permiso_sct',
      'asegura_resp_civil',
      'poliza_resp_civil'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = data[field as keyof AutotransporteCompleto];
      return value && String(value).trim() !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const validationErrors = getValidationErrors();
  const isComplete = isDataComplete();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      <AutotransporteHeader 
        completionPercentage={completionPercentage}
        isComplete={isComplete}
      />

      <AutotransporteFormOptimizado
        data={data}
        onChange={onChange}
      />

      <AutotransporteValidation 
        validationErrors={validationErrors}
        isComplete={isComplete}
      />

      <AutotransporteSummary data={data} />

      <AutotransporteNavigation 
        onNext={onNext}
        onPrev={onPrev}
        isComplete={isComplete}
      />
    </div>
  );
}
