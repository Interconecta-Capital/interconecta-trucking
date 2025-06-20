
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar usuario por email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Actualizar a superusuario
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ plan_type: 'superuser' })
      .eq('id', profile.id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Actualizar metadata en auth
    const { error: authUpdateError } = await supabaseClient.auth.admin.updateUserById(
      profile.id,
      {
        user_metadata: {
          is_superuser: 'true'
        }
      }
    )

    if (authUpdateError) {
      console.error('Auth metadata update error:', authUpdateError)
    }

    // Eliminar restricciones existentes
    await supabaseClient
      .from('suscripciones')
      .delete()
      .eq('user_id', profile.id)

    await supabaseClient
      .from('bloqueos_usuario')
      .update({ activo: false })
      .eq('user_id', profile.id)

    // Log de seguridad
    await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: profile.id,
        event_type: 'converted_to_superuser_via_function',
        event_data: {
          email,
          converted_via: 'edge_function'
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario convertido a superusuario exitosamente'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
