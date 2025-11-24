import { supabase } from '@/integrations/supabase/client';

/**
 * Adaptador para llamadas a Supabase Edge Functions
 * Proporciona una capa de abstracción entre el frontend y las funciones
 */
export class SupabaseFunctionsAdapter {
  /**
   * Timbrar Carta Porte usando edge function V2 (RECOMENDADO)
   * Versión limpia y simplificada basada en documentación oficial de SW
   */
  static async timbrarCartaPorteV2(cartaPorteData: any, cartaPorteId: string, ambiente: 'sandbox' | 'production'): Promise<any> {
    try {
      console.log('📡 Llamando a edge function: timbrar-cfdi-v2 (V2 Simplificada)');
      
      const { data, error } = await supabase.functions.invoke('timbrar-cfdi-v2', {
        body: {
          cartaPorteData,
          cartaPorteId,
          ambiente
        }
      });

      if (error) {
        console.error('❌ Error en edge function V2:', error);
        throw new Error(error.message || 'Error llamando a función de timbrado V2');
      }

      console.log('✅ Respuesta de V2 recibida:', data);
      return data;
    } catch (error) {
      console.error('💥 Error en timbrado con V2:', error);
      throw error;
    }
  }

  /**
   * Timbrar Carta Porte usando edge function (LEGACY - mantener como backup)
   */
  static async timbrarCartaPorte(cartaPorteData: any, cartaPorteId: string, ambiente: 'sandbox' | 'production'): Promise<any> {
    try {
      console.log('📡 Llamando a edge function: timbrar-con-sw (Legacy)');
      
      const { data, error } = await supabase.functions.invoke('timbrar-con-sw', {
        body: {
          cartaPorteData,
          cartaPorteId,
          ambiente
        }
      });

      if (error) {
        console.error('❌ Error en edge function Legacy:', error);
        throw new Error(error.message || 'Error llamando a función de timbrado Legacy');
      }

      console.log('✅ Respuesta Legacy recibida:', data);
      return data;
    } catch (error) {
      console.error('💥 Error en timbrado Legacy:', error);
      throw error;
    }
  }

  /**
   * Validar conexión con PAC
   */
  static async validarConexionPAC(ambiente: 'sandbox' | 'production'): Promise<any> {
    try {
      console.log('📡 Llamando a edge function: validar-pac');
      
      const { data, error } = await supabase.functions.invoke('validar-pac', {
        body: { ambiente }
      });

      if (error) {
        console.error('❌ Error en edge function:', error);
        throw new Error(error.message || 'Error validando conexión PAC');
      }

      return data;
    } catch (error) {
      console.error('💥 Error validando PAC:', error);
      throw error;
    }
  }

  /**
   * Consultar saldo PAC (futuro)
   */
  static async consultarSaldoPAC(): Promise<any> {
    try {
      console.log('📡 Consultando saldo PAC...');
      
      // Por ahora retornar info básica
      // En el futuro se puede implementar edge function específica
      return {
        success: true,
        saldo: 999,
        moneda: 'MXN',
        message: 'Consulta de saldo disponible'
      };
    } catch (error) {
      console.error('💥 Error consultando saldo:', error);
      throw error;
    }
  }
}
