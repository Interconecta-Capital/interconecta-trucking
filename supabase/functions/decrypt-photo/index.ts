/**
 * Edge Function: decrypt-photo
 * FASE 4 - Sprint 2: Cifrado de Datos Sensibles
 * 
 * Descifra fotos de licencias de conductores de forma segura.
 * Solo accesible por el propietario del conductor o superusuarios.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DecryptRequest {
  conductorId: string;
}

interface DecryptResponse {
  success: boolean;
  photoData?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No autorizado: falta token de autenticación' 
        } as DecryptResponse),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Crear cliente de Supabase con el token del usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { 
          headers: { Authorization: authHeader } 
        },
      }
    );

    // Parsear request body
    const { conductorId }: DecryptRequest = await req.json();

    if (!conductorId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'conductorId es requerido' 
        } as DecryptResponse),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Llamar a función de descifrado en PostgreSQL
    // Esta función verifica automáticamente permisos (RLS)
    const { data, error } = await supabaseClient
      .rpc('decrypt_conductor_photo', { 
        conductor_id: conductorId 
      });

    if (error) {
      console.error('[decrypt-photo] Error:', error);
      
      // Distinguir entre error de permisos y otros errores
      if (error.message.includes('No autorizado')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No autorizado para acceder a esta foto' 
          } as DecryptResponse),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw error;
    }

    // Registrar acceso exitoso
    console.log(`[decrypt-photo] Photo decrypted successfully for conductor: ${conductorId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        photoData: data 
      } as DecryptResponse),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[decrypt-photo] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      } as DecryptResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
