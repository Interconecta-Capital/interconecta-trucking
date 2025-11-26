import { supabase } from '@/integrations/supabase/client';

interface ConsumoResult {
  success: boolean;
  source: 'prepaid' | 'plan' | 'none';
  remaining: {
    prepaid: number;
    plan: number;
    total: number;
  };
  error?: string;
}

interface TimbresBalance {
  prepaid: number;
  plan: number;
  total: number;
  planLimit: number;
}

/**
 * Servicio para gestión de consumo de timbres
 * 
 * Prioridad de consumo:
 * 1. Timbres prepagados (balance_disponible en creditos_usuarios)
 * 2. Timbres del plan mensual (timbres_mes_actual)
 * 
 * Nota: Las tablas timbres_prepaid y subscriptions_meta se usarán
 * cuando estén integradas completamente con Stripe. Por ahora usamos
 * el sistema legacy de creditos_usuarios.
 */
export class TimbresService {
  
  /**
   * Obtener balance actual de timbres del usuario
   */
  static async getBalance(userId: string): Promise<TimbresBalance> {
    // Usar el sistema actual de creditos_usuarios
    const { data: creditosData, error } = await supabase
      .from('creditos_usuarios')
      .select('timbres_mes_actual, balance_disponible, total_consumidos')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[TimbresService] Error fetching creditos:', error);
    }

    const prepaidBalance = creditosData?.balance_disponible || 0;
    const planTimbres = creditosData?.timbres_mes_actual || 0;

    return {
      prepaid: prepaidBalance,
      plan: planTimbres,
      total: prepaidBalance + planTimbres,
      planLimit: planTimbres
    };
  }

  /**
   * Consumir un timbre
   * Prioridad: balance_disponible (prepaid) -> timbres_mes_actual (plan)
   */
  static async consumeTimbre(
    userId: string, 
    cartaPorteId: string,
    cantidad: number = 1
  ): Promise<ConsumoResult> {
    console.log(`[TimbresService] Consumiendo ${cantidad} timbre(s) para usuario ${userId}`);

    // Obtener creditos actuales
    const { data: creditos, error: fetchError } = await supabase
      .from('creditos_usuarios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[TimbresService] Error fetching credits:', fetchError);
      return {
        success: false,
        source: 'none',
        remaining: { prepaid: 0, plan: 0, total: 0 },
        error: 'ERROR_FETCHING_CREDITS'
      };
    }

    if (!creditos) {
      return {
        success: false,
        source: 'none',
        remaining: { prepaid: 0, plan: 0, total: 0 },
        error: 'NO_CREDIT_ACCOUNT'
      };
    }

    let remaining = cantidad;
    let source: 'prepaid' | 'plan' | 'none' = 'none';
    let newBalanceDisponible = creditos.balance_disponible || 0;
    let newTimbresMesActual = creditos.timbres_mes_actual || 0;

    // 1. Primero consumir de balance_disponible (prepagados/comprados)
    if (remaining > 0 && newBalanceDisponible > 0) {
      const toConsume = Math.min(remaining, newBalanceDisponible);
      newBalanceDisponible -= toConsume;
      remaining -= toConsume;
      source = 'prepaid';
    }

    // 2. Luego consumir de timbres_mes_actual (del plan mensual)
    if (remaining > 0 && newTimbresMesActual > 0) {
      const toConsume = Math.min(remaining, newTimbresMesActual);
      newTimbresMesActual -= toConsume;
      remaining -= toConsume;
      source = source === 'prepaid' ? 'prepaid' : 'plan';
    }

    // Si aún falta cantidad, no hay suficientes timbres
    if (remaining > 0) {
      return {
        success: false,
        source: 'none',
        remaining: {
          prepaid: creditos.balance_disponible || 0,
          plan: creditos.timbres_mes_actual || 0,
          total: (creditos.balance_disponible || 0) + (creditos.timbres_mes_actual || 0)
        },
        error: 'NO_TIMBRES_DISPONIBLES'
      };
    }

    // Actualizar en base de datos
    const { error: updateError } = await supabase
      .from('creditos_usuarios')
      .update({
        balance_disponible: newBalanceDisponible,
        timbres_mes_actual: newTimbresMesActual,
        total_consumidos: (creditos.total_consumidos || 0) + cantidad,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[TimbresService] Error updating credits:', updateError);
      return {
        success: false,
        source: 'none',
        remaining: {
          prepaid: creditos.balance_disponible || 0,
          plan: creditos.timbres_mes_actual || 0,
          total: (creditos.balance_disponible || 0) + (creditos.timbres_mes_actual || 0)
        },
        error: 'ERROR_UPDATING_CREDITS'
      };
    }

    // Registrar transacción
    await supabase.from('transacciones_creditos').insert({
      user_id: userId,
      tipo: 'consumo',
      cantidad: -cantidad,
      balance_anterior: (creditos.balance_disponible || 0) + (creditos.timbres_mes_actual || 0),
      balance_nuevo: newBalanceDisponible + newTimbresMesActual,
      notas: `Consumo por carta porte ${cartaPorteId}`
    });

    console.log(`[TimbresService] Consumo exitoso. Source: ${source}, Remaining: ${newBalanceDisponible + newTimbresMesActual}`);

    return {
      success: true,
      source,
      remaining: {
        prepaid: newBalanceDisponible,
        plan: newTimbresMesActual,
        total: newBalanceDisponible + newTimbresMesActual
      }
    };
  }

  /**
   * Verificar si el usuario tiene timbres disponibles
   */
  static async hasTimbresDisponibles(userId: string, cantidad: number = 1): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.total >= cantidad;
  }

  /**
   * Agregar timbres (después de compra)
   */
  static async addTimbres(
    userId: string,
    cantidad: number,
    purchaseId?: string
  ): Promise<boolean> {
    // Obtener balance actual
    const { data: creditos, error: fetchError } = await supabase
      .from('creditos_usuarios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[TimbresService] Error fetching credits for add:', fetchError);
      return false;
    }

    const currentBalance = creditos?.balance_disponible || 0;
    const currentTotalComprados = creditos?.total_comprados || 0;
    const newBalance = currentBalance + cantidad;

    // Upsert creditos
    const { error: upsertError } = await supabase
      .from('creditos_usuarios')
      .upsert({
        user_id: userId,
        balance_disponible: newBalance,
        total_comprados: currentTotalComprados + cantidad,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('[TimbresService] Error adding timbres:', upsertError);
      return false;
    }

    // Registrar transacción
    await supabase.from('transacciones_creditos').insert({
      user_id: userId,
      tipo: 'compra',
      cantidad: cantidad,
      balance_anterior: currentBalance,
      balance_nuevo: newBalance,
      stripe_payment_intent_id: purchaseId,
      notas: `Compra de ${cantidad} timbres`
    });

    return true;
  }

  /**
   * Resetear timbres mensuales del plan (llamado por cron al inicio del mes)
   */
  static async resetMonthlyTimbres(userId: string, planTimbres: number): Promise<boolean> {
    const { error } = await supabase
      .from('creditos_usuarios')
      .update({ 
        timbres_mes_actual: planTimbres,
        fecha_renovacion: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('[TimbresService] Error resetting monthly timbres:', error);
      return false;
    }

    return true;
  }

  /**
   * Obtener historial de consumo
   */
  static async getUsageHistory(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('transacciones_creditos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[TimbresService] Error fetching usage history:', error);
      return [];
    }

    return data || [];
  }
}
