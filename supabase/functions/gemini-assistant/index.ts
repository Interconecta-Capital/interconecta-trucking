
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, input, prompt, context, data } = await req.json();

    if (!prompt && !data && !input) {
      return new Response(
        JSON.stringify({ error: 'Prompt, data or input is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[GEMINI] Processing request:', { action, context });

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      // Autocompletado de direcciones
      case 'autocomplete_address':
        systemPrompt = 'Eres un experto en direcciones mexicanas y cartas porte. Generas autocompletado inteligente para direcciones basándote en patrones reales y contexto del usuario.';
        userPrompt = `
        Autocompletado inteligente para: "${input}"
        Contexto: ${JSON.stringify(context)}
        
        Responde con JSON array de máximo 5 sugerencias de direcciones mexicanas reales:
        {
          "suggestions": [
            {
              "fullAddress": "dirección completa",
              "street": "calle",
              "colonia": "colonia",
              "municipio": "municipio", 
              "estado": "estado",
              "codigoPostal": "CP",
              "confidence": 0.9
            }
          ]
        }`;
        break;

      // Autocompletado de mercancías
      case 'autocomplete_mercancia':
        systemPrompt = 'Eres un experto en clasificación de mercancías SAT para cartas porte mexicanas. Generas sugerencias inteligentes basadas en descripciones parciales.';
        userPrompt = `
        Autocompletado para mercancía: "${input}"
        Contexto: ${JSON.stringify(context)}
        
        Responde con JSON array de máximo 5 sugerencias de mercancías:
        {
          "suggestions": [
            {
              "descripcion": "descripción completa",
              "claveProdServ": "código SAT",
              "claveUnidad": "unidad SAT",
              "confidence": 0.9,
              "esMatPeligroso": false,
              "fraccionArancelaria": "código opcional"
            }
          ]
        }`;
        break;

      // Autocompletado de vehículos
      case 'autocomplete_vehiculo':
        systemPrompt = 'Eres un experto en vehículos de carga mexicanos. Generas sugerencias de modelos, marcas y configuraciones vehiculares.';
        userPrompt = `
        Autocompletado para vehículo: "${input}"
        Contexto: ${JSON.stringify(context)}
        
        Responde con JSON array de máximo 5 sugerencias:
        {
          "suggestions": [
            {
              "modelo": "modelo completo",
              "marca": "marca",
              "año": 2024,
              "configVehicular": "configuración",
              "confidence": 0.9
            }
          ]
        }`;
        break;

      // Validación avanzada de direcciones
      case 'validate_direccion':
        systemPrompt = 'Eres un validador experto en direcciones mexicanas para cartas porte. Analizas formato, coherencia y existencia real.';
        userPrompt = `
        Valida esta dirección: ${JSON.stringify(data)}
        Contexto: ${JSON.stringify(context)}
        
        Responde con JSON:
        {
          "isValid": boolean,
          "confidence": 0.9,
          "warnings": [
            {
              "field": "campo",
              "message": "mensaje",
              "severity": "low|medium|high|critical",
              "type": "formato|contenido|regulacion|inconsistencia"
            }
          ],
          "suggestions": [
            {
              "field": "campo",
              "suggestion": "sugerencia",
              "confidence": 0.9,
              "reason": "explicación"
            }
          ],
          "autoFixes": [
            {
              "field": "campo",
              "currentValue": "valor actual",
              "suggestedValue": "valor sugerido",
              "description": "descripción",
              "confidence": 0.9
            }
          ]
        }`;
        break;

      // Validación avanzada de mercancías
      case 'validate_mercancia_advanced':
        systemPrompt = 'Eres un experto validador de mercancías para cartas porte SAT. Verificas coherencia entre descripción, clave, unidad, peso y valor.';
        userPrompt = `
        Valida esta mercancía: ${JSON.stringify(data)}
        Contexto: ${JSON.stringify(context)}
        
        Analiza coherencia entre descripción, clave SAT, unidad, cantidad, peso y valor.
        Responde con JSON siguiendo la estructura de ValidationResult.`;
        break;

      // Validación de coherencia general
      case 'validate_coherencia_carta_porte':
        systemPrompt = 'Eres un auditor experto en cartas porte mexicanas. Detectas inconsistencias entre ubicaciones, mercancías, vehículos y figuras.';
        userPrompt = `
        Valida coherencia general: ${JSON.stringify(data)}
        
        Analiza:
        - Coherencia entre origen/destino y mercancías
        - Capacidad vehicular vs peso total
        - Rutas lógicas y eficientes
        - Cumplimiento regulatorio
        
        Responde con JSON siguiendo la estructura de ValidationResult.`;
        break;

      // Detección de anomalías
      case 'detect_anomalies':
        systemPrompt = 'Eres un detector de anomalías en datos de transporte mexicano. Identificas patrones inusuales y posibles errores.';
        userPrompt = `
        Detecta anomalías en: ${JSON.stringify(data)}
        Tipo: ${context?.tipo}
        
        Busca patrones inusuales, valores atípicos, inconsistencias temporales o geográficas.
        Responde con JSON siguiendo la estructura de ValidationResult.`;
        break;

      // Funciones existentes
      case 'suggest_description':
        systemPrompt = 'Eres un experto en productos y servicios mexicanos. Genera descripciones detalladas y precisas para cartas porte basándote en claves de productos del SAT.';
        userPrompt = `Genera una descripción detallada para el producto con clave: ${prompt}`;
        break;

      case 'validate_mercancia':
        systemPrompt = 'Eres un validador experto en mercancías para cartas porte mexicanas. Analiza la información y proporciona validación según regulaciones del SAT.';
        userPrompt = `Valida esta información de mercancía: ${JSON.stringify(data)}`;
        break;

      case 'improve_description':
        systemPrompt = 'Eres un editor experto en descripciones de mercancías para documentos fiscales mexicanos.';
        userPrompt = `Mejora esta descripción: "${prompt}" para hacerla más precisa y completa según estándares del SAT.`;
        break;

      case 'parse_document':
        systemPrompt = 'Eres un experto en extraer datos de documentos de transporte y cartas porte. Extrae información estructurada de manera precisa.';
        userPrompt = `Extrae datos de mercancías de este documento: ${data?.text || prompt}`;
        break;

      case 'generate_carta_porte_data':
        systemPrompt = 'Eres un asistente especializado en cartas porte mexicanas. Ayudas a generar datos precisos y completos según regulaciones del SAT.';
        userPrompt = `Contexto: ${context}. Solicitud: ${prompt}`;
        break;

      default:
        systemPrompt = 'Eres un asistente especializado en logística de transporte en México. Ayudas con cartas porte, regulaciones del SAT, y gestión de flota.';
        userPrompt = prompt || input || JSON.stringify(data);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: action.includes('autocomplete') ? 0.3 : 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: action.includes('validate') ? 3000 : 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Error al procesar la consulta con IA' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiData = await response.json();
    
    if (!aiData.candidates || aiData.candidates.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No se pudo generar una respuesta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let aiResponse = aiData.candidates[0].content.parts[0].text;
    
    // Procesar respuesta según el tipo de acción
    let processedResponse = {};

    // Intentar parsear JSON para acciones de autocompletado y validación
    if (action.includes('autocomplete') || action.includes('validate') || action.includes('detect')) {
      try {
        // Extraer JSON de la respuesta
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          processedResponse = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback para respuestas que no son JSON válido
          if (action.includes('autocomplete')) {
            processedResponse = {
              suggestions: [{
                text: aiResponse.trim(),
                confidence: 0.6
              }]
            };
          } else {
            processedResponse = {
              isValid: true,
              confidence: 0.6,
              warnings: [],
              suggestions: []
            };
          }
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback seguro
        if (action.includes('autocomplete')) {
          processedResponse = { suggestions: [] };
        } else {
          processedResponse = {
            isValid: true,
            confidence: 0.5,
            warnings: [],
            suggestions: []
          };
        }
      }
    } else {
      // Procesar respuestas de acciones existentes
      switch (action) {
        case 'suggest_description':
        case 'improve_description':
          processedResponse = {
            description: aiResponse.trim()
          };
          break;

        case 'validate_mercancia':
          try {
            const validationMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (validationMatch) {
              processedResponse = JSON.parse(validationMatch[0]);
            } else {
              processedResponse = {
                is_valid: true,
                confidence: 0.7,
                issues: [],
                suggestions: [aiResponse.trim()]
              };
            }
          } catch {
            processedResponse = {
              is_valid: true,
              confidence: 0.7,
              issues: [],
              suggestions: [aiResponse.trim()]
            };
          }
          break;

        case 'parse_document':
          processedResponse = {
            result: {
              mercancias: [],
              confidence: 0.6,
              suggestions: [aiResponse.trim()]
            }
          };
          break;

        default:
          processedResponse = {
            response: aiResponse,
            suggestions: [{
              title: 'Sugerencia IA',
              description: aiResponse.trim(),
              confidence: 0.8
            }]
          };
      }
    }

    console.log('[GEMINI] Respuesta procesada exitosamente para:', action);

    return new Response(
      JSON.stringify(processedResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[GEMINI] Error general:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
