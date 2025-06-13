
import React from 'react';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';

interface CodigoPostalInputOptimizadoProps {
  value?: string;
  onChange?: (value: string) => void;
  onLocationUpdate?: (location: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  coloniaValue?: string;
  onColoniaChange?: (colonia: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  soloCodigoPostal?: boolean;
}

export function CodigoPostalInputOptimizado({
  value = '',
  onChange,
  onLocationUpdate,
  coloniaValue,
  onColoniaChange,
  soloCodigoPostal = true,
  className
}: CodigoPostalInputOptimizadoProps) {
  const [domicilioLocal, setDomicilioLocal] = React.useState<DomicilioUnificado>({
    pais: 'México',
    codigoPostal: value,
    estado: '',
    municipio: '',
    localidad: '',
    colonia: coloniaValue || '',
    calle: '',
    numExterior: '',
    numInterior: '',
    referencia: ''
  });

  React.useEffect(() => {
    setDomicilioLocal(prev => ({ ...prev, codigoPostal: value }));
  }, [value]);

  React.useEffect(() => {
    setDomicilioLocal(prev => ({ ...prev, colonia: coloniaValue || '' }));
  }, [coloniaValue]);

  const handleDomicilioChange = React.useCallback((campo: keyof DomicilioUnificado, valor: string) => {
    setDomicilioLocal(prev => ({ ...prev, [campo]: valor }));
    
    if (campo === 'codigoPostal') {
      onChange?.(valor);
    } else if (campo === 'colonia') {
      onColoniaChange?.(valor);
    }
    
    // Notificar cambios de ubicación
    if (['estado', 'municipio', 'localidad', 'colonia'].includes(campo)) {
      const updatedDomicilio = { ...domicilioLocal, [campo]: valor };
      onLocationUpdate?.({
        estado: updatedDomicilio.estado,
        municipio: updatedDomicilio.municipio,
        localidad: updatedDomicilio.localidad,
        colonia: updatedDomicilio.colonia
      });
    }
  }, [domicilioLocal, onChange, onColoniaChange, onLocationUpdate]);

  if (soloCodigoPostal) {
    // Solo mostrar campos relevantes para CP
    return (
      <FormularioDomicilioUnificado
        domicilio={domicilioLocal}
        onDomicilioChange={handleDomicilioChange}
        camposOpcionales={['localidad', 'calle', 'numExterior', 'numInterior', 'referencia']}
        className={className}
      />
    );
  }

  return (
    <FormularioDomicilioUnificado
      domicilio={domicilioLocal}
      onDomicilioChange={handleDomicilioChange}
      className={className}
    />
  );
}
