
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

    const { configuracion_id, configuracion } = await req.json()

    // Aquí se programaría el cron job usando pg_cron
    // Por ahora simularemos la programación
    console.log(`Programando reporte ${configuracion_id} con frecuencia: ${configuracion.horario.frecuencia}`)

    // En un entorno real, aquí se usaría pg_cron para programar la ejecución
    // SELECT cron.schedule('reporte-' || configuracion_id, configuracion.horario.frecuencia, 
    //   'SELECT net.http_post(...)')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reporte programado exitosamente',
        configuracion_id: configuracion_id,
        frecuencia: configuracion.horario.frecuencia
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
