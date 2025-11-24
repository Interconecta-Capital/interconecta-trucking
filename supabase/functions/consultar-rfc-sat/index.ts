import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ConsultarRFCSATSchema, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // 🔐 VALIDACIÓN CON ZOD
    const validationResult = ConsultarRFCSATSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error, corsHeaders);
    }

    const { rfc } = validationResult.data;

    // Autenticar usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[consultar-rfc-sat] Consultando RFC: ${rfc}`);

    // Obtener credenciales SW desde Vault
    const swToken = Deno.env.get('SW_TOKEN');
    const swUrl = Deno.env.get('SW_SANDBOX_URL') || 'https://services.test.sw.com.mx';

    if (!swToken) {
      throw new Error('SW_TOKEN no configurado');
    }

    // Consultar RFC en el API de SW (que consulta al SAT)
    const response = await fetch(`${swUrl}/api/v3/taxpayer/rfc/${rfc}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[consultar-rfc-sat] Error del PAC:', errorText);
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({
            encontrado: false,
            mensaje: 'RFC no encontrado en el padrón del SAT'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Error consultando RFC: ${response.status}`);
    }

    const data = await response.json();
    console.log('[consultar-rfc-sat] Respuesta del PAC:', JSON.stringify(data, null, 2));

    // Extraer código postal del domicilio fiscal
    const codigoPostal = data.codigoPostal || data.codigo_postal || data.cp || null;
    
    return new Response(
      JSON.stringify({
        encontrado: true,
        rfc: data.rfc,
        razonSocial: data.razonSocial || data.nombre,
        codigoPostal: codigoPostal, // ✅ Campo crítico para CFDI 4.0
        situacion: data.situacion || 'Activo',
        mensaje: 'RFC validado correctamente'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[consultar-rfc-sat] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        encontrado: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
