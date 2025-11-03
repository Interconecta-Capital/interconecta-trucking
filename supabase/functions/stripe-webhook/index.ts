import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR: Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    logStep("Webhook event received", { type: event.type });

    // ============================================
    // CASO 1: COMPRA DE CRÉDITOS (ONE-TIME PAYMENT)
    // ============================================
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Verificar si es una compra de créditos
      if (session.metadata?.type === 'credit_purchase') {
        logStep("Processing credit purchase", { 
          userId: session.metadata.user_id,
          creditos: session.metadata.cantidad_creditos 
        });

        const userId = session.metadata.user_id;
        const cantidad = parseInt(session.metadata.cantidad_creditos);
        const paqueteId = session.metadata.paquete_id;

        // Obtener balance actual o crear cuenta
        const { data: creditos } = await supabaseClient
          .from('creditos_usuarios')
          .select('balance_disponible, total_comprados')
          .eq('user_id', userId)
          .single();

        const balanceActual = creditos?.balance_disponible || 0;
        const totalCompradosActual = creditos?.total_comprados || 0;
        const nuevoBalance = balanceActual + cantidad;
        const nuevoTotalComprados = totalCompradosActual + cantidad;

        // Actualizar balance (UPSERT)
        const { error: updateError } = await supabaseClient
          .from('creditos_usuarios')
          .upsert({
            user_id: userId,
            balance_disponible: nuevoBalance,
            total_comprados: nuevoTotalComprados,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (updateError) {
          logStep("ERROR updating credits balance", { error: updateError.message });
          throw updateError;
        }

        // Registrar transacción
        const { error: transactionError } = await supabaseClient
          .from('transacciones_creditos')
          .insert({
            user_id: userId,
            tipo: 'compra',
            cantidad: cantidad,
            balance_anterior: balanceActual,
            balance_nuevo: nuevoBalance,
            paquete_id: paqueteId,
            stripe_payment_intent_id: session.payment_intent as string,
            notas: `Compra de ${session.metadata.paquete_nombre} vía Stripe`
          });

        if (transactionError) {
          logStep("ERROR registering transaction", { error: transactionError.message });
        }

        logStep("Credit purchase processed successfully", { 
          newBalance: nuevoBalance,
          totalComprados: nuevoTotalComprados
        });
      }
      
      // ============================================
      // CASO 2: SUSCRIPCIÓN (SUBSCRIPTION PAYMENT)
      // ============================================
      else {
        logStep("Processing subscription payment", { 
          customerId: session.customer,
          subscriptionId: session.subscription 
        });

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        // Obtener email del customer
        const customer = await stripe.customers.retrieve(customerId);
        const email = 'email' in customer ? customer.email : null;
        
        if (!email) {
          throw new Error("Customer email not found");
        }

        // Buscar usuario por email
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);
        
        if (!user) {
          throw new Error(`User not found for email: ${email}`);
        }

        // Obtener detalles de la suscripción
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        // Buscar plan por metadata o precio
        const { data: plan } = await supabaseClient
          .from("planes_suscripcion")
          .select("*")
          .eq("id", session.metadata?.planId || '')
          .single();

        if (plan) {
          // Actualizar o crear suscripción
          await supabaseClient
            .from("suscripciones")
            .upsert({
              user_id: user.id,
              plan_id: plan.id,
              status: subscription.status === 'active' ? 'active' : 'past_due',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              fecha_inicio: new Date(subscription.current_period_start * 1000).toISOString(),
              fecha_vencimiento: new Date(subscription.current_period_end * 1000).toISOString(),
              ultimo_pago: new Date().toISOString(),
              proximo_pago: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          logStep("Subscription updated successfully", { userId: user.id, planId: plan.id });
        }
      }
    }

    // ============================================
    // ACTUALIZACIÓN DE SUSCRIPCIÓN
    // ============================================
    else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      
      logStep("Subscription updated", { 
        subscriptionId: subscription.id,
        status: subscription.status 
      });

      const { error } = await supabaseClient
        .from("suscripciones")
        .update({
          status: subscription.status === 'active' ? 'active' : 'past_due',
          fecha_vencimiento: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        logStep("ERROR updating subscription", { error: error.message });
      }
    }

    // ============================================
    // CANCELACIÓN DE SUSCRIPCIÓN
    // ============================================
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      logStep("Subscription canceled", { subscriptionId: subscription.id });

      const { error } = await supabaseClient
        .from("suscripciones")
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        logStep("ERROR canceling subscription", { error: error.message });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
