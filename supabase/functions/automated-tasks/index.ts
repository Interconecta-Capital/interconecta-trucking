
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Ejecutando tareas automáticas...')

    // Ejecutar la función que procesa todas las tareas automáticas
    const { error } = await supabase.rpc('run_automated_tasks')

    if (error) {
      console.error('❌ Error ejecutando tareas automáticas:', error)
      throw error
    }

    console.log('✅ Tareas automáticas completadas exitosamente')

    // Log de las tareas ejecutadas
    const logData = {
      timestamp: new Date().toISOString(),
      tasks_executed: [
        'process_expired_trials',
        'cleanup_old_notifications', 
        'check_document_expiration'
      ],
      status: 'success'
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tareas automáticas ejecutadas correctamente',
        data: logData
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('❌ Error en automated-tasks:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
