import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RENOVAR-TIMBRES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("🔄 Iniciando renovación mensual de timbres");

    // 1. Obtener todos los usuarios con suscripciones activas
    const { data: suscripciones, error: subsError } = await supabaseClient
      .from('suscripciones')
      .select(`
        user_id,
        plan_id,
        planes_suscripcion (
          nombre,
          timbres_mensuales
        )
      `)
      .in('status', ['active', 'trial']);

    if (subsError) {
      logStep("❌ Error obteniendo suscripciones", { error: subsError.message });
      throw subsError;
    }

    logStep("📊 Suscripciones activas encontradas", { count: suscripciones?.length });

    let renovados = 0;
    let errores = 0;

    // 2. Renovar timbres para cada usuario
    for (const sub of suscripciones || []) {
      try {
        const timbresNuevos = sub.planes_suscripcion?.timbres_mensuales || 0;
        
        if (timbresNuevos === 0) {
          logStep("⏭️ Usuario sin timbres mensuales", { userId: sub.user_id });
          continue;
        }

        // Actualizar timbres del mes actual
        const { error: updateError } = await supabaseClient
          .from('creditos_usuarios')
          .update({
            timbres_mes_actual: timbresNuevos,
            fecha_renovacion: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', sub.user_id);

        if (updateError) {
          logStep("❌ Error actualizando usuario", { userId: sub.user_id, error: updateError.message });
          errores++;
          continue;
        }

        // Registrar transacción de renovación
        const { error: transError } = await supabaseClient
          .from('transacciones_creditos')
          .insert({
            user_id: sub.user_id,
            tipo: 'renovacion',
            cantidad: timbresNuevos,
            balance_anterior: 0,
            balance_nuevo: timbresNuevos,
            notas: `Renovación mensual: ${timbresNuevos} timbres del plan ${sub.planes_suscripcion?.nombre}`
          });

        if (transError) {
          logStep("⚠️ Error registrando transacción", { userId: sub.user_id, error: transError.message });
        }

        renovados++;
        logStep("✅ Timbres renovados", { userId: sub.user_id, timbres: timbresNuevos });

      } catch (userError) {
        logStep("❌ Error procesando usuario", { userId: sub.user_id, error: String(userError) });
        errores++;
      }
    }

    logStep("🎉 Renovación completada", { 
      total: suscripciones?.length,
      renovados,
      errores 
    });

    return new Response(JSON.stringify({ 
      success: true,
      mensaje: `Renovación completada: ${renovados} usuarios renovados, ${errores} errores`,
      stats: {
        total: suscripciones?.length || 0,
        renovados,
        errores
      }
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERROR GLOBAL", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
