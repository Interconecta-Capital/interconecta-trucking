import { useMemo } from 'react';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export const useViajeWizardValidation = (data: ViajeWizardData, currentStep: number) => {
  
  const validateStep1 = useMemo(() => {
    return {
      isValid: !!(data.cliente?.rfc && data.tipoServicio && data.descripcionMercancia),
      errors: {
        cliente: !data.cliente?.rfc ? 'Cliente es requerido' : null,
        tipoServicio: !data.tipoServicio ? 'Tipo de servicio es requerido' : null,
        descripcionMercancia: !data.descripcionMercancia ? 'Descripción de mercancía es requerida' : null
      }
    };
  }, [data.cliente, data.tipoServicio, data.descripcionMercancia]);

  const validateStep2 = useMemo(() => {
    const ubicaciones = data.ubicaciones || [];
    const origen = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
    const destino = ubicaciones.find(u => u.tipoUbicacion === 'Destino');

    return {
      isValid: !!(origen?.domicilio?.codigoPostal && destino?.domicilio?.codigoPostal && data.distanciaRecorrida && data.distanciaRecorrida > 0),
      errors: {
        origen: !origen?.domicilio?.codigoPostal ? 'Origen es requerido' : null,
        destino: !destino?.domicilio?.codigoPostal ? 'Destino es requerido' : null,
        distancia: (!data.distanciaRecorrida || data.distanciaRecorrida <= 0) ? 'Distancia debe ser mayor a 0' : null
      }
    };
  }, [data.ubicaciones, data.distanciaRecorrida]);

  const validateStep3 = useMemo(() => {
    return {
      isValid: !!(data.vehiculo?.id && data.conductor?.id),
      errors: {
        vehiculo: !data.vehiculo?.id ? 'Vehículo es requerido' : null,
        conductor: !data.conductor?.id ? 'Conductor es requerido' : null
      }
    };
  }, [data.vehiculo, data.conductor]);

  const currentStepValidation = useMemo(() => {
    switch (currentStep) {
      case 1: return validateStep1;
      case 2: return validateStep2;
      case 3: return validateStep3;
      default: return { isValid: true, errors: {} };
    }
  }, [currentStep, validateStep1, validateStep2, validateStep3]);

  const isWizardComplete = useMemo(() => {
    return validateStep1.isValid && validateStep2.isValid && validateStep3.isValid;
  }, [validateStep1, validateStep2, validateStep3]);

  return { validateStep1, validateStep2, validateStep3, currentStepValidation, isWizardComplete };
};
