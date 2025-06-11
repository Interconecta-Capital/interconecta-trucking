
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeminiRequest {
  action: 'suggest_description' | 'validate_mercancia' | 'improve_description';
  data: {
    clave_producto?: string;
    descripcion_actual?: string;
    cantidad?: number;
    unidad?: string;
    peso?: number;
    valor?: number;
  };
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data }: GeminiRequest = await req.json();

    let prompt = '';
    
    switch (action) {
      case 'suggest_description':
        prompt = `Eres un experto en Carta Porte mexicana y catálogos SAT. 
        
        Basándote en la clave de producto/servicio SAT: "${data.clave_producto}", 
        sugiere una descripción detallada y profesional para la mercancía que cumpla con los requisitos fiscales mexicanos.
        
        La descripción debe:
        - Ser específica y técnica
        - Incluir características relevantes del producto
        - Cumplir con normativas SAT
        - Tener entre 20-100 palabras
        
        Responde SOLO con la descripción sugerida, sin explicaciones adicionales.`;
        break;
        
      case 'validate_mercancia':
        prompt = `Eres un experto en validación de mercancías para Carta Porte mexicana.
        
        Analiza esta mercancía:
        - Clave producto: ${data.clave_producto}
        - Descripción: ${data.descripcion_actual}
        - Cantidad: ${data.cantidad}
        - Unidad: ${data.unidad}
        - Peso: ${data.peso} kg
        - Valor: $${data.valor}
        
        Identifica posibles inconsistencias o errores y sugiere mejoras.
        
        Responde en formato JSON:
        {
          "is_valid": boolean,
          "issues": ["lista de problemas encontrados"],
          "suggestions": ["lista de sugerencias de mejora"],
          "confidence": number (0-1)
        }`;
        break;
        
      case 'improve_description':
        prompt = `Mejora esta descripción de mercancía para Carta Porte:
        
        Descripción actual: "${data.descripcion_actual}"
        Clave producto: ${data.clave_producto}
        
        Haz la descripción más completa, técnica y conforme a normativas SAT.
        Responde SOLO con la descripción mejorada.`;
        break;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error('Error calling Gemini API');
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Para validación, intentar parsear como JSON
    if (action === 'validate_mercancia') {
      try {
        const validation = JSON.parse(text);
        return new Response(JSON.stringify({ result: validation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // Si no es JSON válido, devolver respuesta de texto
        return new Response(JSON.stringify({ 
          result: {
            is_valid: false,
            issues: ['Error en el análisis de validación'],
            suggestions: [text],
            confidence: 0.5
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ result: text.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
