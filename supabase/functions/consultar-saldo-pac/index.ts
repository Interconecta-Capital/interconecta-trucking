
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { verifyAuth, logSecurityEvent, corsHeaders } from "../_shared/auth.ts";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { error: authError, user } = await verifyAuth(req);
  if (authError || !user) {
    await logSecurityEvent(
      user?.id ?? 'anonymous',
      'unauthorized_access',
      { endpoint: 'consultar-saldo-pac' },
      req.headers.get('x-forwarded-for') ?? undefined,
      req.headers.get('user-agent') ?? undefined,
    );
    return (
      authError ??
      new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    );
  }

  try {
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY')!;

    // Consultar saldo en FISCAL API
    const response = await fetch('https://api.fiscalapi.com/v1/account/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error consultando saldo en FISCAL API'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const balanceData = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        saldo: balanceData.balance,
        message: `Saldo disponible: ${balanceData.balance} timbres`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error consultando saldo:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
