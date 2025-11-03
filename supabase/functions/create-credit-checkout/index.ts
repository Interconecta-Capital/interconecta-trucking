import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CREDIT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { paquete_id } = await req.json();
    if (!paquete_id) throw new Error("Paquete ID is required");
    logStep("Paquete ID received", { paquete_id });

    // Obtener detalles del paquete
    const { data: paquete, error: paqueteError } = await supabaseClient
      .from("paquetes_creditos")
      .select("*")
      .eq("id", paquete_id)
      .eq("activo", true)
      .single();

    if (paqueteError || !paquete) throw new Error("Paquete no encontrado o inactivo");
    logStep("Paquete found", { 
      nombre: paquete.nombre, 
      creditos: paquete.cantidad_creditos,
      precio: paquete.precio_mxn 
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verificar si existe un customer de Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Crear sesión de checkout (ONE-TIME PAYMENT)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: { 
              name: `${paquete.nombre} - ${paquete.cantidad_creditos} Timbres`,
              description: paquete.descripcion || `$${paquete.precio_por_credito} MXN por timbre`
            },
            unit_amount: Math.round(paquete.precio_mxn * 100), // Convertir a centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment", // ⚠️ ONE-TIME payment, NOT subscription
      success_url: `${req.headers.get("origin")}/creditos?success=true`,
      cancel_url: `${req.headers.get("origin")}/creditos?canceled=true`,
      metadata: {
        type: 'credit_purchase',
        paquete_id: paquete.id,
        user_id: user.id,
        cantidad_creditos: paquete.cantidad_creditos.toString(),
        paquete_nombre: paquete.nombre
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-credit-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
