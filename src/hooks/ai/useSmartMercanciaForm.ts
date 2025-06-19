
import { useState, useEffect } from 'react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { mercanciaClassifier } from '@/services/ai/MercanciaClassifierService';
import { useAIContext } from './useAIContext';

export interface SmartMercanciaState {
  showSemarnatFields: boolean;
  showMaterialPeligrosoFields: boolean;
  showRefrigeracionFields: boolean;
  showEspecializadoFields: boolean;
  validationErrors: string[];
  aiSuggestions: string[];
  isDynamic: boolean;
}

export function useSmartMercanciaForm(mercancia: MercanciaCompleta) {
  const { context } = useAIContext();
  const [smartState, setSmartState] = useState<SmartMercanciaState>({
    showSemarnatFields: false,
    showMaterialPeligrosoFields: false,
    showRefrigeracionFields: false,
    showEspecializadoFields: false,
    validationErrors: [],
    aiSuggestions: [],
    isDynamic: true
  });

  // Analizar mercancía y actualizar estado dinámico
  useEffect(() => {
    const analyzeAndUpdateState = async () => {
      if (!mercancia.descripcion || mercancia.descripcion.length < 3) {
        return;
      }

      try {
        // Analizar regulaciones
        const regulaciones = await mercanciaClassifier.analizarRegulaciones(mercancia.descripcion);
        
        // Determinar campos a mostrar
        const newState: SmartMercanciaState = {
          showSemarnatFields: regulaciones.requiere_semarnat || mercancia.material_peligroso,
          showMaterialPeligrosoFields: mercancia.material_peligroso || regulaciones.requiere_semarnat,
          showRefrigeracionFields: detectarNecesidadRefrigeracion(mercancia.descripcion),
          showEspecializadoFields: detectarTransporteEspecializado(mercancia.descripcion),
          validationErrors: generateValidationErrors(mercancia, regulaciones),
          aiSuggestions: regulaciones.regulaciones,
          isDynamic: true
        };

        setSmartState(newState);
      } catch (error) {
        console.error('Error analyzing mercancia:', error);
      }
    };

    const debounceTimer = setTimeout(analyzeAndUpdateState, 800);
    return () => clearTimeout(debounceTimer);
  }, [mercancia.descripcion, mercancia.material_peligroso, context]);

  const detectarNecesidadRefrigeracion = (descripcion: string): boolean => {
    const keywords = ['refrigerad', 'congelad', 'frío', 'cadena de frío', 'temperatura controlada', 'alimento', 'farmacéutico'];
    return keywords.some(keyword => descripcion.toLowerCase().includes(keyword));
  };

  const detectarTransporteEspecializado = (descripcion: string): boolean => {
    const keywords = ['sobrepeso', 'sobredimensión', 'gran volumen', 'maquinaria pesada', 'especializado'];
    return keywords.some(keyword => descripcion.toLowerCase().includes(keyword));
  };

  const generateValidationErrors = (mercancia: MercanciaCompleta, regulaciones: any): string[] => {
    const errors: string[] = [];

    if (!mercancia.descripcion?.trim()) {
      errors.push('La descripción es obligatoria');
    }

    if (!mercancia.bienes_transp?.trim()) {
      errors.push('La clave SAT de bienes transportados es obligatoria');
    }

    if (!mercancia.cantidad || mercancia.cantidad <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }

    if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
      errors.push('El peso debe ser mayor a 0');
    }

    if (regulaciones.requiere_semarnat) {
      if (!mercancia.numero_autorizacion?.trim()) {
        errors.push('Número de autorización SEMARNAT es obligatorio');
      }
      if (!mercancia.folio_acreditacion?.trim()) {
        errors.push('Folio de acreditación SEMARNAT es obligatorio');
      }
    }

    if (mercancia.material_peligroso && !mercancia.cve_material_peligroso?.trim()) {
      errors.push('Clave de material peligroso es obligatoria');
    }

    return errors;
  };

  const getConditionalFields = () => {
    const fields: string[] = [];
    
    if (smartState.showSemarnatFields) {
      fields.push('numero_autorizacion', 'folio_acreditacion');
    }
    
    if (smartState.showMaterialPeligrosoFields) {
      fields.push('cve_material_peligroso', 'embalaje_material_peligroso');
    }
    
    if (smartState.showRefrigeracionFields) {
      fields.push('temperatura_transporte', 'tipo_refrigeracion');
    }
    
    if (smartState.showEspecializadoFields) {
      fields.push('dimensiones_especiales', 'peso_especial');
    }
    
    return fields;
  };

  const isFormValid = (): boolean => {
    return smartState.validationErrors.length === 0;
  };

  return {
    smartState,
    getConditionalFields,
    isFormValid,
    updateSmartState: setSmartState
  };
}
