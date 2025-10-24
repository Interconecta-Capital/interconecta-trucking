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

    const { uuid, rfc, motivo, folioSustitucion, ambiente = 'sandbox' } = await req.json();

    if (!uuid || !rfc || !motivo) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`📤 Cancelando CFDI ${uuid} para RFC ${rfc}`);

    // Crear registro de solicitud
    const { data: solicitud, error: solicitudError } = await supabaseClient
      .from('solicitudes_cancelacion_cfdi')
      .insert({
        user_id: user.id,
        uuid_cfdi: uuid,
        rfc_emisor: rfc,
        motivo_cancelacion: motivo,
        folio_sustitucion: folioSustitucion || null,
        estado: 'procesando'
      })
      .select()
      .single();

    if (solicitudError) {
      console.error('Error creando solicitud:', solicitudError);
      return new Response(JSON.stringify({ error: 'Error creando solicitud' }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Obtener URL y token según ambiente
    const swUrl = ambiente === 'production' 
      ? Deno.env.get('SW_PRODUCTION_URL')
      : Deno.env.get('SW_SANDBOX_URL');
    
    const swToken = Deno.env.get('SW_TOKEN');

    if (!swUrl || !swToken) {
      throw new Error('Credenciales de SW no configuradas');
    }

    // Construir URL de cancelación
    const cancelUrl = `${swUrl}/cfdi33/cancel/${rfc}/${uuid}/${motivo}${folioSustitucion ? `/${folioSustitucion}` : ''}`;

    // Llamar a SW API
    const response = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();

    if (!response.ok || responseData.status !== 'success') {
      console.error('❌ Error del PAC:', responseData);
      
      // Actualizar solicitud con error
      await supabaseClient
        .from('solicitudes_cancelacion_cfdi')
        .update({
          estado: 'error',
          mensaje_error: responseData.message || 'Error en cancelación',
          codigo_respuesta: responseData.codStatus || 'unknown',
          fecha_procesamiento: new Date().toISOString()
        })
        .eq('id', solicitud.id);

      return new Response(JSON.stringify({ 
        success: false, 
        error: responseData.message || 'Error en cancelación',
        codigo: responseData.codStatus,
        details: responseData 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`✅ Cancelación exitosa - UUID: ${uuid}`);

    // Extraer información del acuse
    const acuse = responseData.data?.acuse || '';
    const uuidStatus = responseData.data?.uuid?.[uuid] || 'unknown';
    
    // Determinar si requiere aceptación del receptor
    const requiereAceptacion = uuidStatus === '201' || uuidStatus === '202';

    // Actualizar solicitud con éxito
    await supabaseClient
      .from('solicitudes_cancelacion_cfdi')
      .update({
        estado: requiereAceptacion ? 'pendiente' : 'cancelado',
        acuse_cancelacion: acuse,
        codigo_respuesta: uuidStatus,
        requiere_aceptacion: requiereAceptacion,
        fecha_procesamiento: new Date().toISOString()
      })
      .eq('id', solicitud.id);

    // Actualizar carta porte si existe
    await supabaseClient
      .from('cartas_porte')
      .update({
        status: requiereAceptacion ? 'cancelacion_pendiente' : 'cancelado',
        estatus_cancelacion: uuidStatus,
        fecha_cancelacion: new Date().toISOString(),
        motivo_cancelacion: motivo
      })
      .eq('uuid_fiscal', uuid)
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      success: true,
      uuid,
      acuse,
      requiere_aceptacion: requiereAceptacion,
      codigo_respuesta: uuidStatus,
      mensaje: requiereAceptacion 
        ? 'Solicitud de cancelación enviada. Requiere aceptación del receptor.'
        : 'CFDI cancelado exitosamente'
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('💥 Error en cancelación:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});