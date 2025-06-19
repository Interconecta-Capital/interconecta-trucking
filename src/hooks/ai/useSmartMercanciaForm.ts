
import { useState, useCallback } from 'react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { MercanciaClassifierService } from '@/services/ai/MercanciaClassifierService';

export const useSmartMercanciaForm = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const classifyMercancia = useCallback(async (descripcion: string): Promise<Partial<MercanciaCompleta>> => {
    if (!descripcion?.trim()) return {};

    setIsProcessing(true);
    try {
      const classifier = MercanciaClassifierService.getInstance();
      const result = await classifier.clasificarMercancia(descripcion);

      // Convert result to MercanciaCompleta format
      const mercanciaData: Partial<MercanciaCompleta> = {
        descripcion: result.descripcion,
        bienes_transp: result.bienes_transp,
        clave_unidad: result.clave_unidad,
        material_peligroso: result.material_peligroso,
        cve_material_peligroso: result.cve_material_peligroso,
        fraccion_arancelaria: result.fraccion_arancelaria,
        peso_kg: result.peso_estimado || 0,
        valor_mercancia: result.valor_estimado || 0,
        regulaciones_especiales: result.regulaciones_especiales || [],
        categoria_transporte: result.categoria_transporte || 'general',
        // Add the missing properties with default values
        numero_autorizacion: undefined,
        folio_acreditacion: undefined,
      };

      setSuggestions(result.sugerencias || []);
      return mercanciaData;
    } catch (error) {
      console.error('Error in AI classification:', error);
      return {};
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const applySuggestion = useCallback((suggestion: any, currentData: MercanciaCompleta): MercanciaCompleta => {
    if (!suggestion?.data) return currentData;

    return {
      ...currentData,
      ...suggestion.data,
      // Ensure required fields are present
      numero_autorizacion: suggestion.data.numero_autorizacion || currentData.numero_autorizacion,
      folio_acreditacion: suggestion.data.folio_acreditacion || currentData.folio_acreditacion,
    };
  }, []);

  return {
    isProcessing,
    suggestions,
    classifyMercancia,
    applySuggestion,
    clearSuggestions: () => setSuggestions([])
  };
};
