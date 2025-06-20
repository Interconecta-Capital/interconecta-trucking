
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { ViajeToCartaPorteMapper } from './ViajeToCartaPorteMapper';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { supabase } from '@/integrations/supabase/client';

export class ViajeCartaPorteService {
  static async crearCartaPorteDesdeViaje(
    viajeId: string, 
    wizardData: ViajeWizardData
  ) {
    try {
      console.log('🚛 Iniciando creación de Carta Porte desde viaje:', viajeId);

      // 1. Mapear datos del wizard a formato Carta Porte
      const cartaPorteData = ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(wizardData);
      
      // 2. Crear borrador primero
      const borrador = await CartaPorteLifecycleManager.crearBorrador({
        nombre_borrador: `Viaje - ${wizardData.cliente?.nombre_razon_social || 'Sin cliente'}`,
        datos_formulario: cartaPorteData,
        version_formulario: '3.1'
      });

      console.log('📄 Borrador creado:', borrador.id);

      // 3. Convertir borrador a Carta Porte
      const cartaPorte = await CartaPorteLifecycleManager.convertirBorradorACartaPorte({
        borradorId: borrador.id,
        nombre_documento: `CP-${new Date().toISOString().split('T')[0]}-${wizardData.cliente?.nombre_razon_social || 'Cliente'}`,
        validarDatos: true
      });

      console.log('📋 Carta Porte creada:', cartaPorte.id);

      // 4. Actualizar viaje con el ID de la carta porte
      const { error: updateError } = await supabase
        .from('viajes')
        .update({ 
          carta_porte_id: cartaPorte.id,
          status: 'completado'
        })
        .eq('id', viajeId);

      if (updateError) {
        console.error('Error actualizando viaje:', updateError);
        throw updateError;
      }

      console.log('✅ Carta Porte creada exitosamente desde viaje');
      
      return {
        viaje_id: viajeId,
        carta_porte: cartaPorte,
        borrador_id: borrador.id
      };

    } catch (error) {
      console.error('❌ Error creando Carta Porte desde viaje:', error);
      throw error;
    }
  }

  static async obtenerCartaPorteDelViaje(viajeId: string) {
    try {
      const { data: viaje, error } = await supabase
        .from('viajes')
        .select(`
          *,
          carta_porte:cartas_porte(*)
        `)
        .eq('id', viajeId)
        .single();

      if (error) throw error;
      return viaje;
    } catch (error) {
      console.error('Error obteniendo carta porte del viaje:', error);
      throw error;
    }
  }
}
