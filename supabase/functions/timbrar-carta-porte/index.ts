
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimbradoRequest {
  xml: string;
  carta_porte_id: string;
  rfc_emisor: string;
  rfc_receptor: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { xml, carta_porte_id, rfc_emisor, rfc_receptor }: TimbradoRequest = await req.json();

    console.log('Iniciando timbrado con FISCAL API para carta porte:', carta_porte_id);

    // Preparar datos para FISCAL API
    const fiscalApiData = {
      xml: xml,
      ambiente: 'sandbox', // Cambiar a 'production' cuando sea necesario
      tipo_documento: 'carta_porte'
    };

    // Llamar a FISCAL API para timbrado
    const fiscalResponse = await fetch('https://api.fiscalapi.com/v1/cfdi/stamp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fiscalApiData),
    });

    if (!fiscalResponse.ok) {
      const errorData = await fiscalResponse.text();
      console.error('Error en FISCAL API:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error de FISCAL API: ${errorData}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const fiscalResult = await fiscalResponse.json();
    console.log('Respuesta de FISCAL API:', fiscalResult);

    // Extraer datos del timbrado
    const {
      uuid,
      xml_timbrado,
      qr_code,
      cadena_original,
      sello_digital,
      folio_fiscal
    } = fiscalResult.data;

    // Actualizar carta porte en base de datos
    const { error: updateError } = await supabase
      .from('cartas_porte')
      .update({
        status: 'timbrado',
        uuid_fiscal: uuid,
        xml_generado: xml_timbrado,
        fecha_timbrado: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', carta_porte_id);

    if (updateError) {
      console.error('Error actualizando carta porte:', updateError);
      throw updateError;
    }

    // Crear registro de tracking
    const { error: trackingError } = await supabase
      .from('tracking_carta_porte')
      .insert({
        carta_porte_id,
        evento: 'timbrado',
        descripcion: 'Carta Porte timbrada exitosamente',
        uuid_fiscal: uuid,
        metadata: {
          folio_fiscal,
          cadena_original,
          sello_digital
        }
      });

    if (trackingError) {
      console.error('Error creando tracking:', trackingError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        uuid,
        xmlTimbrado: xml_timbrado,
        qrCode: qr_code,
        cadenaOriginal: cadena_original,
        selloDigital: sello_digital,
        folio: folio_fiscal
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error en timbrado:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
