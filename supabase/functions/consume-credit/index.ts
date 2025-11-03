import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Obtener balance actual del usuario
    const { data: creditos, error: creditosError } = await supabaseClient
      .from('creditos_usuarios')
      .select('balance_disponible, total_consumidos')
      .eq('user_id', user.id)
      .single();

    if (creditosError || !creditos) {
      logStep("No credits account found");
      return new Response(JSON.stringify({ 
        error: 'NO_CREDITS_ACCOUNT',
        message: 'No tienes una cuenta de créditos. Compra tu primer paquete de timbres.',
        balance: 0
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402 
      });
    }

    logStep("Current balance", { balance: creditos.balance_disponible });

    // Verificar si tiene créditos disponibles
    if (creditos.balance_disponible < 1) {
      logStep("Insufficient credits");
      return new Response(JSON.stringify({ 
        error: 'INSUFFICIENT_CREDITS',
        message: '¡Agotaste tus créditos! Recarga tu saldo para seguir timbrando.',
        balance: 0
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402 
      });
    }

    // Consumir 1 crédito (transacción atómica)
    const nuevoBalance = creditos.balance_disponible - 1;
    const nuevoTotalConsumidos = (creditos.total_consumidos || 0) + 1;

    const { error: updateError } = await supabaseClient
      .from('creditos_usuarios')
      .update({ 
        balance_disponible: nuevoBalance,
        total_consumidos: nuevoTotalConsumidos,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("ERROR updating balance", { error: updateError.message });
      throw new Error('Error al actualizar el balance de créditos');
    }

    // Registrar transacción
    const { error: transactionError } = await supabaseClient
      .from('transacciones_creditos')
      .insert({
        user_id: user.id,
        tipo: 'consumo',
        cantidad: -1,
        balance_anterior: creditos.balance_disponible,
        balance_nuevo: nuevoBalance,
        carta_porte_id: carta_porte_id,
        notas: 'Timbre consumido para Carta Porte'
      });

    if (transactionError) {
      logStep("ERROR registering transaction", { error: transactionError.message });
    }

    logStep("Credit consumed successfully", { newBalance: nuevoBalance });

    return new Response(JSON.stringify({ 
      success: true, 
      balance: nuevoBalance,
      message: `Crédito consumido exitosamente. Te quedan ${nuevoBalance} timbres disponibles.`
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
