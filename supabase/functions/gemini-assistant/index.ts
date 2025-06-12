
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verifyAuth, corsHeaders, rateLimitCheck, logSecurityEvent } from '../_shared/auth.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const { error: authError, user } = await verifyAuth(req);
    if (authError) return authError;

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const canProceed = await rateLimitCheck(user!.id, 'gemini_request');
    
    if (!canProceed) {
      await logSecurityEvent(
        user!.id,
        'rate_limit_exceeded',
        { action: 'gemini_request', ip: clientIP },
        clientIP,
        req.headers.get('user-agent') || undefined
      );
      
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { message, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
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

    // Log the request
    await logSecurityEvent(
      user!.id,
      'gemini_request',
      { message_length: message.length, has_context: !!context },
      clientIP,
      req.headers.get('user-agent') || undefined
    );

    const systemPrompt = `Eres un asistente especializado en logística de transporte en México. 
    Ayudas con cartas porte, regulaciones del SAT, y gestión de flota.
    Responde de manera concisa y práctica.
    
    Contexto actual: ${context || 'No hay contexto específico'}`;

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
              { text: `Usuario: ${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      await logSecurityEvent(
        user!.id,
        'gemini_error',
        { status: response.status, error: errorText },
        clientIP,
        req.headers.get('user-agent') || undefined
      );
      
      return new Response(
        JSON.stringify({ error: 'Error al procesar la consulta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No se pudo generar una respuesta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Log successful response
    await logSecurityEvent(
      user!.id,
      'gemini_success',
      { response_length: aiResponse.length },
      clientIP,
      req.headers.get('user-agent') || undefined
    );

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Gemini assistant error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
