import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = auth.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: viajes, error: viajesError } = await supabase
      .from('viajes')
      .select('estado, fecha_inicio_real, fecha_fin_real, fecha_inicio_programada, fecha_fin_programada, tracking_data')
      .eq('user_id', user.id);

    if (viajesError) throw viajesError;

    const total = viajes?.length || 0;
    const completados = viajes?.filter(v => v.estado === 'completado').length || 0;
    const enTransito = viajes?.filter(v => v.estado === 'en_transito').length || 0;
    const programados = viajes?.filter(v => v.estado === 'programado').length || 0;
    const cancelados = viajes?.filter(v => v.estado === 'cancelado').length || 0;

    const duraciones: number[] = [];
    const distancias: number[] = [];
    let costoTotal = 0;

    for (const v of viajes ?? []) {
      const inicio = v.fecha_inicio_real || v.fecha_inicio_programada;
      const fin = v.fecha_fin_real || v.fecha_fin_programada;
      if (inicio && fin) {
        const diff = (new Date(fin).getTime() - new Date(inicio).getTime()) / 36e5;
        if (!isNaN(diff)) duraciones.push(diff);
      }

      if (v.tracking_data && typeof v.tracking_data === 'object') {
        const td = v.tracking_data as any;
        if (typeof td.distanciaTotal === 'number') distancias.push(td.distanciaTotal);
        if (typeof td.costo_total === 'number') costoTotal += td.costo_total;
      }
    }

    const promedioDuracion = duraciones.length ? duraciones.reduce((a,b) => a+b, 0) / duraciones.length : 0;
    const promedioDistancia = distancias.length ? distancias.reduce((a,b) => a+b, 0) / distancias.length : 0;

    const resumen = {
      viajes: {
        total,
        completados,
        enTransito,
        programados,
        cancelados,
        promedioDuracion: Number(promedioDuracion.toFixed(2)),
        promedioDistancia: Number(promedioDistancia.toFixed(2))
      },
      costos: {
        combustible: costoTotal,
        casetas: 0,
        mantenimiento: 0,
        operadores: 0,
        total: costoTotal
      },
      eficiencia: {
        puntualidad: total ? Math.round((completados / total) * 100) : 0,
        utilizacionFlota: 0,
        kmPorLitro: 0,
        costoPorKm: promedioDistancia ? Number((costoTotal / promedioDistancia).toFixed(2)) : 0
      },
      tendencias: []
    };

    return new Response(JSON.stringify(resumen), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('analytics-trips-summary error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
