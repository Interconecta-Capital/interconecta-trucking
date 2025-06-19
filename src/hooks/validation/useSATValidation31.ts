
import { useMemo } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

export const useSATValidation31 = (cartaPorteData: CartaPorteData) => {
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Convert string/boolean to boolean for validation
    const transporteInternacional = Boolean(
      cartaPorteData.transporteInternacional === 'Sí' || 
      cartaPorteData.transporteInternacional === true
    );

    // Basic validations
    if (!cartaPorteData.rfcEmisor) errors.push('RFC del emisor es obligatorio');
    if (!cartaPorteData.nombreEmisor) errors.push('Nombre del emisor es obligatorio');
    if (!cartaPorteData.rfcReceptor) errors.push('RFC del receptor es obligatorio');
    if (!cartaPorteData.nombreReceptor) errors.push('Nombre del receptor es obligatorio');

    // Ubicaciones validation
    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    // Transport validation
    if (transporteInternacional) {
      if (!cartaPorteData.pais_origen_destino) {
        errors.push('País de origen/destino es obligatorio para transporte internacional');
      }
    }

    // Mercancias validation
    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
    } else {
      cartaPorteData.mercancias.forEach((mercancia, index) => {
        if (!mercancia.descripcion) {
          errors.push(`Descripción de mercancía ${index + 1} es obligatoria`);
        }
        if (!mercancia.fraccion_arancelaria) {
          warnings.push(`Fracción arancelaria recomendada para mercancía ${index + 1}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }, [cartaPorteData]);

  return validation;
};
