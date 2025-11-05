import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONSUME-CREDIT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { carta_porte_id } = await req.json();
    logStep("Request data", { carta_porte_id });

    // Obtener timbres mensuales del usuario
    const { data: creditos, error: creditosError } = await supabaseClient
      .from('creditos_usuarios')
      .select('timbres_mes_actual, total_consumidos')
      .eq('user_id', user.id)
      .single();

    if (creditosError || !creditos) {
      logStep("No credits account found");
      return new Response(JSON.stringify({ 
        error: 'NO_CREDITS_ACCOUNT',
        message: 'No tienes una cuenta de timbres. Contacta a soporte.',
        balance: 0
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402 
      });
    }

    logStep("Current monthly balance", { timbres: creditos.timbres_mes_actual });

    // Verificar si tiene timbres disponibles este mes
    if (creditos.timbres_mes_actual < 1) {
      logStep("Insufficient monthly credits");
      return new Response(JSON.stringify({ 
        error: 'INSUFFICIENT_CREDITS',
        message: '¡Agotaste tus timbres del mes! Haz upgrade a un plan superior para seguir timbrando.',
        balance: 0,
        requiresUpgrade: true
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402 
      });
    }

    // Consumir 1 timbre del mes actual
    const nuevosTimbres = creditos.timbres_mes_actual - 1;
    const nuevoTotalConsumidos = (creditos.total_consumidos || 0) + 1;

    const { error: updateError } = await supabaseClient
      .from('creditos_usuarios')
      .update({ 
        timbres_mes_actual: nuevosTimbres,
        total_consumidos: nuevoTotalConsumidos,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("ERROR updating balance", { error: updateError.message });
      throw new Error('Error al actualizar los timbres');
    }

    // Registrar transacción
    const { error: transactionError } = await supabaseClient
      .from('transacciones_creditos')
      .insert({
        user_id: user.id,
        tipo: 'consumo',
        cantidad: -1,
        balance_anterior: creditos.timbres_mes_actual,
        balance_nuevo: nuevosTimbres,
        carta_porte_id: carta_porte_id,
        notas: 'Timbre consumido para Carta Porte'
      });

    if (transactionError) {
      logStep("ERROR registering transaction", { error: transactionError.message });
    }

    logStep("Credit consumed successfully", { newBalance: nuevosTimbres });

    return new Response(JSON.stringify({ 
      success: true, 
      balance: nuevosTimbres,
      message: `Timbre consumido exitosamente. Te quedan ${nuevosTimbres} timbres este mes.`
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in consume-credit", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
