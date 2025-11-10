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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('No autenticado');
    }

    console.log(`Exportando datos para usuario: ${user.id}`);

    // Llamar función SQL de exportación
    const { data: exportData, error: exportError } = await supabaseClient
      .rpc('exportar_datos_usuario', { target_user_id: user.id });

    if (exportError) {
      console.error('Export error:', exportError);
      throw exportError;
    }

    console.log('Exportación completada exitosamente');

    return new Response(
      JSON.stringify(exportData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="user_data_${user.id}_${Date.now()}.json"`,
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error en export-user-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Error al exportar datos del usuario'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
