
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { configuracion_id, ejecucion_inmediata } = await req.json()

    // Obtener configuración del reporte
    const { data: configuracion, error: configError } = await supabaseClient
      .from('configuraciones_reportes')
      .select('*')
      .eq('id', configuracion_id)
      .eq('user_id', user.id)
      .single()

    if (configError) throw configError

    // Crear registro de reporte generado
    const { data: reporteGenerado, error: reporteError } = await supabaseClient
      .from('reportes_generados')
      .insert({
        user_id: user.id,
        configuracion_id: configuracion_id,
        tipo: configuracion.tipo,
        formato: configuracion.formato,
        estado: 'generando'
      })
      .select()
      .single()

    if (reporteError) throw reporteError

    // Simular generación de reporte (aquí iría la lógica real)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Actualizar estado a completado
    await supabaseClient
      .from('reportes_generados')
      .update({
        estado: 'completado',
        archivo_url: `https://example.com/reportes/${reporteGenerado.id}.${configuracion.formato}`,
        destinatarios_enviados: configuracion.destinatarios
      })
      .eq('id', reporteGenerado.id)

    return new Response(
      JSON.stringify({
        success: true,
        reporte_id: reporteGenerado.id,
        tipo: configuracion.tipo,
        formato: configuracion.formato
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
