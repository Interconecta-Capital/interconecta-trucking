
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { ViajeToCartaPorteMapper } from './ViajeToCartaPorteMapper';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
          estado: 'completado'
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

  static async crearBorradorDesdeViaje(
    viajeId: string,
    wizardData: ViajeWizardData
  ) {
    try {
      console.log('🚛 Iniciando creación de borrador de Carta Porte:', viajeId);

      const cartaPorteData = ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(
        wizardData
      );

      const borrador = await CartaPorteLifecycleManager.crearBorrador({
        nombre_borrador: `Viaje - ${
          wizardData.cliente?.nombre_razon_social || 'Sin cliente'
        }`,
        datos_formulario: cartaPorteData,
        version_formulario: '3.1'
      });

      console.log('📄 Borrador creado:', borrador.id);

      const { error } = await supabase
        .from('viajes')
        .update({ carta_porte_id: borrador.id })
        .eq('id', viajeId);

      if (error) {
        console.error('Error actualizando viaje con borrador:', error);
        throw error;
      }

      // Crear notificación de éxito
      await this.crearNotificacionBorradorCreado(borrador.id, wizardData);

      return { viaje_id: viajeId, borrador_id: borrador.id };
    } catch (error) {
      console.error('❌ Error creando borrador desde viaje:', error);
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

  /**
   * Crear notificación cuando se crea un borrador
   */
  static async crearNotificacionBorradorCreado(
    borradorId: string,
    wizardData: ViajeWizardData
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const clienteNombre = wizardData.cliente?.nombre_razon_social || 'Cliente sin especificar';
      const origen = wizardData.origen?.nombre || 'Origen sin especificar';
      const destino = wizardData.destino?.nombre || 'Destino sin especificar';

      await supabase
        .from('notificaciones')
        .insert({
          user_id: user.id,
          tipo: 'success',
          titulo: '✅ Borrador de Carta Porte Creado',
          mensaje: `Se ha creado el borrador de carta porte para el viaje ${origen} → ${destino} (Cliente: ${clienteNombre}). Abre tus cartas porte para completar los datos fiscales y timbrar el documento.`,
          urgente: false,
          metadata: {
            borrador_id: borradorId,
            viaje_data: {
              cliente: clienteNombre,
              origen,
              destino,
              tipo_servicio: wizardData.tipoServicio
            },
            action_url: `/carta-porte/editor/${borradorId}`
          }
        });

      // También mostrar toast inmediato
      toast.success('Borrador de Carta Porte creado', {
        description: `Viaje ${origen} → ${destino} programado correctamente`,
        duration: 5000,
        action: {
          label: 'Abrir Carta Porte',
          onClick: () => {
            window.location.href = `/carta-porte/editor/${borradorId}`;
          }
        }
      });

    } catch (error) {
      console.error('Error creando notificación:', error);
      // No fallar si no se puede crear la notificación
    }
  }
}
