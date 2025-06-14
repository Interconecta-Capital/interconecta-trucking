
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { operation, data } = await req.json();
    console.log('[GEMINI] Received operation:', operation);

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let prompt = '';
    let responseFormat = 'json';

    switch (operation) {
      case 'autocomplete_direccion':
        prompt = `
        Completa esta dirección mexicana: "${data.input}"
        Contexto: ${JSON.stringify(data.contexto || {})}
        
        Responde SOLO un JSON válido:
        {"suggestions": ["dirección completa 1", "dirección completa 2", "dirección completa 3"]}
        `;
        break;

      case 'validate_mercancia':
        prompt = `
        Analiza esta descripción de mercancía para carta porte mexicana:
        "${data.descripcion}"
        
        Responde SOLO un JSON válido:
        {
          "isValid": true/false,
          "claveProdServ": "código SAT sugerido",
          "suggestions": ["mejora 1", "mejora 2"],
          "warnings": ["advertencia 1", "advertencia 2"],
          "confidence": 0.85
        }
        `;
        break;

      case 'validate_section':
        prompt = `
        Valida esta sección de carta porte mexicana:
        Sección: ${data.section}
        Datos: ${JSON.stringify(data.sectionData)}
        
        Responde SOLO un JSON válido:
        {
          "score": 85,
          "suggestions": ["sugerencia 1", "sugerencia 2"],
          "warnings": ["advertencia 1"],
          "optimizations": ["optimización 1"]
        }
        `;
        break;

      default:
        throw new Error(`Operation ${operation} not supported`);
    }

    console.log('[GEMINI] Calling Gemini API for operation:', operation);

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
            temperature: 0.2,
            topK: 10,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[GEMINI] API Error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    console.log('[GEMINI] Raw response:', textResponse);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (e) {
      console.error('[GEMINI] Failed to parse response:', textResponse);
      // If parsing fails, return a generic response
      parsedResponse = {
        suggestions: [],
        error: 'Failed to parse AI response',
        rawResponse: textResponse
      };
    }

    console.log('[GEMINI] Parsed response:', parsedResponse);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResponse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[GEMINI] Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
