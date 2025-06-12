
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("suscripciones").upsert({
        user_id: user.id,
        plan_id: null,
        status: "trial",
        fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        status: "trial",
        planId: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let planId = null;
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Obtener el plan basado en el precio
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      // Buscar el plan correspondiente en la base de datos
      const { data: matchingPlan } = await supabaseClient
        .from("planes_suscripcion")
        .select("id")
        .eq("precio_mensual", amount / 100) // Convertir de centavos a pesos
        .single();
      
      if (matchingPlan) {
        planId = matchingPlan.id;
        logStep("Plan matched", { planId, amount: amount / 100 });
      }
    } else {
      logStep("No active subscription found");
    }

    // Actualizar o crear suscripción en la base de datos
    await supabaseClient.from("suscripciones").upsert({
      user_id: user.id,
      plan_id: planId,
      status: hasActiveSub ? "active" : "trial",
      fecha_vencimiento: subscriptionEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      planId, 
      status: hasActiveSub ? "active" : "trial" 
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      status: hasActiveSub ? "active" : "trial",
      planId: planId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
