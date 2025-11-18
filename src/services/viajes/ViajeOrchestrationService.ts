/**
 * ============================================
 * VIAJE ORCHESTRATION SERVICE
 * ============================================
 * Servicio maestro que coordina la creación completa de:
 * - Viaje (entidad principal)
 * - Factura (si es flete_pagado)
 * - Borrador Carta Porte (siempre)
 * - Trazabilidad completa entre entidades
 */

import { supabase } from '@/integrations/supabase/client';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { ViajeToCartaPorteMapper } from './ViajeToCartaPorteMapper';

interface ViajeCompletoResult {
  viaje_id: string;
  factura_id?: string;
  borrador_carta_porte_id: string;
  carta_porte_id?: string;
}

export class ViajeOrchestrationService {
  
  /**
   * FLUJO COMPLETO MVP: Crear viaje + factura + carta porte
   * Este es el punto de entrada principal para la creación de viajes
   */
  static async crearViajeCompleto(wizardData: ViajeWizardData): Promise<ViajeCompletoResult> {
    
    console.log('🎬 [ORCHESTRATOR] Iniciando creación de viaje completo...');
    console.log('📋 [ORCHESTRATOR] Tipo de servicio:', wizardData.tipoServicio);
    
    const esFletePageado = wizardData.tipoServicio === 'flete_pagado';
    
    try {
      // ========== PASO 1: CREAR VIAJE (MAESTRO) ==========
      const viaje = await this.crearViajeMaestro(wizardData);
      console.log('✅ [ORCHESTRATOR] Viaje creado:', viaje.id);
      
      // ========== PASO 2: CREAR FACTURA (si es flete pagado) ==========
      let facturaId: string | undefined;
      if (esFletePageado && wizardData.facturaData) {
        facturaId = await this.crearPreFactura(viaje.id, wizardData);
        console.log('✅ [ORCHESTRATOR] Pre-factura creada:', facturaId);
        
        // Actualizar viaje con factura_id
        await supabase
          .from('viajes')
          .update({ factura_id: facturaId })
          .eq('id', viaje.id);
      }
      
      // ========== PASO 3: CREAR BORRADOR CARTA PORTE ==========
      const borradorCP = await this.crearBorradorCartaPorte(viaje.id, wizardData, facturaId);
      console.log('✅ [ORCHESTRATOR] Borrador CP creado:', borradorCP.id);
      
      // ========== PASO 4: VINCULAR TODO EN TRACKING_DATA ==========
      await this.actualizarTrackingData(viaje.id, {
        viaje_id: viaje.id,
        factura_id: facturaId,
        borrador_carta_porte_id: borradorCP.id,
        tipo_servicio: wizardData.tipoServicio,
        flujo_completo_creado: true,
        fecha_creacion: new Date().toISOString(),
        wizard_data: wizardData
      });
      
      console.log('🎉 [ORCHESTRATOR] Viaje completo creado exitosamente');
      
      return {
        viaje_id: viaje.id,
        factura_id: facturaId,
        borrador_carta_porte_id: borradorCP.id
      };
      
    } catch (error) {
      console.error('❌ [ORCHESTRATOR] Error en creación de viaje completo:', error);
      throw error;
    }
  }
  
