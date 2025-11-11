import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar secret de autorización
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized: Invalid or missing cron secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Starting log sanitization...');

    // Crear cliente de Supabase con service_role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Llamar función de sanitización
    const { error } = await supabaseClient.rpc('sanitize_pii_from_logs');

    if (error) {
      console.error('Sanitization error:', error);
      throw error;
    }

    console.log('Log sanitization completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Log sanitization completed',
        timestamp: new Date().toISOString(),
        control: 'ISO 27001 A.12.4',
        gdpr_article: 'Art. 5(1)(e) - Storage limitation'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in sanitize-logs-cron:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
