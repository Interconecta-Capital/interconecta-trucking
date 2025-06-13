
import React, { useEffect } from 'react';
import { FormularioCodigoPostalMexicano } from '@/components/forms/FormularioCodigoPostalMexicano';
import { DatosDomicilio } from '@/hooks/useCodigoPostalMexicano';

interface CodigoPostalMexicanoOptimizadoProps {
  value?: string;
  onChange?: (value: string) => void;
  onLocationUpdate?: (location: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  onDomicilioCompleto?: (domicilio: DatosDomicilio) => void;
  valorInicial?: Partial<DatosDomicilio>;
  mostrarPreview?: boolean;
  className?: string;
}

export const CodigoPostalMexicanoOptimizado: React.FC<CodigoPostalMexicanoOptimizadoProps> = ({
  value = '',
  onChange,
  onLocationUpdate,
  onDomicilioCompleto,
  valorInicial,
  mostrarPreview = true,
  className
}) => {
  const [domicilioLocal, setDomicilioLocal] = React.useState<DatosDomicilio>({
    codigoPostal: value,
    estado: '',
    municipio: '',
    localidad: '',
    colonia: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    referencia: '',
    domicilioCompleto: ''
  });

  // Sincronizar con valor externo
  useEffect(() => {
    if (value !== domicilioLocal.codigoPostal) {
      setDomicilioLocal(prev => ({ ...prev, codigoPostal: value }));
    }
  }, [value, domicilioLocal.codigoPostal]);

  // Manejar cambios del domicilio
  const handleDomicilioChange = React.useCallback((domicilio: DatosDomicilio) => {
    setDomicilioLocal(domicilio);
    
    // Notificar cambio de código postal
    if (onChange && domicilio.codigoPostal !== domicilioLocal.codigoPostal) {
      onChange(domicilio.codigoPostal);
    }
    
    // Notificar cambios de ubicación
    if (onLocationUpdate) {
      onLocationUpdate({
        estado: domicilio.estado,
        municipio: domicilio.municipio,
        localidad: domicilio.localidad,
        colonia: domicilio.colonia
      });
    }
  }, [onChange, onLocationUpdate, domicilioLocal.codigoPostal]);

  // Manejar domicilio completo
  const handleDomicilioCompleto = React.useCallback((domicilio: DatosDomicilio) => {
    console.log('[DOMICILIO_MEXICANO_COMPLETO]', domicilio);
    onDomicilioCompleto?.(domicilio);
  }, [onDomicilioCompleto]);

  return (
    <FormularioCodigoPostalMexicano
      valorInicial={valorInicial || domicilioLocal}
      onDomicilioChange={handleDomicilioChange}
      onDomicilioCompleto={handleDomicilioCompleto}
      mostrarPreview={mostrarPreview}
      className={className}
    />
  );
};

export default CodigoPostalMexicanoOptimizado;
