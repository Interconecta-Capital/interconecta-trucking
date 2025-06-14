import { serve } from 'https://deno.land/std@0.177.1/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data, context, prompt, input } = await req.json();
    console.log('[GEMINI] Received action:', action);

    let systemPrompt = '';
    let userPrompt = '';
    let responseData: any = {};

    switch (action) {
      case 'generate_carta_porte_data':
        systemPrompt = `Eres un asistente experto en la generación de datos para la Carta Porte en México. 
        Tu objetivo es ayudar a los usuarios a completar la información de manera precisa y eficiente.
        Debes generar datos basados en el contexto proporcionado y las normas del SAT.

        Responde en formato JSON con el siguiente esquema:
        {
          "suggestions": [
            {
              "title": "Título de la sugerencia",
              "description": "Descripción detallada de la sugerencia",
              "data": {
                "campo1": "valor1",
                "campo2": "valor2"
              },
              "confidence": 0.85
            }
          ]
        }

        Si no estás seguro de la respuesta, puedes responder con un confidence bajo (ej. 0.5).
        Si no encuentras información relevante, responde con un array vacío en "suggestions".`;

        userPrompt = `Genera sugerencias para la Carta Porte basado en este contexto:
        Prompt: ${prompt}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'suggest_description':
        systemPrompt = `Eres un asistente experto en la descripción de productos y servicios en México.
        Tu objetivo es generar descripciones precisas y útiles basadas en la clave de producto proporcionada.
        Debes considerar las normas del SAT y las mejores prácticas de comercio.

        Responde directamente con la descripción del producto o servicio.
        Si no encuentras información relevante, responde con "Descripción no disponible".`;

        userPrompt = `Genera una descripción para la clave de producto: ${prompt}`;
        break;

      case 'validate_mercancia':
        systemPrompt = `Eres un validador experto de información de mercancías para la Carta Porte en México.
        Tu objetivo es verificar si la información proporcionada es válida y cumple con las normas del SAT.
        Debes identificar posibles errores, inconsistencias o datos faltantes.

        Responde en formato JSON con el siguiente esquema:
        {
          "is_valid": true,
          "confidence": 0.95,
          "issues": ["Lista de problemas encontrados"],
          "suggestions": ["Lista de sugerencias para mejorar la información"]
        }

        Si la información es válida, "issues" y "suggestions" deben ser arrays vacíos.`;

        userPrompt = `Valida la siguiente información de mercancía:
        ${JSON.stringify(data, null, 2)}`;
        break;

      case 'improve_description':
        systemPrompt = `Eres un asistente experto en la mejora de descripciones de productos y servicios en México.
        Tu objetivo es optimizar descripciones existentes para que sean más claras, precisas y atractivas.
        Debes considerar las normas del SAT y las mejores prácticas de comercio.

        Responde directamente con la descripción mejorada.
        Si no puedes mejorar la descripción, responde con la descripción original.`;

        userPrompt = `Mejora la siguiente descripción: ${prompt}`;
        break;

      case 'parse_document':
        systemPrompt = `Eres un experto en el procesamiento y análisis de documentos en México.
        Tu objetivo es extraer información relevante de documentos de texto, como facturas, guías de remisión, etc.
        Debes identificar entidades clave y relaciones entre ellas.

        Responde en formato JSON con la información extraída.
        El formato JSON dependerá del tipo de documento.`;

        userPrompt = `Procesa el siguiente documento de tipo ${data.document_type}:
        ${data.text}`;
        break;

      case 'autocomplete_address':
        systemPrompt = `Eres un experto en la ubicación y el formato de direcciones en México.
        Tu objetivo es proporcionar sugerencias de direcciones válidas y completas basadas en la entrada del usuario.
        Debes considerar las normas del SAT y las convenciones postales mexicanas.

        Responde en formato JSON con el siguiente esquema:
        {
          "suggestions": [
            {
              "fullAddress": "Dirección completa",
              "street": "Calle",
              "colonia": "Colonia",
              "municipio": "Municipio",
              "estado": "Estado",
              "codigoPostal": "Código Postal",
              "confidence": 0.85
            }
          ]
        }`;

        userPrompt = `Proporciona sugerencias de direcciones para: ${input}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'validate_direccion':
        systemPrompt = `Eres un experto en validación de direcciones en México, especializado en los requisitos de la Carta Porte.
        Tu objetivo es verificar si una dirección cumple con los estándares y regulaciones del SAT para la Carta Porte.
        Debes analizar la dirección y proporcionar un reporte detallado de su validez, incluyendo advertencias y sugerencias.

        Responde en formato JSON con el siguiente esquema:
        {
          "isValid": true,
          "confidence": 0.95,
          "warnings": [
            {
              "field": "campo de la dirección",
              "message": "descripción del problema",
              "severity": "low | medium | high | critical",
              "type": "formato | contenido | regulacion | inconsistencia"
            }
          ],
          "suggestions": [
            {
              "field": "campo de la dirección",
              "suggestion": "sugerencia de mejora",
              "confidence": 0.8,
              "reason": "razón de la sugerencia"
            }
          ]
        }`;

        userPrompt = `Valida la siguiente dirección para la Carta Porte:
        ${JSON.stringify(data, null, 2)}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'autocomplete_mercancia':
        systemPrompt = `Eres un experto en la clasificación y descripción de mercancías en México, especializado en los catálogos del SAT para la Carta Porte.
        Tu objetivo es proporcionar sugerencias precisas y relevantes basadas en la entrada del usuario.
        Debes considerar los catálogos del SAT y las convenciones de la industria.

        Responde en formato JSON con el siguiente esquema:
        {
          "suggestions": [
            {
              "descripcion": "Descripción de la mercancía",
              "claveProdServ": "Clave del producto/servicio",
              "claveUnidad": "Clave de unidad de medida",
              "confidence": 0.85,
              "esMatPeligroso": true,
              "fraccionArancelaria": "Fracción arancelaria"
            }
          ]
        }`;

        userPrompt = `Proporciona sugerencias de mercancías para: ${input}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'validate_mercancia_advanced':
        systemPrompt = `Eres un sistema experto en la validación avanzada de información de mercancías para la Carta Porte en México.
        Tu objetivo es asegurar que la información de la mercancía sea precisa, completa y cumpla con todas las regulaciones del SAT.
        Debes realizar validaciones cruzadas, verificar la coherencia de los datos y sugerir mejoras.

        Responde en formato JSON con el siguiente esquema:
        {
          "isValid": true,
          "confidence": 0.95,
          "warnings": [
            {
              "field": "campo de la mercancía",
              "message": "descripción del problema",
              "severity": "low | medium | high | critical",
              "type": "formato | contenido | regulacion | inconsistencia"
            }
          ],
          "suggestions": [
            {
              "field": "campo de la mercancía",
              "suggestion": "sugerencia de mejora",
              "confidence": 0.8,
              "reason": "razón de la sugerencia"
            }
          ],
          "autoFixes": [
            {
              "field": "campo a corregir",
              "currentValue": "valor actual",
              "suggestedValue": "valor sugerido",
              "description": "descripción de la corrección",
              "confidence": 0.9
            }
          ]
        }`;

        userPrompt = `Valida la siguiente información de mercancía (validación avanzada):
        ${JSON.stringify(data, null, 2)}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'validate_coherencia_carta_porte':
        systemPrompt = `Eres un sistema experto en la validación de la coherencia general de la Carta Porte en México.
        Tu objetivo es asegurar que todos los datos de la Carta Porte sean coherentes entre sí y cumplan con las regulaciones del SAT.
        Debes realizar validaciones cruzadas entre diferentes secciones de la Carta Porte y sugerir mejoras.

        Responde en formato JSON con el siguiente esquema:
        {
          "isValid": true,
          "confidence": 0.9,
          "warnings": [
            {
              "field": "sección de la Carta Porte",
              "message": "descripción del problema",
              "severity": "low | medium | high | critical",
              "type": "formato | contenido | regulacion | inconsistencia"
            }
          ],
          "suggestions": [
            {
              "field": "sección de la Carta Porte",
              "suggestion": "sugerencia de mejora",
              "confidence": 0.75,
              "reason": "razón de la sugerencia"
            }
          ]
        }`;

        userPrompt = `Valida la coherencia general de la siguiente Carta Porte:
        ${JSON.stringify(data, null, 2)}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'detect_anomalies':
        systemPrompt = `Eres un sistema experto en la detección de anomalías en datos de transporte en México.
        Tu objetivo es identificar patrones inusuales o sospechosos en los datos proporcionados.
        Debes considerar el tipo de datos, la sensibilidad requerida y las regulaciones aplicables.

        Responde en formato JSON con el siguiente esquema:
        {
          "isValid": true,
          "confidence": 0.8,
          "warnings": [
            {
              "field": "campo con anomalía",
              "message": "descripción de la anomalía",
              "severity": "low | medium | high | critical",
              "type": "formato | contenido | regulacion | inconsistencia"
            }
          ],
          "suggestions": [
            {
              "field": "campo con anomalía",
              "suggestion": "sugerencia de acción",
              "confidence": 0.65,
              "reason": "razón de la sugerencia"
            }
          ]
        }`;

        userPrompt = `Detecta anomalías en los siguientes datos de tipo "${context.tipo}":
        ${JSON.stringify(data, null, 2)}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'autocomplete_vehiculo':
        systemPrompt = `Eres un experto en la identificación y descripción de vehículos de transporte en México.
        Tu objetivo es proporcionar sugerencias precisas y relevantes basadas en la entrada del usuario.
        Debes considerar las marcas, modelos y características comunes de los vehículos en México.

        Responde en formato JSON con el siguiente esquema:
        {
          "suggestions": [
            {
              "marca": "Marca del vehículo",
              "modelo": "Modelo del vehículo",
              "descripcion": "Descripción detallada",
              "confidence": 0.8
            }
          ]
        }`;

        userPrompt = `Proporciona sugerencias de vehículos para: ${input}
        Contexto: ${JSON.stringify(context, null, 2)}`;
        break;
      case 'optimize_route':
        systemPrompt = `Eres un experto en optimización de rutas de transporte en México. 
        Analiza los puntos de la ruta y los criterios proporcionados para generar la ruta más eficiente.
        
        Considera:
        - Distancia total mínima
        - Tiempo de viaje optimizado
        - Consumo de combustible eficiente
        - Ventanas horarias de entrega
        - Tráfico y condiciones de carretera
        - Restricciones del vehículo
        
        Responde en JSON con el siguiente formato:
        {
          "ruta_optimizada": {
            "orden_optimo": ["id1", "id2", "id3"],
            "distancia_total": 250.5,
            "tiempo_total": 480,
            "eficiencia_score": 85,
            "alertas": ["mensaje de alerta si es necesario"],
            "sugerencias": ["sugerencia de mejora"],
            "factores_optimizacion": {
              "distancia": 0.3,
              "tiempo": 0.25,
              "combustible": 0.25,
              "trafico": 0.15,
              "ventanas_horarias": 0.05
            }
          }
        }`;
        
        userPrompt = `Optimiza esta ruta con ${data.puntos.length} puntos:
        
        Puntos: ${JSON.stringify(data.puntos, null, 2)}
        
        Criterios de optimización: ${JSON.stringify(data.criterios, null, 2)}
        
        Prioriza: ${data.criterios.prioridad || 'equilibrado'}`;
        break;

      case 'suggest_fleet_assignment':
        systemPrompt = `Eres un experto en gestión de flotas de transporte. 
        Analiza los vehículos y conductores disponibles para sugerir la mejor asignación.
        
        Considera:
        - Capacidad de carga vs peso/volumen requerido
        - Experiencia del conductor
        - Eficiencia de combustible
        - Disponibilidad y ubicación
        - Historial de rendimiento
        - Restricciones de tipo de mercancía
        
        Responde con las mejores 3 opciones ordenadas por score.`;
        
        userPrompt = `Sugiere asignación para:
        Carga: ${data.peso}kg, ${data.volumen || 'N/A'}m³
        Distancia: ${data.distancia}km
        Tipo: ${data.tipo_mercancia}
        Urgencia: ${data.urgencia}
        Fecha: ${data.fecha_salida}
        
        Vehículos disponibles: ${JSON.stringify(data.vehiculos, null, 2)}
        Conductores disponibles: ${JSON.stringify(data.conductores, null, 2)}`;
        break;

      case 'analyze_crm_context':
        systemPrompt = `Eres un asistente de CRM inteligente para empresas de transporte.
        Analiza el contexto proporcionado y genera sugerencias útiles para mejorar la operación.
        
        Proporciona insights sobre:
        - Patrones de clientes
        - Optimización de rutas frecuentes  
        - Utilización de flota
        - Oportunidades de negocio
        - Alertas operacionales`;
        
        userPrompt = `Analiza este contexto CRM:
        ${JSON.stringify(data, null, 2)}
        
        Genera sugerencias accionables para mejorar la operación.`;
        break;

      case 'predict_demand':
        systemPrompt = `Eres un analista de demanda para empresas de transporte.
        Analiza los datos históricos y factores externos para predecir la demanda futura.
        
        Considera:
        - Patrones estacionales
        - Tendencias históricas
        - Factores económicos
        - Eventos especiales
        - Comportamiento de clientes`;
        
        userPrompt = `Predice la demanda basada en:
        Datos históricos: ${JSON.stringify(data.historico, null, 2)}
        Periodo: ${data.periodo}
        Factores: ${JSON.stringify(data.factores, null, 2)}`;
        break;

      default:
        console.log('[GEMINI] No action matched');
        return new Response(JSON.stringify({
          response: 'No se especificó una acción válida',
          action: 'invalid'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (systemPrompt && userPrompt) {
      console.log('[GEMINI] Making API call with prompts');
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GEMINI] API Error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[GEMINI] API Response received');

      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        const generatedText = result.candidates[0].content.parts[0].text;
        
        // Try to parse JSON responses for structured actions
        if (action === 'optimize_route' || action === 'suggest_fleet_assignment') {
          try {
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsedData = JSON.parse(jsonMatch[0]);
              responseData = { ...responseData, ...parsedData };
            }
          } catch (parseError) {
            console.log('[GEMINI] Could not parse JSON, returning as text');
            responseData.response = generatedText;
          }
        } else {
          responseData.response = generatedText;
        }
      } else {
        throw new Error('No content generated');
      }
    }

    console.log('[GEMINI] Sending response');
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[GEMINI] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      action: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
