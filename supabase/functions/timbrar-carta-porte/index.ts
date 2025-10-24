
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS Configuration: Restricted to allowed origins
const allowedOrigins = [
  'https://interconecta-trucking.lovable.app',
  'https://trucking.interconecta.capital',
  'http://localhost:5173', // Local development
  Deno.env.get('ALLOWED_ORIGIN') || '' // Additional origin from env
].filter(Boolean);

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true'
  };
};

interface TimbradoRequest {
  xml: string;
  ambiente: 'sandbox' | 'production';
  tipo_documento: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
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
    
    // Obtener token de autenticación
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado - token requerido'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { xml, ambiente, tipo_documento }: TimbradoRequest = await req.json();

    console.log(`🔄 Iniciando timbrado ${ambiente} con FISCAL API para usuario: ${user.id}, tipo: ${tipo_documento}`);

    // FASE 2.1: VALIDACIONES PRE-TIMBRADO
    
    // 1. Validar que el usuario tenga configuración empresarial completa
    const { data: configEmpresa, error: configError } = await supabase
      .from('configuracion_empresarial')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (configError || !configEmpresa) {
      console.error('❌ Configuración empresarial no encontrada');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Debe completar su configuración empresarial antes de timbrar'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 2. Validar certificados digitales activos
    if (!configEmpresa.certificado_digital_cer || !configEmpresa.certificado_digital_key) {
      console.error('❌ Certificados digitales no configurados');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Debe cargar sus certificados digitales (CSD) antes de timbrar'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 3. Validar vigencia de certificados
    if (configEmpresa.vigencia_certificado) {
      const vigenciaCert = new Date(configEmpresa.vigencia_certificado);
      const hoy = new Date();
      
      if (vigenciaCert < hoy) {
        console.error('❌ Certificado digital vencido');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Su certificado digital ha vencido. Por favor, renuévelo antes de timbrar'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Advertencia si vence en menos de 30 días
      const diasRestantes = Math.floor((vigenciaCert.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (diasRestantes <= 30) {
        console.warn(`⚠️ Certificado digital vence en ${diasRestantes} días`);
      }
    }

    // 4. Validar seguro de responsabilidad civil
    const seguroRC = configEmpresa.seguro_resp_civil_empresa;
    if (!seguroRC?.poliza || !seguroRC?.aseguradora) {
      console.error('❌ Seguro de responsabilidad civil no configurado');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Debe configurar su seguro de responsabilidad civil'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validar vigencia del seguro
    if (seguroRC.vigencia) {
      const vigenciaSeguro = new Date(seguroRC.vigencia);
      const hoy = new Date();
      
      if (vigenciaSeguro < hoy) {
        console.error('❌ Seguro de responsabilidad civil vencido');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Su seguro de responsabilidad civil ha vencido'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // 5. Validar permiso SCT
    if (!configEmpresa.numero_permiso_sct || !configEmpresa.tipo_permiso_sct) {
      console.error('❌ Permiso SCT no configurado');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Debe configurar su permiso SCT'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validar vigencia del permiso SCT
    if (configEmpresa.vigencia_permiso_sct) {
      const vigenciaPermiso = new Date(configEmpresa.vigencia_permiso_sct);
      const hoy = new Date();
      
      if (vigenciaPermiso < hoy) {
        console.error('❌ Permiso SCT vencido');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Su permiso SCT ha vencido. Renuévelo antes de timbrar'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // 6. Validar modo sandbox/producción según plan del usuario
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('plan_suscripcion')
      .eq('id', user.id)
      .single();

    const plan = userProfile?.plan_suscripcion || 'free';
    
    // Solo permitir producción para planes de pago
    if (ambiente === 'production' && plan === 'free') {
      console.error('❌ Plan free no permite timbrado en producción');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El timbrado en producción requiere un plan de pago. Actualice su plan para continuar.'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`✅ Validaciones pre-timbrado exitosas para usuario: ${user.id}`);

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

    // Registrar intento exitoso de timbrado
    try {
      await supabase
        .from('timbrados_log')
        .insert({
          user_id: user.id,
          tipo_documento,
          ambiente,
          uuid,
          exitoso: true,
          pac: 'FISCAL_API'
        });
    } catch (logError) {
      console.warn('⚠️ Error registrando log de timbrado:', logError);
      // No fallar el timbrado por error de log
    }

    // Crear notificación de timbrado exitoso
    try {
      await supabase
        .from('notificaciones')
        .insert({
          user_id: user.id,
          tipo: 'success',
          titulo: 'Carta Porte timbrada exitosamente',
          mensaje: `Tu documento ha sido timbrado correctamente. UUID: ${uuid.substring(0, 8)}...`,
          urgente: false,
          metadata: {
            link: '/cartas-porte',
            entityType: 'carta_porte',
            entityId: cartaPorteId,
            uuid: uuid,
            folio: folio_fiscal,
            ambiente: ambiente,
            icon: 'CheckCircle'
          }
        });
      console.log('📬 Notificación de timbrado exitoso creada');
    } catch (notifError) {
      console.warn('⚠️ Error creando notificación de éxito:', notifError);
      // No fallar el timbrado por error de notificación
    }

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
    
    // Registrar intento fallido y crear notificación
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await createClient(supabaseUrl, supabaseKey).auth.getUser(token);
        
        if (user) {
          const supabaseClient = createClient(supabaseUrl, supabaseKey);
          
          // Log del error
          await supabaseClient
            .from('timbrados_log')
            .insert({
              user_id: user.id,
              tipo_documento: 'unknown',
              ambiente: 'unknown',
              exitoso: false,
              error_mensaje: error instanceof Error ? error.message : 'Error desconocido',
              pac: 'FISCAL_API'
            });

          // Notificación de error urgente
          await supabaseClient
            .from('notificaciones')
            .insert({
              user_id: user.id,
              tipo: 'error',
              titulo: 'Error al timbrar Carta Porte',
              mensaje: `No se pudo completar el timbrado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
              urgente: true,
              metadata: {
                link: '/cartas-porte',
                actionRequired: true,
                icon: 'AlertTriangle',
                error: error instanceof Error ? error.message : 'Error desconocido'
              }
            });
          
          console.log('📬 Notificación de error de timbrado creada');
        }
      }
    } catch (logError) {
      console.warn('⚠️ Error registrando log/notificación de error:', logError);
    }

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
