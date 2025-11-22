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
      
      // ========== PASO 4: VINCULAR TODO EN TRACKING_DATA (OPTIMIZADO - sin wizard_data) ==========
      await this.actualizarTrackingData(viaje.id, {
        viaje_id: viaje.id,
        factura_id: facturaId,
        borrador_carta_porte_id: borradorCP.id,
        tipo_servicio: wizardData.tipoServicio,
        flujo_completo_creado: true,
        fecha_creacion: new Date().toISOString()
        // ⚡ OPTIMIZACIÓN: Eliminado wizard_data para reducir tamaño de BD
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
    const origen = wizardData.origen;
    const destino = wizardData.destino;
    
    if (!origen || !destino) {
      throw new Error('Se requiere origen y destino para crear el viaje');
    }
    
    // ✅ NUEVO: Construir direcciones completas
    const construirDireccionCompleta = (ubicacion: any) => {
      const dom = ubicacion.domicilio || {};
      const partes = [
        dom.calle,
        dom.numeroExterior ? `#${dom.numeroExterior}` : null,
        dom.numeroInterior ? `Int. ${dom.numeroInterior}` : null,
        dom.colonia ? `Col. ${dom.colonia}` : null,
        dom.codigoPostal ? `CP ${dom.codigoPostal}` : null,
        dom.municipio,
        dom.estado,
        dom.pais !== 'MEX' ? dom.pais : null
      ].filter(Boolean);
      
      return partes.join(', ');
    };
    
    const direccionOrigenCompleta = construirDireccionCompleta(origen);
    const direccionDestinoCompleta = construirDireccionCompleta(destino);
    
    // Calcular fechas
    const fechaInicio = origen.fechaHoraSalidaLlegada 
      ? new Date(origen.fechaHoraSalidaLlegada)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const fechaFin = destino.fechaHoraSalidaLlegada
      ? new Date(destino.fechaHoraSalidaLlegada)
      : new Date(Date.now() + 48 * 60 * 60 * 1000);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    // ✅ NUEVO: Guardar estructura completa en tracking_data
    const trackingDataCompleto = {
      created_from: 'ViajeWizard',
      timestamp: new Date().toISOString(),
      
      // Cliente completo
      cliente: wizardData.cliente ? {
        id: wizardData.cliente.id,
        nombre_razon_social: wizardData.cliente.nombre_razon_social,
        rfc: wizardData.cliente.rfc,
        regimen_fiscal: wizardData.cliente.regimen_fiscal,
        uso_cfdi: wizardData.cliente.uso_cfdi
      } : null,
      
      // Ubicaciones completas
      ubicaciones: {
        origen: {
          tipo: origen.tipoUbicacion || 'Origen',
          domicilio: origen.domicilio,
          coordenadas: origen.coordenadas,
          fechaHoraSalidaLlegada: origen.fechaHoraSalidaLlegada,
          distanciaRecorrida: origen.distanciaRecorrida
        },
        destino: {
          tipo: destino.tipoUbicacion || 'Destino',
          domicilio: destino.domicilio,
          coordenadas: destino.coordenadas,
          fechaHoraSalidaLlegada: destino.fechaHoraSalidaLlegada,
          distanciaRecorrida: destino.distanciaRecorrida
        }
      },
      
      // Ruta calculada
      ruta: wizardData.rutaCalculada ? {
        distanciaTotal: wizardData.rutaCalculada.distanciaTotal,
        tiempoEstimado: wizardData.rutaCalculada.tiempoEstimado,
        rutaPolyline: wizardData.rutaCalculada.rutaPolyline,
        pasos: wizardData.rutaCalculada.pasos
      } : null,
      
      // Mercancía
      descripcionMercancia: wizardData.descripcionMercancia,
      claveBienesTransp: wizardData.claveBienesTransp,
      mercancias: wizardData.mercancias || [], // ✅ NUEVO: Guardar mercancías detalladas
      
      // Tipo de servicio
      tipo_servicio: wizardData.tipoServicio
    };
    
    const { data: viaje, error } = await supabase
      .from('viajes')
      .insert({
        user_id: user.user.id,
        origen: direccionOrigenCompleta, // ✅ Dirección completa
        destino: direccionDestinoCompleta, // ✅ Dirección completa
        conductor_id: wizardData.conductor?.id,
        vehiculo_id: wizardData.vehiculo?.id,
        socio_id: wizardData.socio?.id,
        remolque_id: wizardData.remolque?.id,
        estado: 'programado',
        fecha_inicio_programada: fechaInicio.toISOString(),
        fecha_fin_programada: fechaFin.toISOString(),
        distancia_km: wizardData.distanciaTotal || 0,
        tiempo_estimado_horas: wizardData.tiempoEstimado ? wizardData.tiempoEstimado / 60 : 0,
        precio_cobrado: wizardData.facturaData?.total,
        costo_estimado: wizardData.costos?.costo_total_estimado,
        margen_estimado: (wizardData.facturaData?.total || 0) - (wizardData.costos?.costo_total_estimado || 0),
        observaciones: `Viaje creado desde wizard. Cliente: ${wizardData.cliente?.nombre_razon_social || 'N/A'}`,
        tracking_data: trackingDataCompleto // ✅ Datos completos
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando viaje:', error);
      throw new Error(`Error creando viaje: ${error.message}`);
    }
    
    console.log('✅ [ORCHESTRATOR] Viaje maestro creado con datos completos');
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
   * ✅ MEJORADO: Sincroniza mercancías del viaje a la tabla mercancias
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
   * ✅ NUEVO: Sincronizar mercancías del viaje con la carta porte
   * Se llama automáticamente cuando se convierte un borrador en carta porte timbrada
   */
  static async sincronizarMercanciasConCartaPorte(viajeId: string, cartaPorteId: string) {
    try {
      // Obtener el viaje con sus mercancías en tracking_data
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .select('tracking_data')
        .eq('id', viajeId)
        .single();
      
      if (viajeError || !viaje) {
        console.error('Error obteniendo viaje:', viajeError);
        return;
      }
      
      const trackingData = viaje.tracking_data as any;
      const mercanciasViaje = trackingData?.mercancias || [];
      
      if (mercanciasViaje.length === 0) {
        console.log('⚠️ No hay mercancías en el viaje para sincronizar');
        return;
      }
      
      // Mapear mercancías al formato de la tabla mercancias
      const mercanciasMapped = mercanciasViaje.map((m: any) => ({
        carta_porte_id: cartaPorteId,
        bienes_transp: m.bienes_transp || m.claveProdServ || '',
        descripcion: m.descripcion || '',
        cantidad: parseFloat(m.cantidad) || 1,
        clave_unidad: m.clave_unidad || m.claveUnidad || 'KGM',
        unidad: m.unidad || 'Kilogramo',
        peso_kg: parseFloat(m.peso_kg || m.pesoKg) || 0,
        valor_mercancia: parseFloat(m.valor_mercancia || m.valorMercancia) || 0,
        material_peligroso: Boolean(m.material_peligroso),
        moneda: m.moneda || 'MXN',
        embalaje: m.embalaje || null,
        fraccion_arancelaria: m.fraccion_arancelaria || null
      }));
      
      // Insertar mercancías en la tabla mercancias
      const { error: mercError } = await supabase
        .from('mercancias')
        .insert(mercanciasMapped);
      
      if (mercError) {
        console.error('❌ Error insertando mercancías:', mercError);
        throw mercError;
      }
      
      console.log(`✅ ${mercanciasViaje.length} mercancías sincronizadas con carta porte ${cartaPorteId}`);
      
    } catch (error) {
      console.error('Error en sincronización de mercancías:', error);
      throw error;
    }
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
