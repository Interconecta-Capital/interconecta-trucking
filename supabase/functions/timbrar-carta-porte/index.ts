
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimbradoRequest {
  xml: string;
  ambiente: 'sandbox' | 'production';
  tipo_documento: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY')!;

    if (!fiscalApiKey) {
      console.error('FISCAL_API_KEY no configurado');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración de PAC incompleta - contacte al administrador'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { xml, ambiente, tipo_documento }: TimbradoRequest = await req.json();

    console.log(`🔄 Iniciando timbrado ${ambiente} con FISCAL API para tipo: ${tipo_documento}`);

    // Validar XML antes de enviar
    if (!xml || xml.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'XML vacío o inválido'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Preparar datos para FISCAL API
    const fiscalApiData = {
      xml_content: xml,
      environment: ambiente === 'sandbox' ? 'test' : 'production',
      document_type: tipo_documento
    };

    const apiUrl = ambiente === 'sandbox' 
      ? 'https://sandbox.fiscalapi.com/v1/cfdi/stamp'
      : 'https://api.fiscalapi.com/v1/cfdi/stamp';

    console.log(`📡 Enviando a FISCAL API: ${apiUrl}`);

    // Llamar a FISCAL API para timbrado
    const fiscalResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(fiscalApiData),
    });

    const responseText = await fiscalResponse.text();
    console.log(`📥 Respuesta FISCAL API (${fiscalResponse.status}):`, responseText);

    if (!fiscalResponse.ok) {
      let errorMessage = 'Error de comunicación con PAC';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${fiscalResponse.status}: ${responseText}`;
      }

      console.error('❌ Error en FISCAL API:', errorMessage);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error PAC: ${errorMessage}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    let fiscalResult;
    try {
      fiscalResult = JSON.parse(responseText);
    } catch (error) {
      console.error('❌ Error parseando respuesta PAC:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Respuesta inválida del proveedor PAC'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validar estructura de respuesta
    if (!fiscalResult.success || !fiscalResult.data) {
      console.error('❌ Respuesta PAC sin éxito:', fiscalResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: fiscalResult.message || 'Error en proceso de timbrado'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Extraer datos del timbrado exitoso
    const {
      uuid,
      xml_timbrado,
      qr_code,
      cadena_original,
      sello_digital,
      folio_fiscal,
      fecha_timbrado,
      certificado_sat
    } = fiscalResult.data;

    console.log(`✅ Timbrado exitoso - UUID: ${uuid}`);

    // Generar respuesta estandarizada
    const timbradoResponse = {
      success: true,
      uuid,
      xmlTimbrado: xml_timbrado,
      qrCode: qr_code,
      cadenaOriginal: cadena_original,
      selloDigital: sello_digital,
      folio: folio_fiscal,
      fechaTimbrado: fecha_timbrado,
      certificadoSAT: certificado_sat,
      ambiente: ambiente,
      pac: 'FISCAL_API'
    };

    return new Response(
      JSON.stringify(timbradoResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('💥 Error interno en timbrado:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
