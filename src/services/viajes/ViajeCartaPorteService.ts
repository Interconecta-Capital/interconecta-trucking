
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { ViajeToCartaPorteMapper } from './ViajeToCartaPorteMapper';
import { FigurasAutoPopulationService } from '@/services/figuras/FigurasAutoPopulationService';
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

      // 4. Actualizar tracking_data (carta_porte_id permanece NULL hasta timbrar)
      const { data: viajeData } = await supabase
        .from('viajes')
        .select('tracking_data')
        .eq('id', viajeId)
        .single();

      const trackingData = viajeData?.tracking_data as any || {};
      const { error: updateError } = await supabase
        .from('viajes')
        .update({ 
          tracking_data: {
            ...trackingData,
            carta_porte_creada_id: cartaPorte.id,
            carta_porte_creada_en: new Date().toISOString()
          }
        })
        .eq('id', viajeId);

      if (updateError) {
        console.error('Error actualizando viaje:', updateError);
        throw updateError;
      }

      toast.success('✅ Carta Porte creada', {
        description: 'El documento ha sido generado correctamente',
        duration: 4000
      });

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

      // 1. VERIFICAR SI YA EXISTE UN BORRADOR
      const { data: viajeExistente, error: viajeError } = await supabase
        .from('viajes')
        .select('tracking_data')
        .eq('id', viajeId)
        .single();

      if (viajeError) throw viajeError;

      const trackingData = viajeExistente.tracking_data as any;
      const borradorExistenteId = trackingData?.borrador_carta_porte_id;
      
      if (borradorExistenteId) {
        console.log('⚠️ Ya existe un borrador:', borradorExistenteId);
        
        // Verificar que el borrador aún existe
        const { data: borradorExistente } = await supabase
          .from('borradores_carta_porte')
          .select('id')
          .eq('id', borradorExistenteId)
          .single();
        
        if (borradorExistente) {
          console.log('✅ Reutilizando borrador existente');
          toast.info('Ya existe un borrador para este viaje', {
            description: 'Abriendo el borrador existente...',
            duration: 3000
          });
          return { viaje_id: viajeId, borrador_id: borradorExistenteId };
        } else {
          console.log('⚠️ Borrador anterior eliminado, creando nuevo');
        }
      }

      // 2. Validar datos completos (PERMISIVO PARA BORRADOR)
      console.log('🔍 Validando datos mínimos para crear borrador...');
      const validacion = ViajeToCartaPorteMapper.validarDatosCompletos(wizardData);
      
      if (!validacion.valido) {
        const errorMsg = `Faltan datos críticos para crear borrador:\n• ${validacion.errores.join('\n• ')}`;
        console.error('❌', errorMsg);
        
        toast.error('Faltan datos críticos', {
          description: validacion.errores[0],
          duration: 5000
        });
        throw new Error(errorMsg);
      }
      
      console.log('✅ Validación de datos críticos exitosa');
      console.log('📋 Resumen de datos:', {
        cliente: wizardData.cliente?.nombre_razon_social,
        origen: wizardData.origen?.direccion || wizardData.origen?.nombre,
        destino: wizardData.destino?.direccion || wizardData.destino?.nombre,
        vehiculo: wizardData.vehiculo?.placa,
        conductor: wizardData.conductor?.nombre
      });

      console.log('✅ Validación exitosa, obteniendo figuras auto-pobladas...');

      // 3. AUTO-POBLAR FIGURAS (FASE 2 - CRÍTICO)
      const figurasAutopopuladas = await FigurasAutoPopulationService.obtenerFigurasDeViaje(
        wizardData.conductor?.id,
        wizardData.cliente?.id
      );

      console.log(`✅ ${figurasAutopopuladas.length} figuras auto-pobladas:`, 
        figurasAutopopuladas.map(f => `${f.tipo_figura} - ${f.nombre_figura}`).join(', ')
      );

      // 4. Mapear datos con validación (ahora es async) e incluir figuras
      const wizardDataConFiguras = {
        ...wizardData,
        figuras: figurasAutopopuladas
      };
      
      const cartaPorteData = await ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(wizardDataConFiguras);

      console.log('✅ Datos mapeados correctamente:', {
        emisor: cartaPorteData.rfcEmisor,
        receptor: cartaPorteData.rfcReceptor,
        ubicaciones: cartaPorteData.ubicaciones?.length,
        mercancias: cartaPorteData.mercancias?.length,
        figuras: cartaPorteData.figuras?.length
      });

      // 5. Crear borrador
      const borrador = await CartaPorteLifecycleManager.crearBorrador({
        nombre_borrador: `Viaje - ${wizardData.cliente?.nombre_razon_social || 'Sin cliente'}`,
        datos_formulario: cartaPorteData,
        version_formulario: '3.1'
      });

      console.log('📄 Borrador creado con figuras auto-pobladas:', borrador.id);

      // 6. Vincular en tracking_data con metadatos enriquecidos
      const existingTrackingData = viajeExistente.tracking_data as any || {};
      const trackingDataActualizado = {
        ...existingTrackingData,
        borrador_carta_porte_id: borrador.id,
        borrador_creado_en: new Date().toISOString(),
        datos_cliente: {
          rfc: wizardData.cliente?.rfc,
          nombre: wizardData.cliente?.nombre_razon_social,
          regimen_fiscal: wizardData.cliente?.regimen_fiscal
        },
        datos_emisor: {
          rfc: cartaPorteData.rfcEmisor,
          nombre: cartaPorteData.nombreEmisor
        }
      };

      const { error } = await supabase
        .from('viajes')
        .update({ tracking_data: trackingDataActualizado })
        .eq('id', viajeId);

      if (error) {
        console.error('Error actualizando tracking_data del viaje:', error);
        throw error;
      }

      console.log('✅ Borrador vinculado en tracking_data (carta_porte_id permanece NULL hasta timbrar)');

      // 7. Crear notificación
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
