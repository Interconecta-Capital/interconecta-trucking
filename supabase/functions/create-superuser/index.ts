
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

    const { email, password, nombre = 'Superusuario', empresa = 'Sistema' } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generar contraseña segura si no se proporciona
    const finalPassword = password || `SuperUser${Math.random().toString(36).slice(2)}!`

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: {
        nombre,
        empresa,
        is_superuser: 'true'
      }
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Crear profile como superusuario
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        nombre,
        empresa,
        plan_type: 'superuser'
      })

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Log de seguridad
    await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: authData.user.id,
        event_type: 'superuser_created_via_function',
        event_data: {
          email,
          nombre,
          created_via: 'edge_function'
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authData.user.id,
        email,
        password: finalPassword,
        message: 'Superusuario creado exitosamente'
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
