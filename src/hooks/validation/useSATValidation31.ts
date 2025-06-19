import { useCallback } from 'react';
import { CartaPorteData, ValidacionSATv31 } from '@/types/cartaPorte';

export const useSATValidation31 = () => {
  const validateCartaPorte = useCallback((data: CartaPorteData): ValidacionSATv31 => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Convert transporteInternacional to boolean
    const transporteInternacional = typeof data.transporteInternacional === 'string' 
      ? data.transporteInternacional === 'Sí' || data.transporteInternacional === 'true'
      : Boolean(data.transporteInternacional);
    
    if (!data.rfcEmisor) {
      errors.push('RFC Emisor es requerido');
    }

    if (!data.rfcReceptor) {
      errors.push('RFC Receptor es requerido');
    }

    if (!data.ubicaciones || data.ubicaciones.length === 0) {
      warnings.push('No se han agregado ubicaciones');
    }

    if (!data.mercancias || data.mercancias.length === 0) {
      warnings.push('No se han agregado mercancías');
    }

    if (!data.autotransporte) {
      errors.push('Información de autotransporte es requerida');
    } else {
      if (!data.autotransporte.perm_sct) {
        warnings.push('Permiso SCT del autotransporte no especificado');
      }
      if (!data.autotransporte.asegura_resp_civil) {
        warnings.push('Aseguradora de responsabilidad civil no especificada');
      }
    }

    if (transporteInternacional && !data.viaEntradaSalida) {
      errors.push('Vía de entrada/salida es requerida para transporte internacional');
    }

    // Convert registroIstmo to boolean  
    const registroIstmo = typeof data.registroIstmo === 'string'
      ? data.registroIstmo === 'Sí' || data.registroIstmo === 'true'
      : Boolean(data.registroIstmo);

    if (registroIstmo && !data.regimenAduanero) {
      errors.push('Régimen aduanero es requerido para registro Istmo');
    }

    const score = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2));
    
    return {
      errores: errors,
      advertencias: warnings,
      esValido: errors.length === 0,
      scoreComplitud: score
    };
  }, []);

  return { validateCartaPorte };
};
