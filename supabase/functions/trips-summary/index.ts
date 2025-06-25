import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSupabaseClient, verifyAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { error: authError, user } = await verifyAuth(req);
  if (authError || !user) {
    return authError!;
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("viajes")
    .select("estado, fecha_inicio_real, fecha_fin_real, fecha_inicio_programada, tracking_data")
    .eq("user_id", user.id);

  if (error) {
    console.error("trips-summary error", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const viajes = data || [];

  let completados = 0;
  let enTransito = 0;
  let programados = 0;
  let cancelados = 0;
  let duracionTotal = 0;
  let duracionCount = 0;
  let distanciaTotal = 0;
  let distanciaCount = 0;

  const monthMap = new Map<string, number>();

  for (const v of viajes) {
    switch (v.estado) {
      case "completado":
        completados++;
        break;
      case "en_transito":
        enTransito++;
        break;
      case "programado":
        programados++;
        break;
      case "cancelado":
        cancelados++;
        break;
    }

    if (v.fecha_inicio_real && v.fecha_fin_real) {
      const start = Date.parse(v.fecha_inicio_real);
      const end = Date.parse(v.fecha_fin_real);
      duracionTotal += (end - start) / (1000 * 60 * 60);
      duracionCount++;
    }

    if (v.tracking_data && typeof v.tracking_data.distanciaRecorrida === "number") {
      distanciaTotal += v.tracking_data.distanciaRecorrida;
      distanciaCount++;
    }

    const fecha = v.fecha_inicio_programada ? new Date(v.fecha_inicio_programada) : new Date();
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }

  const promedioDuracion = duracionCount ? duracionTotal / duracionCount : 0;
  const promedioDistancia = distanciaCount ? distanciaTotal / distanciaCount : 0;

  const tendencias: Array<{ mes: string; viajes: number; costos: number; eficiencia: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleString("es-MX", { month: "short" });
    tendencias.push({
      mes: label.charAt(0).toUpperCase() + label.slice(1),
      viajes: monthMap.get(key) || 0,
      costos: 0,
      eficiencia: 0,
    });
  }

  const result = {
    viajes: {
      total: viajes.length,
      completados,
      enTransito,
      programados,
      cancelados,
      promedioDuracion: parseFloat(promedioDuracion.toFixed(2)),
      promedioDistancia: parseFloat(promedioDistancia.toFixed(2)),
    },
    costos: {
      combustible: 0,
      casetas: 0,
      mantenimiento: 0,
      operadores: 0,
      total: 0,
    },
    eficiencia: {
      puntualidad: 0,
      utilizacionFlota: 0,
      kmPorLitro: 0,
      costoPorKm: 0,
    },
    tendencias,
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