  /**
   * Crear viaje maestro con toda la información
   */
  private static async crearViajeMaestro(wizardData: ViajeWizardData) {
    const origen = wizardData.ubicaciones?.find(u => u.tipoUbicacion === 'Origen');
    const destino = wizardData.ubicaciones?.find(u => u.tipoUbicacion === 'Destino');
    
    if (!origen || !destino) {
      throw new Error('Se requiere origen y destino para crear el viaje');
    }
    
    // Calcular fechas
    const fechaInicio = origen.fechaHoraSalidaLlegada 
      ? new Date(origen.fechaHoraSalidaLlegada)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const fechaFin = destino.fechaHoraSalidaLlegada
      ? new Date(destino.fechaHoraSalidaLlegada)
      : new Date(Date.now() + 48 * 60 * 60 * 1000);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    const { data: viaje, error } = await supabase
      .from('viajes')
      .insert({
        user_id: user.user.id,
        origen: `${origen.domicilio?.municipio || 'N/A'}, ${origen.domicilio?.estado || 'N/A'}`,
        destino: `${destino.domicilio?.municipio || 'N/A'}, ${destino.domicilio?.estado || 'N/A'}`,
        conductor_id: wizardData.conductor?.id,
        vehiculo_id: wizardData.vehiculo?.id,
        socio_id: wizardData.socio?.id,
        remolque_id: wizardData.remolque?.id,
        estado: 'borrador', // Inicia como borrador hasta que se timbre
        fecha_inicio_programada: fechaInicio.toISOString(),
        fecha_fin_programada: fechaFin.toISOString(),
        distancia_km: wizardData.distanciaTotal || 0,
        tiempo_estimado_horas: wizardData.tiempoEstimado || 0,
        precio_cobrado: wizardData.facturaData?.total,
        costo_estimado: wizardData.costos?.costo_total_estimado,
        margen_estimado: (wizardData.facturaData?.total || 0) - (wizardData.costos?.costo_total_estimado || 0),
        observaciones: `Viaje creado desde wizard. Cliente: ${wizardData.cliente?.nombre_razon_social || 'N/A'}`,
        tracking_data: {
          created_from: 'ViajeWizard',
          timestamp: new Date().toISOString(),
          cliente: wizardData.cliente?.nombre_razon_social
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando viaje:', error);
      throw new Error(`Error creando viaje: ${error.message}`);
    }
    
    return viaje;
  }
  
  /**
   * Crear pre-factura (borrador) vinculada al viaje
   */
  private static async crearPreFactura(viajeId: string, wizardData: ViajeWizardData): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    // Obtener configuración de empresa para RFC emisor
    const { data: config } = await supabase
      .from('configuracion_empresa')
      .select('rfc_emisor, razon_social, regimen_fiscal')
      .eq('user_id', user.user.id)
      .single();
    
    if (!config || !config.rfc_emisor) {
      throw new Error('⚠️ Configura tu empresa en Configuración antes de crear facturas');
    }
    
    const facturaData = wizardData.facturaData!;
    
    const { data: factura, error } = await supabase
      .from('facturas')
      .insert({
        user_id: user.user.id,
        viaje_id: viajeId, // 🔥 Vincular con viaje
        tipo_comprobante: 'I', // Ingreso
        serie: facturaData.serie || 'A',
        folio: facturaData.folio || '001',
        fecha_expedicion: new Date().toISOString(),
        rfc_emisor: config.rfc_emisor,
        nombre_emisor: config.razon_social,
        regimen_fiscal_emisor: config.regimen_fiscal,
        rfc_receptor: wizardData.cliente?.rfc || 'XAXX010101000',
        nombre_receptor: wizardData.cliente?.nombre_razon_social || 'Público General',
        uso_cfdi: facturaData.usoCfdi || 'G03',
        subtotal: facturaData.subtotal || 0,
        total: facturaData.total || 0,
        total_impuestos_trasladados: facturaData.iva || 0,
        moneda: 'MXN',
        status: 'draft', // Inicia como borrador
        tiene_carta_porte: true, // Siempre tiene CP en transporte
        notas: facturaData.observaciones,
        metadata: {
          created_from: 'ViajeWizard',
          viaje_id: viajeId,
          tipo_servicio: wizardData.tipoServicio
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando factura:', error);
      throw new Error(`Error creando factura: ${error.message}`);
    }
    
    return factura.id;
  }
  
  /**
   * Crear borrador de Carta Porte vinculado a viaje y factura
   */
  private static async crearBorradorCartaPorte(
    viajeId: string, 
    wizardData: ViajeWizardData,
    facturaId?: string
  ) {
    // Convertir datos del wizard a formato CartaPorte válido
    const cartaPorteData = ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(wizardData);
    
    // Agregar referencia a factura si existe
    if (facturaId) {
      (cartaPorteData as any).factura_id = facturaId;
    }
    
    // Agregar referencia al viaje
    (cartaPorteData as any).viaje_id = viajeId;
    
    const borrador = await CartaPorteLifecycleManager.crearBorrador({
      nombre_borrador: `CP-Viaje-${wizardData.cliente?.nombre_razon_social || 'Cliente'}-${new Date().toLocaleDateString()}`,
      datos_formulario: cartaPorteData,
      version_formulario: '3.1'
    });
    
    return borrador;
  }
  
  /**
   * Actualizar tracking_data del viaje con toda la información de relaciones
   */
  private static async actualizarTrackingData(viajeId: string, trackingInfo: any) {
    const { data: viaje } = await supabase
      .from('viajes')
      .select('tracking_data')
      .eq('id', viajeId)
      .single();
    
    const trackingData = (viaje?.tracking_data || {}) as any;
    
    await supabase
      .from('viajes')
      .update({
        tracking_data: {
          ...trackingData,
          ...trackingInfo,
          ultima_actualizacion: new Date().toISOString()
        }
      })
      .eq('id', viajeId);
  }
  
  /**
   * Obtener viaje completo con todas sus relaciones
   */
  static async obtenerViajeCompleto(viajeId: string) {
    const { data, error } = await supabase.rpc('get_viaje_completo', {
      p_viaje_id: viajeId
    });
    
    if (error) {
      console.error('Error obteniendo viaje completo:', error);
      throw error;
    }
    
    return data?.[0] || null;
  }
}
