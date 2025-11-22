import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SW/CONECKTIA: Obtener credenciales desde Vault (ISO 27001 A.10.1)
    const swUser = Deno.env.get('SW_USER');
    const swPassword = Deno.env.get('SW_PASSWORD');
    const ambiente = Deno.env.get('AMBIENTE') || 'sandbox';
    
    if (!swUser || !swPassword) {
      console.error('[Timbrar] SW_USER o SW_PASSWORD no configurados en Vault');
      throw new Error('No se pudo obtener credenciales del PAC desde Vault');
    }

    console.log(`[Timbrar] Usando PAC SmartWeb/Conecktia en modo: ${ambiente}`);

    // URL según ambiente (desde secretos del Vault)
    const swUrl = ambiente === 'production' 
      ? Deno.env.get('SW_PRODUCTION_URL') || 'https://api.smartweb.com.mx'
      : Deno.env.get('SW_SANDBOX_URL') || 'https://services.test.sw.com.mx';

    // Paso 1: Autenticar y obtener token
    console.log(`[Timbrar] Autenticando con SW API...`);
    const authResponse = await fetch(`${swUrl}/security/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: swUser,
        password: swPassword
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('[Timbrar] Error de autenticación:', authError);
      throw new Error(`Error de autenticación con PAC: ${authError}`);
    }

    const authData = await authResponse.json();
    const token = authData.data?.token;

    if (!token) {
      console.error('[Timbrar] Token no recibido en respuesta:', authData);
      throw new Error('No se recibió token de autenticación del PAC');
    }

    console.log('[Timbrar] Token obtenido exitosamente');

    // Paso 2: Timbrar factura
    const invoiceData = await req.json();
    console.log(`[Timbrar] Endpoint: ${swUrl}/v3/cfdi33/issue/json/v4`);

    const response = await fetch(`${swUrl}/v3/cfdi33/issue/json/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/jsontoxml',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Timbrar] Error de Conecktia:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: errorText }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
};

serve(handler);
