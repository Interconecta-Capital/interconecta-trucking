import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MercanciaAnalizada {
  descripcion: string;
  claveProdServ: string;
  claveUnidad: string;
  pesoKg: number;
  cantidad: number;
  valorMercancia: number;
  metodoTransporte?: string;
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
          operation: 'mercancia_analysis',
          data: {
            descripcion: descripcion,
            extractMultiple: true,
            inferValues: true
          },
          message: `Analiza esta descripción de mercancías para transporte y extrae TODOS los productos mencionados:

DESCRIPCIÓN: "${descripcion}"

INSTRUCCIONES CRÍTICAS:
1. DETECTA MÚLTIPLES PRODUCTOS: Si hay varios productos, sepáralos (ej: "30 ton de pepino, 10 ton de sandía y 5 ton de melón" = 3 productos)
2. SEPARA POR CONECTORES: Palabras como "y", ",", "también", "además", "más", "con" indican productos separados
3. CANTIDADES IMPLÍCITAS: Si solo se menciona un producto con cantidad, los demás también llevan esa cantidad por defecto

Para CADA producto identifica:
   - descripcion: Nombre específico del producto (ej: "Pepino fresco", "Sandía", "Melón")
   - pesoKg: Peso INDIVIDUAL en kilogramos (si dice "30 ton" = 30000 kg)
   - cantidad: Número de unidades (si no se especifica, usar 1)
   - claveProdServ: Código SAT de 8 dígitos MÁS ESPECÍFICO posible
   - claveUnidad: Código SAT de 3 letras (KGM=Kilogramo, TNE=Tonelada, PZA=Pieza, LTR=Litro, MTR=Metro, etc.)
   - valorMercancia: Valor comercial estimado en pesos mexicanos (investigar precios de mercado actuales)
   - metodoTransporte: Método de empaque/transporte según SAT

CÓDIGOS SAT ESPECÍFICOS (USA EL MÁS EXACTO):
Frutas y Verduras:
- 01011601: Pepino fresco
- 01011602: Sandía
- 01011603: Melón
- 01011604: Tomate fresco
- 01011605: Aguacate
- 01011606: Limón
- 01011607: Naranja
- 01021501: Lechuga
- 01021502: Zanahoria
- 01021503: Cebolla
- 01021504: Papa/Patata
- 01021505: Chile/Pimiento

Cereales y Granos:
- 01010101: Trigo
- 01010201: Maíz amarillo
- 01010202: Maíz blanco
- 01010301: Arroz
- 01010401: Avena
- 01010501: Sorgo

Materiales Construcción:
- 30161501: Cemento Portland
- 30161502: Cemento gris
- 30111501: Arena de construcción
- 30111502: Grava
- 30111503: Piedra triturada
- 30151501: Varilla corrugada
- 30151502: Alambrón

Textiles:
- 53102600: Ropa de algodón
- 53102601: Playeras
- 53102602: Pantalones
- 11141600: Telas de algodón
- 11141601: Mezclilla

Electrónicos:
- 43211501: Computadoras portátiles
- 43211502: Computadoras de escritorio
- 52141500: Teléfonos celulares
- 43211800: Monitores
- 43222600: Impresoras

Alimentos Procesados:
- 50201700: Pan y productos de panadería
- 50192300: Productos lácteos
- 50131600: Carne refrigerada
- 50151500: Pescado y mariscos
- 50121500: Bebidas

Químicos y Combustibles:
- 15111500: Gasolina
- 15111501: Diésel
- 15101800: Gas LP
- 15101801: Gas natural
- 12141500: Fertilizantes

UNIDADES SAT:
- KGM (Kilogramo): Para productos sólidos por peso
- TNE (Tonelada): Para grandes cantidades (1000kg)
- PZA (Pieza): Para productos individuales
- LTR (Litro): Para líquidos
- MTR (Metro): Para materiales por longitud
- M2 (Metro cuadrado): Para superficies
- M3 (Metro cúbico): Para volúmenes
- XBX (Caja): Para productos en cajas
- XBG (Bolsa): Para productos embolsados

MÉTODOS DE TRANSPORTE/EMPAQUE SAT:
- Tarimas de madera estándar
- Cajas de cartón corrugado
- Contenedores metálicos ISO 20/40 pies
- A granel en tolva metálica
- A granel en tanque
- Sacos de polipropileno 50kg
- Supersacos (Big Bags) 1000kg
- Rollos protegidos con plástico
- Pallets europeos EUR (1200x800mm)
- Embalaje anti-derrame certificado
- Refrigeración controlada 2-8°C
- Congelación -18°C
- Carga suelta
- Flejado metálico

EJEMPLOS DE ANÁLISIS:
Input: "30 ton de pepino y 10 de sandía"
Output: [
  {
    "descripcion": "Pepino fresco",
    "claveProdServ": "01011601",
    "claveUnidad": "TNE",
    "pesoKg": 30000,
    "cantidad": 1,
    "valorMercancia": 450000,
    "metodoTransporte": "Cajas de cartón corrugado sobre tarimas",
    "confianza": "alta"
  },
  {
    "descripcion": "Sandía",
    "claveProdServ": "01011602",
    "claveUnidad": "TNE",
    "pesoKg": 10000,
    "cantidad": 1,
    "valorMercancia": 80000,
    "metodoTransporte": "A granel en tarimas de madera",
    "confianza": "alta"
  }
]

Input: "500 playeras de algodón y 300 pantalones de mezclilla"
Output: [
  {
    "descripcion": "Playeras de algodón",
    "claveProdServ": "53102601",
    "claveUnidad": "PZA",
    "pesoKg": 150,
    "cantidad": 500,
    "valorMercancia": 50000,
    "metodoTransporte": "Cajas de cartón corrugado",
    "confianza": "alta"
  },
  {
    "descripcion": "Pantalones de mezclilla",
    "claveProdServ": "53102602",
    "claveUnidad": "PZA",
    "pesoKg": 300,
    "cantidad": 300,
    "valorMercancia": 90000,
    "metodoTransporte": "Cajas de cartón corrugado",
    "confianza": "alta"
  }
]

CALCULA VALORES REALISTAS:
- Frutas/Verduras: $8-25 MXN/kg
- Cereales: $5-15 MXN/kg
- Textiles: $50-300 MXN/pieza
- Electrónicos: $2000-15000 MXN/pieza
- Construcción: $100-500 MXN/m3

Responde SOLO con un JSON válido en este formato:
{
  "mercancias": [
    {
      "descripcion": "Descripción específica del producto",
      "claveProdServ": "código SAT de 8 dígitos",
      "claveUnidad": "código SAT de 3 letras", 
      "pesoKg": número en kilogramos,
      "cantidad": número de unidades,
      "valorMercancia": número en pesos MXN,
      "metodoTransporte": "método de empaque/transporte SAT",
      "confianza": "alta|media|baja"
    }
  ],
  "sugerencias": ["sugerencias de mejora si las hay"],
  "errores": ["errores si los hay"]
}`,
          context: 'mercancia_analysis_v2'
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
            metodoTransporte: 'Tarimas de madera estándar',
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