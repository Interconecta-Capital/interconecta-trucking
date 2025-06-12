
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
      return true; // Allow on error to prevent blocking legitimate users
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

export { corsHeaders };
