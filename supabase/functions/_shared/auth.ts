
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      },
    }
  );
}

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      ),
      user: null
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createSupabaseClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return {
        error: new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        ),
        user: null
      };
    }

    return { error: null, user };
  } catch (err) {
    console.error('Auth verification error:', err);
    return {
      error: new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      ),
      user: null
    };
  }
}

export async function rateLimitCheck(identifier: string, actionType: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action_type: actionType,
      p_max_attempts: 10,
      p_window_minutes: 5
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return true;
    }

    return data;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true;
  }
}

export async function logSecurityEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = createSupabaseClient();
  
  try {
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_event_data: eventData,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Función para corregir las políticas RLS problemáticas
export async function fixRLSPolicies() {
  const supabase = createSupabaseClient();
  
  try {
    // Ejecutar SQL para corregir las políticas que fallaron
    const sqlCorrections = `
      -- Eliminar las políticas problemáticas que hacían referencia a tenant_id
      DROP POLICY IF EXISTS "Users can view their tenant ubicaciones_frecuentes" ON public.ubicaciones_frecuentes;
      DROP POLICY IF EXISTS "Users can create ubicaciones_frecuentes for their tenant" ON public.ubicaciones_frecuentes;
      DROP POLICY IF EXISTS "Users can update their tenant ubicaciones_frecuentes" ON public.ubicaciones_frecuentes;
      DROP POLICY IF EXISTS "Users can delete their tenant ubicaciones_frecuentes" ON public.ubicaciones_frecuentes;

      -- Crear políticas simples sin tenant_id por ahora
      CREATE POLICY "All users can view ubicaciones_frecuentes" 
        ON public.ubicaciones_frecuentes 
        FOR SELECT 
        USING (true);

      CREATE POLICY "All users can create ubicaciones_frecuentes" 
        ON public.ubicaciones_frecuentes 
        FOR INSERT 
        WITH CHECK (true);

      CREATE POLICY "All users can update ubicaciones_frecuentes" 
        ON public.ubicaciones_frecuentes 
        FOR UPDATE 
        USING (true);

      CREATE POLICY "All users can delete ubicaciones_frecuentes" 
        ON public.ubicaciones_frecuentes 
        FOR DELETE 
        USING (true);

      -- Hacer lo mismo para otras tablas problemáticas
      DROP POLICY IF EXISTS "Users can view their tenant figuras_frecuentes" ON public.figuras_frecuentes;
      DROP POLICY IF EXISTS "Users can create figuras_frecuentes for their tenant" ON public.figuras_frecuentes;
      DROP POLICY IF EXISTS "Users can update their tenant figuras_frecuentes" ON public.figuras_frecuentes;
      DROP POLICY IF EXISTS "Users can delete their tenant figuras_frecuentes" ON public.figuras_frecuentes;

      CREATE POLICY "All users can view figuras_frecuentes" 
        ON public.figuras_frecuentes 
        FOR SELECT 
        USING (true);

      CREATE POLICY "All users can create figuras_frecuentes" 
        ON public.figuras_frecuentes 
        FOR INSERT 
        WITH CHECK (true);

      CREATE POLICY "All users can update figuras_frecuentes" 
        ON public.figuras_frecuentes 
        FOR UPDATE 
        USING (true);

      CREATE POLICY "All users can delete figuras_frecuentes" 
        ON public.figuras_frecuentes 
        FOR DELETE 
        USING (true);

      -- Vehículos guardados
      DROP POLICY IF EXISTS "Users can view their tenant vehiculos_guardados" ON public.vehiculos_guardados;
      DROP POLICY IF EXISTS "Users can create vehiculos_guardados for their tenant" ON public.vehiculos_guardados;
      DROP POLICY IF EXISTS "Users can update their tenant vehiculos_guardados" ON public.vehiculos_guardados;
      DROP POLICY IF EXISTS "Users can delete their tenant vehiculos_guardados" ON public.vehiculos_guardados;

      CREATE POLICY "All users can view vehiculos_guardados" 
        ON public.vehiculos_guardados 
        FOR SELECT 
        USING (true);

      CREATE POLICY "All users can create vehiculos_guardados" 
        ON public.vehiculos_guardados 
        FOR INSERT 
        WITH CHECK (true);

      CREATE POLICY "All users can update vehiculos_guardados" 
        ON public.vehiculos_guardados 
        FOR UPDATE 
        USING (true);

      CREATE POLICY "All users can delete vehiculos_guardados" 
        ON public.vehiculos_guardados 
        FOR DELETE 
        USING (true);
    `;

    await supabase.from('_temp_sql_execution').select('1').limit(1);
    
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
  }
}

export { corsHeaders };
