import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const cerFile = formData.get('cer_file') as File;
    const keyFile = formData.get('key_file') as File;
    const password = formData.get('password') as string;
    const nombreCertificado = formData.get('nombre_certificado') as string;

    if (!cerFile || !keyFile || !password || !nombreCertificado) {
      return new Response(
        JSON.stringify({ error: 'Faltan archivos o datos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Procesando certificado para usuario:', user.id);
    console.log('Nombre del certificado:', nombreCertificado);

    // Validar extensiones
    if (!cerFile.name.toLowerCase().endsWith('.cer') || !keyFile.name.toLowerCase().endsWith('.key')) {
      return new Response(
        JSON.stringify({ error: 'Extensiones de archivo inválidas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Aquí se implementaría la validación real del certificado
    // Por ahora, simularemos la extracción de información
    const mockCertInfo = {
      numeroSerie: Date.now().toString(16).toUpperCase().slice(-16),
      rfc: 'XAXX010101000',
      razonSocial: 'EMPRESA DE PRUEBA SA DE CV',
      fechaInicioVigencia: new Date().toISOString(),
      fechaFinVigencia: new Date(Date.now() + (4 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    };

    // Subir archivos a Storage
    const timestamp = Date.now();
    const cerFileName = `${user.id}/${timestamp}_${nombreCertificado}.cer`;
    const keyFileName = `${user.id}/${timestamp}_${nombreCertificado}.key`;

    const cerBuffer = await cerFile.arrayBuffer();
    const keyBuffer = await keyFile.arrayBuffer();

    // Subir archivo .cer
    const { error: cerUploadError } = await supabaseClient.storage
      .from('certificados')
      .upload(cerFileName, cerBuffer, {
        contentType: 'application/x-x509-ca-cert',
        upsert: false
      });

    if (cerUploadError) {
      console.error('Error uploading .cer:', cerUploadError);
      return new Response(
        JSON.stringify({ error: 'Error al subir archivo .cer' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subir archivo .key
    const { error: keyUploadError } = await supabaseClient.storage
      .from('certificados')
      .upload(keyFileName, keyBuffer, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (keyUploadError) {
      // Limpiar archivo .cer si falla el .key
      await supabaseClient.storage.from('certificados').remove([cerFileName]);
      console.error('Error uploading .key:', keyUploadError);
      return new Response(
        JSON.stringify({ error: 'Error al subir archivo .key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Encriptar contraseña con AES-256
    // Por ahora, almacenaremos la contraseña encriptada de forma básica
    const passwordEncrypted = btoa(password); // Usar encriptación real en producción

    // Crear registro en la base de datos
    const { data: certificado, error: dbError } = await supabaseClient
      .from('certificados_digitales')
      .insert({
        user_id: user.id,
        nombre_certificado: nombreCertificado,
        numero_certificado: mockCertInfo.numeroSerie,
        rfc_titular: mockCertInfo.rfc,
        razon_social: mockCertInfo.razonSocial,
        fecha_inicio_vigencia: mockCertInfo.fechaInicioVigencia,
        fecha_fin_vigencia: mockCertInfo.fechaFinVigencia,
        archivo_cer_path: cerFileName,
        archivo_key_path: keyFileName,
        archivo_key_encrypted: true,
        validado: true,
        activo: false // No activar automáticamente
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating certificate record:', dbError);
      // Limpiar archivos si falla la creación del registro
      await supabaseClient.storage.from('certificados').remove([cerFileName, keyFileName]);
      return new Response(
        JSON.stringify({ error: 'Error al guardar certificado en base de datos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Certificado procesado exitosamente:', certificado.id);

    return new Response(
      JSON.stringify({
        success: true,
        certificado: {
          id: certificado.id,
          nombre: certificado.nombre_certificado,
          rfc: certificado.rfc_titular,
          razonSocial: certificado.razon_social,
          vigencia: certificado.fecha_fin_vigencia
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en procesar-certificado:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
