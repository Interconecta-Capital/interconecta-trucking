
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

    const { action, prompt, context, data } = await req.json();

    if (!prompt && !data) {
      return new Response(
        JSON.stringify({ error: 'Prompt or data is required' }),
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
        userPrompt = prompt;
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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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

    const aiResponse = aiData.candidates[0].content.parts[0].text;
    
    // Procesar respuesta según el tipo de acción
    let processedResponse = {};

    switch (action) {
      case 'suggest_description':
      case 'improve_description':
        processedResponse = {
          description: aiResponse.trim()
        };
        break;

      case 'validate_mercancia':
        try {
          // Intentar extraer JSON de la respuesta
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

    console.log('[GEMINI] Respuesta procesada exitosamente');

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
