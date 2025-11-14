import { supabase } from '@/integrations/supabase/client';

/**
 * Adaptador para llamadas a Supabase Edge Functions
 * Proporciona una capa de abstracción entre el frontend y las funciones
 */
export class SupabaseFunctionsAdapter {
  /**
   * Timbrar Carta Porte usando edge function
   */
  static async timbrarCartaPorte(cartaPorteData: any, cartaPorteId: string, ambiente: 'sandbox' | 'production'): Promise<any> {
    try {
      console.log('📡 Llamando a edge function: timbrar-con-sw (Conectia)');
      
      const { data, error } = await supabase.functions.invoke('timbrar-con-sw', {
        body: {
          cartaPorteData,
          cartaPorteId,
          ambiente
        }
      });

      if (error) {
        console.error('❌ Error en edge function Conectia:', error);
        throw new Error(error.message || 'Error llamando a función de timbrado Conectia');
      }

      console.log('✅ Respuesta de Conectia recibida:', data);
      return data;
    } catch (error) {
      console.error('💥 Error en timbrado con Conectia:', error);
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
