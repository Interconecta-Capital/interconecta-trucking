
import { useMemo } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

interface UseCartaPorteValidationEnhancedOptions {
  data: CartaPorteData;
  enableAI?: boolean;
}

export const useCartaPorteValidationEnhanced = ({ 
  data: cartaPorteData, 
  enableAI = true 
}: UseCartaPorteValidationEnhancedOptions) => {
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (!cartaPorteData.rfcEmisor) errors.push('RFC del emisor es obligatorio');
    if (!cartaPorteData.nombreEmisor) errors.push('Nombre del emisor es obligatorio');
    if (!cartaPorteData.rfcReceptor) errors.push('RFC del receptor es obligatorio');
    if (!cartaPorteData.nombreReceptor) errors.push('Nombre del receptor es obligatorio');

    // Ubicaciones validation
    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    // Distance validation - use total_distancia_recorrida
    const totalDistance = cartaPorteData.total_distancia_recorrida || 0;
    if (totalDistance <= 0) {
      warnings.push('Distancia total debe ser mayor a 0');
    }

    // Mercancias validation
    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }, [cartaPorteData, enableAI]);

  return validation;
};
