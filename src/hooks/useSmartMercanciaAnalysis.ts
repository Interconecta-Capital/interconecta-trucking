
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MercanciaAnalizada {
  descripcion: string;
  claveProdServ: string;
  claveUnidad: string;
  pesoKg: number;
  cantidad: number;
  valorMercancia: number;
  confianza: 'alta' | 'media' | 'baja';
}

interface AnalysisResult {
  mercancias: MercanciaAnalizada[];
  sugerencias: string[];
  errores: string[];
}

export const useSmartMercanciaAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  const analyzeDescription = useCallback(async (descripcion: string): Promise<AnalysisResult> => {
    if (!descripcion.trim()) {
      return { mercancias: [], sugerencias: [], errores: ['Descripción vacía'] };
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🤖 Iniciando análisis inteligente de mercancías:', descripcion);

      // Llamar al Edge Function de Gemini para análisis
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          message: `Analiza esta descripción de mercancías para transporte y extrae la información estructurada:

Descripción: "${descripcion}"

INSTRUCCIONES ESPECÍFICAS:
1. Si encuentras múltiples productos (ej: "30 ton de pepino y 10 de sandía"), sepáralos en entradas distintas
2. Para cada producto identifica:
   - Descripción específica del producto
   - Peso aproximado en kg
   - Cantidad de unidades
   - Clave de Producto SAT más probable (formato: código de 8 dígitos)
   - Unidad de medida SAT más probable (código de 3 letras como KGM, TNE, PZA)
   - Valor comercial estimado en pesos mexicanos

3. CÓDIGOS SAT COMUNES DE REFERENCIA:
   - Frutas y verduras: 01011601 (Frutas frescas), 01021501 (Verduras frescas)
   - Cereales: 01010101 (Trigo), 01010201 (Maíz)
   - Materiales construcción: 30161501 (Cemento), 30111501 (Arena)
   - Textiles: 53102600 (Ropa), 11141600 (Telas)
   - Electrónicos: 43211501 (Computadoras), 52141500 (Celulares)

4. UNIDADES SAT COMUNES:
   - KGM (Kilogramo), TNE (Tonelada), PZA (Pieza), LTR (Litro), MTR (Metro)

Responde SOLO con un JSON válido en este formato:
{
  "mercancias": [
    {
      "descripcion": "Descripción específica",
      "claveProdServ": "código SAT",
      "claveUnidad": "unidad SAT", 
      "pesoKg": número,
      "cantidad": número,
      "valorMercancia": número,
      "confianza": "alta|media|baja"
    }
  ],
  "sugerencias": ["texto de sugerencias"],
  "errores": ["errores si los hay"]
}`,
          context: 'mercancia_analysis'
        }
      });

      if (error) {
        console.error('❌ Error en análisis IA:', error);
        return {
          mercancias: [],
          sugerencias: [],
          errores: ['Error en el análisis inteligente. Intente nuevamente.']
        };
      }

      // Parsear respuesta de la IA
      let analysisResult: AnalysisResult;
      try {
        const aiResponse = data.response || data.message || '';
        console.log('🤖 Respuesta IA cruda:', aiResponse);
        
        // Extraer JSON de la respuesta
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No se encontró JSON válido en la respuesta');
        }
        
        analysisResult = JSON.parse(jsonMatch[0]);
        
        // Validar estructura
        if (!analysisResult.mercancias || !Array.isArray(analysisResult.mercancias)) {
          throw new Error('Estructura de respuesta inválida');
        }

        console.log('✅ Análisis completado:', analysisResult);

      } catch (parseError) {
        console.error('❌ Error parsing IA response:', parseError);
        
        // Fallback: crear mercancía básica
        analysisResult = {
          mercancias: [{
            descripcion: descripcion.trim(),
            claveProdServ: '01010101', // Código genérico
            claveUnidad: 'KGM',
            pesoKg: 1000, // Default 1 tonelada
            cantidad: 1,
            valorMercancia: 10000, // Default $10,000
            confianza: 'baja'
          }],
          sugerencias: ['Análisis automático limitado. Revise y ajuste los valores.'],
          errores: ['Error en análisis IA, se usaron valores por defecto']
        };
      }

      setLastAnalysis(analysisResult);
      return analysisResult;

    } catch (error) {
      console.error('❌ Error general en análisis:', error);
      return {
        mercancias: [],
        sugerencias: [],
        errores: ['Error interno en el análisis. Intente nuevamente.']
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setLastAnalysis(null);
  }, []);

  return {
    analyzeDescription,
    isAnalyzing,
    lastAnalysis,
    clearAnalysis
  };
};
