import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface OperacionEvento {
  id: string;
  tipo: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  metadata: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = auth.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let startDate: string | null = null;
    let endDate: string | null = null;
    try {
      const body = await req.json();
      startDate = body.start_date ?? null;
      endDate = body.end_date ?? null;
    } catch (_) {
      // ignore empty body
    }

    const viajesQuery = supabase
      .from('viajes')
      .select(
        `id, origen, destino, estado, carta_porte_id,
         fecha_inicio_programada, fecha_fin_programada,
         vehiculo:vehiculos(id, placa),
         conductor:conductores(id, nombre)`
      )
      .eq('user_id', user.id);
    if (startDate) viajesQuery.gte('fecha_inicio_programada', startDate);
    if (endDate) viajesQuery.lte('fecha_inicio_programada', endDate);
    const { data: viajes, error: viajesError } = await viajesQuery;

    if (viajesError) throw viajesError;

    const programacionesQuery = supabase
      .from('programaciones')
      .select(
        'id, tipo_programacion, descripcion, fecha_inicio, fecha_fin, entidad_tipo, estado'
      )
      .eq('user_id', user.id);
    if (startDate) programacionesQuery.gte('fecha_inicio', startDate);
    if (endDate) programacionesQuery.lte('fecha_inicio', endDate);
    const { data: programaciones, error: progError } = await programacionesQuery;

    if (progError) throw progError;

    const events: OperacionEvento[] = [];

    for (const v of viajes ?? []) {
      events.push({
        id: `viaje-${v.id}`,
        tipo: 'viaje',
        titulo: `${v.carta_porte_id} ${v.origen}→${v.destino}`,
        fecha_inicio: v.fecha_inicio_programada,
        fecha_fin: v.fecha_fin_programada,
        metadata: {
          estado: v.estado,
          carta_porte_id: v.carta_porte_id,
          vehiculo: v.vehiculo?.placa ?? null,
          conductor: v.conductor?.nombre ?? null,
        },
      });
    }

    for (const p of programaciones ?? []) {
      events.push({
        id: `prog-${p.id}`,
        tipo: p.tipo_programacion,
        titulo: p.descripcion,
        fecha_inicio: p.fecha_inicio,
        fecha_fin: p.fecha_fin,
        metadata: {
          entidad: p.entidad_tipo,
          estado: p.estado,
          todo_dia: true,
        },
      });
    }

    return new Response(JSON.stringify({ events, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('operaciones-eventos error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
