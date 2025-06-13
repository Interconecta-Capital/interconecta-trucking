
import { useMemo } from 'react';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteValidationOptions {
  formData: CartaPorteData;
}

export function useCartaPorteValidation({ formData }: UseCartaPorteValidationOptions) {
  // Memoizar validaciones para evitar cálculos innecesarios
  const stepValidations = useMemo(() => ({
    configuracion: !!(formData.rfcEmisor && formData.rfcReceptor),
    ubicaciones: formData.ubicaciones.length >= 2,
    mercancias: formData.mercancias.length > 0,
    autotransporte: !!(formData.autotransporte && formData.autotransporte.placaVm),
    figuras: formData.figuras.length > 0,
  }), [formData]);

  const totalProgress = useMemo(() => {
    const completedSteps = Object.values(stepValidations).filter(Boolean).length;
    return (completedSteps / Object.keys(stepValidations).length) * 100;
  }, [stepValidations]);

  return {
    stepValidations,
    totalProgress,
  };
}
