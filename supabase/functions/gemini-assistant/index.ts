
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { operation, action, data, message, context } = await req.json();

    let op = operation || action;
    
    // Support legacy parameters from useSmartMercanciaAnalysis
    if (message && context === 'mercancia_analysis') {
      op = 'mercancia_analysis';
    }

    // Support legacy action field names
    switch (op) {
      case 'autocomplete_address':
        op = 'autocomplete_direccion';
        break;
      case 'validate_mercancia_advanced':
        op = 'validate_mercancia';
        break;
      case 'validate_direccion':
        op = 'validate_section';
        break;
    }

    console.log('[GEMINI] Received operation:', op);

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let prompt = '';
    let responseFormat = 'json';

    switch (op) {
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
        
        CÓDIGOS SAT COMUNES:
        - Frutas/verduras: 01011601, 01021501
        - Cereales: 01010101 (Trigo), 01010201 (Maíz)
        - Construcción: 30161501 (Cemento), 30111501 (Arena)
        - Textiles: 53102600, 11141600
        - Electrónicos: 43211501, 52141500
        
        MÉTODOS DE TRANSPORTE/EMPAQUE SAT:
        - Tarimas de madera
        - Cajas de cartón corrugado
        - Contenedores metálicos
        - A granel en tolva
        - Sacos de polipropileno
        - Rollos protegidos
        - Pallets europeos
        
        Responde SOLO un JSON válido:
        {
          "isValid": true/false,
          "claveProdServ": "código SAT sugerido",
          "metodoTransporte": "forma de empaque/transporte",
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

      case 'mercancia_analysis':
      case 'mercancia_analysis_v2':
        prompt = message || (data && data.message) || '';
        break;

      case 'parse_document':
        prompt = `
        Analiza el siguiente texto de un documento tipo ${data.document_type || 'desconocido'}.
        Identifica todas las mercancías mencionadas y extrae la información
        estructurada para cada una:
        descripcion, cantidad, claveProdServ, claveUnidad, peso_kg,
        valor_mercancia y moneda.

        Texto del documento:
        ${data.text}

        Devuelve SOLO un JSON válido con la forma:
        {"result": {"mercancias": [{"descripcion": "desc", "cantidad": 1, "claveProdServ": "00000000", "claveUnidad": "H87", "peso_kg": 0, "valor_mercancia": 0, "moneda": "MXN"}], "confidence": 0.8, "suggestions": ["mejora"]}}
        `;
        break;

      default:
        throw new Error(`Operation ${op} not supported`);
    }

    console.log('[GEMINI] Calling Gemini API for operation:', op);

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

    // Handle mercancia_analysis specifically
    if (op === 'mercancia_analysis') {
      return new Response(
        JSON.stringify({
          response: textResponse,
          success: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (op === 'parse_document') {
      const result = parsedResponse.result ?? parsedResponse;
      return new Response(
        JSON.stringify({
          result: {
            mercancias: result.mercancias || [],
            confidence: result.confidence ?? 0,
            suggestions: result.suggestions || []
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify(parsedResponse),
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
        error: error.message,
        response: `Error en análisis: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
