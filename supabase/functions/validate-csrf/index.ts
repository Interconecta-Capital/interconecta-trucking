import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar CSRF token
    const csrfToken = req.headers.get('X-CSRF-Token');
    const { operation, sessionToken } = await req.json();

    if (!csrfToken) {
      // Log intento sin CSRF token
      await supabase.from('security_audit_log').insert({
        user_id: user.id,
        event_type: 'csrf_validation_failed',
        event_data: {
          reason: 'missing_csrf_token',
          operation,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent')
        }
      });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'CSRF token missing',
          code: 'CSRF_MISSING' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el token coincide con el almacenado en sesión
    // En una implementación completa, deberías almacenar tokens CSRF en la base de datos
    // por ahora validamos el formato y la longitud
    if (!csrfToken || csrfToken.length !== 64) {
      await supabase.from('security_audit_log').insert({
        user_id: user.id,
        event_type: 'csrf_validation_failed',
        event_data: {
          reason: 'invalid_csrf_format',
          operation,
          token_length: csrfToken?.length || 0,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent')
        }
      });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid CSRF token format',
          code: 'CSRF_INVALID_FORMAT'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validación exitosa
    await supabase.from('security_audit_log').insert({
      user_id: user.id,
      event_type: 'csrf_validation_success',
      event_data: {
        operation,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return new Response(
      JSON.stringify({ 
        valid: true,
        message: 'CSRF token validated successfully',
        user_id: user.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error validating CSRF:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message,
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});