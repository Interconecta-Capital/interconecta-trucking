
import { useMemo, useCallback } from 'react';
import { XMLValidatorSAT, ValidationResult } from '@/services/xml/xmlValidatorSAT';
import { CartaPorteData } from '@/types/cartaPorte';

interface ValidationSummary {
  isComplete: boolean;
  completionPercentage: number;
  sectionStatus: {
    configuracion: 'complete' | 'partial' | 'empty';
    ubicaciones: 'complete' | 'partial' | 'empty';
    mercancias: 'complete' | 'partial' | 'empty';
    autotransporte: 'complete' | 'partial' | 'empty';
    figuras: 'complete' | 'partial' | 'empty';
  };
  nextRequiredAction: string;
  criticalErrors: string[];
  warnings: string[];
}

export const useCartaPorteValidation = () => {
  const validateComplete = useCallback((data: CartaPorteData): ValidationResult => {
    return XMLValidatorSAT.validateCartaPorteCompliance(data);
  }, []);

  const validateSection = useCallback((section: string, data: any): ValidationResult => {
    // Validaciones específicas por sección
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (section) {
      case 'configuracion':
        if (!data.rfcEmisor) errors.push('RFC del emisor requerido');
        if (!data.nombreEmisor) errors.push('Nombre del emisor requerido');
        if (!data.rfcReceptor) errors.push('RFC del receptor requerido');
        if (!data.nombreReceptor) errors.push('Nombre del receptor requerido');
        if (!data.tipoCfdi) errors.push('Tipo de CFDI requerido');
        break;

      case 'ubicaciones':
        if (!data || data.length < 2) {
          errors.push('Se requieren al menos 2 ubicaciones');
        } else {
          const origen = data.find((u: any) => u.tipo_ubicacion === 'Origen');
          const destino = data.find((u: any) => u.tipo_ubicacion === 'Destino');
          if (!origen) errors.push('Ubicación de origen requerida');
          if (!destino) errors.push('Ubicación de destino requerida');
        }
        break;

      case 'mercancias':
        if (!data || data.length === 0) {
          errors.push('Se requiere al menos una mercancía');
        } else {
          data.forEach((m: any, i: number) => {
            if (!m.bienes_transp) errors.push(`Descripción requerida en mercancía ${i + 1}`);
            if (!m.cantidad || m.cantidad <= 0) errors.push(`Cantidad inválida en mercancía ${i + 1}`);
          });
        }
        break;

      case 'autotransporte':
        if (!data.placa_vm) errors.push('Placa del vehículo requerida');
        if (!data.config_vehicular) errors.push('Configuración vehicular requerida');
        if (!data.asegura_resp_civil) warnings.push('Aseguradora recomendada');
        break;

      case 'figuras':
        if (!data || data.length === 0) {
          errors.push('Se requiere al menos una figura de transporte');
        } else {
          data.forEach((f: any, i: number) => {
            if (!f.rfc_figura) errors.push(`RFC requerido en figura ${i + 1}`);
            if (!f.nombre_figura) errors.push(`Nombre requerido en figura ${i + 1}`);
          });
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details: []
    };
  }, []);

  const getValidationSummary = useCallback((data: CartaPorteData): ValidationSummary => {
    const sectionValidations = {
      configuracion: validateSection('configuracion', data),
      ubicaciones: validateSection('ubicaciones', data.ubicaciones),
      mercancias: validateSection('mercancias', data.mercancias),
      autotransporte: validateSection('autotransporte', data.autotransporte),
      figuras: validateSection('figuras', data.figuras),
    };

    // Calcular estado de cada sección
    const sectionStatus = Object.entries(sectionValidations).reduce((acc, [key, validation]) => {
      if (validation.isValid) {
        acc[key as keyof typeof acc] = 'complete';
      } else if (validation.errors.length > 0) {
        // Determinar si hay datos parciales
        const hasPartialData = this.hasPartialData(key, data);
        acc[key as keyof typeof acc] = hasPartialData ? 'partial' : 'empty';
      } else {
        acc[key as keyof typeof acc] = 'empty';
      }
      return acc;
    }, {} as ValidationSummary['sectionStatus']);

    // Calcular porcentaje de completitud
    const totalSections = Object.keys(sectionStatus).length;
    const completeSections = Object.values(sectionStatus).filter(status => status === 'complete').length;
    const partialSections = Object.values(sectionStatus).filter(status => status === 'partial').length;
    
    const completionPercentage = Math.round(
      ((completeSections * 100) + (partialSections * 50)) / (totalSections * 100) * 100
    );

    // Determinar siguiente acción requerida
    let nextRequiredAction = 'Formulario completo';
    if (sectionStatus.configuracion !== 'complete') {
      nextRequiredAction = 'Complete los datos básicos del emisor y receptor';
    } else if (sectionStatus.ubicaciones !== 'complete') {
      nextRequiredAction = 'Agregue las ubicaciones de origen y destino';
    } else if (sectionStatus.mercancias !== 'complete') {
      nextRequiredAction = 'Especifique las mercancías a transportar';
    } else if (sectionStatus.autotransporte !== 'complete') {
      nextRequiredAction = 'Complete la información del vehículo';
    } else if (sectionStatus.figuras !== 'complete') {
      nextRequiredAction = 'Agregue las figuras de transporte';
    }

    // Errores críticos (que bloquean el progreso)
    const criticalErrors = Object.values(sectionValidations)
      .flatMap(v => v.errors)
      .filter(error => this.isCriticalError(error));

    // Advertencias
    const warnings = Object.values(sectionValidations)
      .flatMap(v => v.warnings);

    return {
      isComplete: completeSections === totalSections,
      completionPercentage,
      sectionStatus,
      nextRequiredAction,
      criticalErrors,
      warnings
    };
  }, [validateSection]);

  // Función auxiliar para determinar datos parciales
  const hasPartialData = useCallback((section: string, data: CartaPorteData): boolean => {
    switch (section) {
      case 'configuracion':
        return !!(data.rfcEmisor || data.nombreEmisor || data.rfcReceptor || data.nombreReceptor);
      case 'ubicaciones':
        return !!(data.ubicaciones && data.ubicaciones.length > 0);
      case 'mercancias':
        return !!(data.mercancias && data.mercancias.length > 0);
      case 'autotransporte':
        return !!(data.autotransporte && (data.autotransporte.placa_vm || data.autotransporte.config_vehicular));
      case 'figuras':
        return !!(data.figuras && data.figuras.length > 0);
      default:
        return false;
    }
  }, []);

  // Función auxiliar para identificar errores críticos
  const isCriticalError = useCallback((error: string): boolean => {
    const criticalKeywords = ['requerido', 'obligatorio', 'inválido', 'falta'];
    return criticalKeywords.some(keyword => error.toLowerCase().includes(keyword));
  }, []);

  return {
    validateComplete,
    validateSection,
    getValidationSummary,
  };
};
