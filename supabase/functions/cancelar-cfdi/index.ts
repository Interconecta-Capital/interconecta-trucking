
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { uuid, motivo, folioSustitucion } = await req.json()

    if (!uuid || !motivo) {
      return new Response(
        JSON.stringify({ error: 'UUID y motivo son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener la API key del PAC desde los secrets
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY')
    if (!fiscalApiKey) {
      throw new Error('FISCAL_API_KEY no está configurada')
    }

    // Preparar datos para cancelación
    const cancelacionData = {
      uuid: uuid,
      motivo: motivo,
      ...(folioSustitucion && { folioSustitucion })
    }

    console.log('Enviando cancelación al PAC:', cancelacionData)

    // Llamar al API del PAC para cancelar
    const response = await fetch('https://api.fiscal.mx/v2/cfdi/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cancelacionData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Error del PAC:', errorData)
      throw new Error(`Error del PAC: ${response.status} - ${errorData}`)
    }

    const result = await response.json()
    console.log('Respuesta del PAC:', result)

    // Verificar si la cancelación fue exitosa
    if (result.success || result.status === 'success') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'CFDI cancelado exitosamente',
          data: result,
          uuid: uuid
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error(result.message || 'Error en la cancelación')
    }

  } catch (error) {
    console.error('Error en cancelación:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
