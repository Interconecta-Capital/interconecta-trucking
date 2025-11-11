import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DecryptRequest {
  tableName: 'conductores' | 'vehiculos' | 'remolques' | 'socios';
  recordId: string;
  columnName: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[decrypt-document] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('[decrypt-document] Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tableName, recordId, columnName }: DecryptRequest = await req.json();

    if (!tableName || !recordId || !columnName) {
      console.error('[decrypt-document] Missing parameters');
      return new Response(
        JSON.stringify({ success: false, error: 'Parámetros faltantes: tableName, recordId, columnName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate table name
    const validTables = ['conductores', 'vehiculos', 'remolques', 'socios'];
    if (!validTables.includes(tableName)) {
      console.error('[decrypt-document] Invalid table name:', tableName);
      return new Response(
        JSON.stringify({ success: false, error: 'Tabla no válida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[decrypt-document] Decrypting ${columnName} from ${tableName} for record ${recordId}`);

    // Call decrypt function
    const { data, error } = await supabaseClient.rpc('decrypt_document', {
      table_name: tableName,
      record_id: recordId,
      column_name: columnName
    });

    if (error) {
      console.error('[decrypt-document] Decrypt error:', error);
      
      const isUnauthorized = error.message.includes('No autorizado') || 
                            error.message.includes('not authorized') ||
                            error.code === 'PGRST301';
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: isUnauthorized 
            ? 'No autorizado para acceder a este documento' 
            : 'Error al descifrar documento'
        }),
        { 
          status: isUnauthorized ? 403 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data) {
      console.error('[decrypt-document] No data returned');
      return new Response(
        JSON.stringify({ success: false, error: 'Documento no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[decrypt-document] Successfully decrypted document`);

    return new Response(
      JSON.stringify({ success: true, documentData: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[decrypt-document] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
