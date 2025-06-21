
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Get Mapbox token from environment
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    
    if (!mapboxToken) {
      throw new Error('Mapbox token not configured')
    }

    // Log the token request for security monitoring
    await supabaseClient.rpc('log_enhanced_security_event', {
      p_user_id: user.id,
      p_event_type: 'mapbox_token_requested',
      p_event_data: {
        timestamp: new Date().toISOString(),
        user_agent: req.headers.get('User-Agent'),
      },
      p_risk_level: 'low'
    })

    return new Response(
      JSON.stringify({ 
        token: mapboxToken,
        expires_in: 3600 // Token valid for 1 hour
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=3600'
        },
      }
    )
  } catch (error) {
    console.error('Error in get-mapbox-token function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve map configuration',
        code: 'MAPBOX_TOKEN_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
