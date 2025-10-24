import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { re, rr, tt, id, fe, ambiente = 'sandbox' } = await req.json();

    if (!re || !rr || !tt || !id || !fe) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros requeridos (re, rr, tt, id, fe)' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`🔍 Consultando estatus CFDI ${id}`);

    // Construir expresión impresa
    const expresionImpresa = `?re=${re}&rr=${rr}&tt=${tt}&id=${id}&fe=${fe}`;

    // URL del servicio SAT según ambiente
    const satUrl = ambiente === 'production'
      ? 'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc'
      : 'https://pruebacfdiconsultaqr.cloudapp.net/ConsultaCFDIService.svc';

    // Construir SOAP envelope
    const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tem:Consulta>
      <tem:expresionImpresa><![CDATA[${expresionImpresa}]]></tem:expresionImpresa>
    </tem:Consulta>
  </soapenv:Body>
</soapenv:Envelope>`;

    // Llamar al servicio SOAP del SAT
    const response = await fetch(satUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset="utf-8"',
        'SOAPAction': 'http://tempuri.org/IConsultaCFDIService/Consulta',
        'Accept': 'text/xml'
      },
      body: soapEnvelope
    });

    const xmlResponse = await response.text();

    // Parsear respuesta XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');

    // Extraer información
    const codigoEstatus = xmlDoc.getElementsByTagName('a:CodigoEstatus')[0]?.textContent || '';
    const esCancelable = xmlDoc.getElementsByTagName('a:EsCancelable')[0]?.textContent || '';
    const estado = xmlDoc.getElementsByTagName('a:Estado')[0]?.textContent || '';
    const estatusCancelacion = xmlDoc.getElementsByTagName('a:EstatusCancelacion')[0]?.textContent || '';
    const validacionEFOS = xmlDoc.getElementsByTagName('a:ValidacionEFOS')[0]?.textContent || '';

    console.log(`✅ Estatus obtenido: ${estado}, Cancelable: ${esCancelable}`);

    return new Response(JSON.stringify({ 
      success: true,
      codigo_estatus: codigoEstatus,
      es_cancelable: esCancelable,
      estado,
      estatus_cancelacion: estatusCancelacion,
      validacion_efos: validacionEFOS,
      puede_cancelar_directamente: esCancelable === 'Cancelable sin aceptación',
      requiere_aceptacion: esCancelable === 'Cancelable con aceptación'
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('💥 Error consultando estatus:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Error consultando estatus CFDI' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});