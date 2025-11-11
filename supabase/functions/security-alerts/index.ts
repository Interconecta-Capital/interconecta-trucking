import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  severity: string;
  created_at: string;
  ip_address: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get critical events from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: criticalEvents, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .in('event_type', ['failed_login', 'role_changed', 'user_anonymized', 'secret_access'])
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Detect suspicious patterns
    const suspiciousActivity = detectSuspiciousPatterns(criticalEvents || []);

    // Log detection results
    console.log(`[SecurityAlerts] Processed ${criticalEvents?.length || 0} events`);
    console.log(`[SecurityAlerts] Found ${suspiciousActivity.length} suspicious patterns`);

    // Send alerts for suspicious activity
    if (suspiciousActivity.length > 0) {
      await sendAlertsToSuperusers(supabase, suspiciousActivity);
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventsProcessed: criticalEvents?.length || 0,
        alertsSent: suspiciousActivity.length,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[SecurityAlerts] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function detectSuspiciousPatterns(events: SecurityEvent[]) {
  const suspicious = [];

  // Group failed logins by user/IP
  const failedLoginsByUser = events
    .filter(e => e.event_type === 'failed_login')
    .reduce((acc, event) => {
      const key = event.user_id || event.ip_address || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Alert on multiple failed logins (5+ in 5 minutes)
  for (const [identifier, count] of Object.entries(failedLoginsByUser)) {
    if (count >= 5) {
      suspicious.push({
        type: 'multiple_failed_logins',
        severity: 'high',
        description: `${count} intentos de login fallidos detectados`,
        identifier,
        count,
      });
    }
  }

  // Alert on role changes
  const roleChanges = events.filter(e => e.event_type === 'role_changed');
  if (roleChanges.length > 0) {
    suspicious.push({
      type: 'role_changes',
      severity: 'medium',
      description: `${roleChanges.length} cambios de rol detectados`,
      events: roleChanges.map(e => ({
        user_id: e.user_id,
        timestamp: e.created_at,
        data: e.event_data,
      })),
    });
  }

  // Alert on user anonymization (account deletion)
  const anonymizations = events.filter(e => e.event_type === 'user_anonymized');
  if (anonymizations.length > 0) {
    suspicious.push({
      type: 'user_anonymizations',
      severity: 'info',
      description: `${anonymizations.length} usuarios anonimizados`,
      count: anonymizations.length,
    });
  }

  return suspicious;
}

async function sendAlertsToSuperusers(supabase: any, suspiciousActivity: any[]) {
  // Get all superusers
  const { data: superusers } = await supabase
    .from('user_roles')
    .select('user_id, profiles(email)')
    .eq('role', 'superuser');

  if (!superusers || superusers.length === 0) {
    console.log('[SecurityAlerts] No superusers found to send alerts');
    return;
  }

  // Create notifications in database
  const notifications = superusers.map((su: any) => ({
    user_id: su.user_id,
    tipo: 'warning',
    titulo: 'Alerta de Seguridad',
    mensaje: `Se detectaron ${suspiciousActivity.length} actividades sospechosas en el sistema`,
    urgente: true,
    entidad_tipo: 'security',
    metadata: { activities: suspiciousActivity },
  }));

  await supabase.from('notificaciones').insert(notifications);

  console.log(`[SecurityAlerts] Sent alerts to ${superusers.length} superusers`);
}
