
import { useState, useCallback } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  completionPercentage: number;
}

export const useCartaPorteValidation = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    errors: {},
    warnings: {},
    completionPercentage: 0
  });

  const validateConfiguracion = useCallback((config: any) => {
    const errors: string[] = [];
    
    if (!config?.emisor?.rfc) errors.push('RFC del emisor es requerido');
    if (!config?.receptor?.rfc) errors.push('RFC del receptor es requerido');
    if (!config?.tipoComprobante) errors.push('Tipo de comprobante es requerido');

    return {
      isValid: errors.length === 0,
      errors: errors,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25))
    };
  }, []);

  const validateUbicaciones = useCallback((ubicaciones: any[]) => {
    const errors: string[] = [];
    
    if (!ubicaciones || ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    ubicaciones?.forEach((ubicacion, index) => {
      if (!ubicacion.direccion) errors.push(`Dirección requerida en ubicación ${index + 1}`);
      if (!ubicacion.codigoPostal) errors.push(`Código postal requerido en ubicación ${index + 1}`);
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 15))
    };
  }, []);

  const validateMercancias = useCallback((mercancias: any[]) => {
    const errors: string[] = [];
    
    if (!mercancias || mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
    }

    mercancias?.forEach((mercancia, index) => {
      if (!mercancia.descripcion) errors.push(`Descripción requerida en mercancía ${index + 1}`);
      if (!mercancia.cantidad || mercancia.cantidad <= 0) errors.push(`Cantidad válida requerida en mercancía ${index + 1}`);
      if (!mercancia.peso || mercancia.peso <= 0) errors.push(`Peso válido requerido en mercancía ${index + 1}`);
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10))
    };
  }, []);

  const validateAutotransporte = useCallback((autotransporte: any) => {
    const errors: string[] = [];
    
    if (!autotransporte?.placaVm) errors.push('Placa del vehículo es requerida');
    if (!autotransporte?.configuracionVehicular) errors.push('Configuración vehicular es requerida');
    if (!autotransporte?.seguro?.aseguradora) errors.push('Aseguradora es requerida');
    if (!autotransporte?.seguro?.poliza) errors.push('Número de póliza es requerido');

    return {
      isValid: errors.length === 0,
      errors: errors,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 20))
    };
  }, []);

  const validateFiguras = useCallback((figuras: any[]) => {
    const errors: string[] = [];
    
    if (!figuras || figuras.length === 0) {
      errors.push('Se requiere al menos una figura de transporte');
    }

    const conductor = figuras?.find(f => f.tipoFigura === '01'); // Conductor
    if (!conductor) {
      errors.push('Se requiere un conductor');
    } else {
      if (!conductor.rfc) errors.push('RFC del conductor es requerido');
      if (!conductor.licencia) errors.push('Licencia del conductor es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25))
    };
  }, []);

  const validateComplete = useCallback((formData: any) => {
    const validations = {
      configuracion: validateConfiguracion(formData.configuracion),
      ubicaciones: validateUbicaciones(formData.ubicaciones),
      mercancias: validateMercancias(formData.mercancias),
      autotransporte: validateAutotransporte(formData.autotransporte),
      figuras: validateFiguras(formData.figuras)
    };

    const allErrors: Record<string, string[]> = {};
    const allWarnings: Record<string, string[]> = {};
    let totalScore = 0;
    let sectionCount = 0;

    Object.entries(validations).forEach(([section, result]) => {
      if (result.errors.length > 0) {
        allErrors[section] = result.errors;
      }
      totalScore += result.score;
      sectionCount++;
    });

    const overallScore = Math.round(totalScore / sectionCount);
    const isValid = Object.keys(allErrors).length === 0;

    const result = {
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      completionPercentage: overallScore,
      sectionScores: validations
    };

    setValidationResult(result);
    return result;
  }, [validateConfiguracion, validateUbicaciones, validateMercancias, validateAutotransporte, validateFiguras]);

  return {
    validationResult,
    validateComplete,
    validateConfiguracion,
    validateUbicaciones,
    validateMercancias,
    validateAutotransporte,
    validateFiguras
  };
};
