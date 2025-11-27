
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY: Validate input with Zod
    const GeminiRequestSchema = z.object({
      operation: z.string().optional(),
      action: z.string().optional(),
      data: z.any().optional(),
      message: z.string().max(10000, 'Message too long').optional(),
      context: z.union([z.string(), z.record(z.any())]).optional()
    }).refine(data => data.operation || data.action, {
      message: 'Either operation or action must be provided'
    });

    let validatedData;
    try {
      validatedData = GeminiRequestSchema.parse(await req.json());
    } catch (error) {
      console.error('[GEMINI] Validation error:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid input', 
          details: error.errors 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { operation, action, data, message, context } = validatedData;

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
Eres un experto en logística, Complemento Carta Porte 3.1 de México y análisis de documentos comerciales.
Analiza el siguiente documento tipo ${data.document_type || 'desconocido'} y extrae TODAS las mercancías mencionadas con MÁXIMO DETALLE.

IMPORTANTE: Para CADA mercancía, identifica y extrae:

**Campos Obligatorios CCP 3.1:**
- descripcion: Descripción completa y detallada del producto/mercancía
- cantidad: Cantidad numérica (decimal permitido)
- claveProdServ: Clave SAT de producto/servicio (8 dígitos, ej: 78101800 para "Servicios de transporte de carga")
- claveUnidad: Clave SAT de unidad de medida según catálogo SAT (ej: KGM=Kilogramo, H87=Pieza, XBX=Caja, TNE=Tonelada, LTR=Litro, MTR=Metro)
- peso_kg: Peso bruto total en kilogramos (decimal permitido)
- valor_mercancia: Valor comercial en la moneda especificada

**Campos Opcionales CCP 3.1:**
- moneda: Código de moneda (MXN, USD, EUR, etc.) - default: MXN
- material_peligroso: Clave de material peligroso si aplica (ej: UN1203, UN1950, UN1993)
- embalaje: Tipo de embalaje SAT (ej: "4A" para caja de cartón, "1A2" para barril de acero)
- fraccion_arancelaria: Fracción arancelaria para comercio exterior (8 dígitos)
- uuid_comercio_ext: UUID de pedimento de importación/exportación (si aplica)
- dimensiones_embalaje: Dimensiones del embalaje (largo x ancho x alto en cm, si está disponible)
- numero_piezas: Número de piezas individuales (si aplica)

**Inferencia Inteligente:**
Si algún campo no está explícito en el documento, INFIERE valores razonables basados en el contexto:

Ejemplos de inferencia:
- "50 televisores Samsung 55 pulgadas" → claveProdServ: "52161515", claveUnidad: "H87", peso_kg: 850 (17kg/unidad aprox)
- "500 kg de café en grano" → claveProdServ: "10111502", claveUnidad: "KGM", embalaje: "5M" (sacos)
- "10 cajas de herramientas" → claveProdServ: "27112700", claveUnidad: "XBX", peso_kg: 250 (25kg/caja aprox)
- "1000 litros de aceite lubricante" → claveProdServ: "15121601", claveUnidad: "LTR", peso_kg: 920 (densidad 0.92)
- "Material peligroso: 200L gasolina" → material_peligroso: "UN1203", embalaje: "1A1" (tambores metálicos)

**Catálogo de Claves SAT Comunes:**
- Servicios de transporte: 78101800
- Alimentos perecederos: 50000000
- Productos químicos: 11000000  
- Material de construcción: 30000000
- Equipos electrónicos: 43000000
- Textiles y ropa: 53000000
- Maquinaria industrial: 40000000
- Productos farmacéuticos: 51000000

**Unidades SAT Comunes:**
- KGM: Kilogramo (peso)
- H87: Pieza (unidades)
- XBX: Caja (contenedores)
- TNE: Tonelada (peso grande)
- LTR: Litro (líquidos)
- MTR: Metro (longitud)
- MTK: Metro cuadrado (área)
- MTQ: Metro cúbico (volumen)

Texto del documento a analizar:
${data.text}

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO (sin markdown, sin explicaciones adicionales) con esta estructura EXACTA:
Ejemplo de respuesta:
result: mercancias array con objetos que contienen descripcion, cantidad, claveProdServ, claveUnidad, peso_kg, valor_mercancia, moneda, material_peligroso, embalaje, fraccion_arancelaria, uuid_comercio_ext, dimensiones_embalaje, numero_piezas
confidence: numero entre 0 y 1
suggestions: array de strings con recomendaciones

IMPORTANTE: 
- Si encuentras múltiples mercancías, crea un objeto separado para cada una
- La confidence debe reflejar qué tan seguros estamos de los datos extraídos (0.0 a 1.0)
- Las suggestions deben incluir recomendaciones para validar o mejorar los datos extraídos
- NUNCA incluyas markdown en la respuesta, solo el JSON puro
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
