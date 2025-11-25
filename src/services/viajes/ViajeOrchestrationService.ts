/**
 * ============================================
 * VIAJE ORCHESTRATION SERVICE
 * ============================================
 * Servicio maestro que coordina la creación completa de:
 * - Viaje (entidad principal)
 * - Factura (si es flete_pagado)
 * - Borrador Carta Porte (siempre)
 * - Trazabilidad completa entre entidades
 * 
 * @version 2.0.0 - Migrado a logger sanitizado
 */

import { supabase } from '@/integrations/supabase/client';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { ViajeToCartaPorteMapper } from './ViajeToCartaPorteMapper';
import { ViajeCartaPorteService } from './ViajeCartaPorteService';
import { DisponibilidadService } from './DisponibilidadService';
import logger from '@/utils/logger';
import type { Json } from '@/integrations/supabase/types';

/**
 * Interface para castear datos_formulario de borradores
 */
interface CartaPorteFormData {
  rfcEmisor?: string;
  rfcReceptor?: string;
  ubicaciones?: any[];
  mercancias?: any[];
  autotransporte?: any;
  figuras?: any[];
}

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
    
    logger.info('viajes', 'Iniciando creación de viaje completo', {
      tipoServicio: wizardData.tipoServicio
    });
    
    const esFletePageado = wizardData.tipoServicio === 'flete_pagado';
    
    try {
      // ========== PASO 0: VALIDAR DISPONIBILIDAD (ISO 27001 A.18.1.3) ==========
      await this.validarDisponibilidadRecursos(wizardData);
      
      // ========== PASO 1: CREAR VIAJE (MAESTRO) ==========
      const viaje = await this.crearViajeMaestro(wizardData);
      logger.info('viajes', 'Viaje creado', { viajeId: viaje.id });
      
      // Registrar auditoría
      await this.registrarAuditoria('viaje_created', {
        viaje_id: viaje.id,
        tipo_servicio: wizardData.tipoServicio,
        recursos: {
          conductor_id: wizardData.conductor?.id,
          vehiculo_id: wizardData.vehiculo?.id,
          remolque_id: wizardData.remolque?.id,
          socio_id: wizardData.socio?.id
        }
      });
      
      // ========== PASO 1.5: GUARDAR MERCANCÍAS EN TABLA (UNIFICADO) ==========
      if (wizardData.mercancias && wizardData.mercancias.length > 0) {
        await this.guardarMercanciasDirectas(viaje.id, wizardData.mercancias);
        logger.debug('viajes', `${wizardData.mercancias.length} mercancías guardadas`);
      }
      
      // ========== PASO 2: CREAR FACTURA (si es flete pagado) ==========
      let facturaId: string | undefined;
      if (esFletePageado && wizardData.facturaData) {
        facturaId = await this.crearPreFactura(viaje.id, wizardData);
        logger.info('facturacion', 'Pre-factura creada', { facturaId });
        
        // Actualizar viaje con factura_id
        await supabase
          .from('viajes')
          .update({ factura_id: facturaId })
          .eq('id', viaje.id);
      }
      
      // ========== PASO 3: CREAR BORRADOR CARTA PORTE ==========
      const borradorCP = await this.crearBorradorCartaPorte(viaje.id, wizardData, facturaId);
      logger.info('viajes', 'Borrador CP creado', { borradorId: borradorCP.id });

      // Verificar datos del borrador - castear datos_formulario
      const datosForm = borradorCP.datos_formulario as CartaPorteFormData | null;
      logger.debug('viajes', 'Verificación borrador', {
        borrador_id: borradorCP.id,
        viaje_id: viaje.id,
        tieneRfcEmisor: !!datosForm?.rfcEmisor,
        tieneRfcReceptor: !!datosForm?.rfcReceptor,
        numUbicaciones: datosForm?.ubicaciones?.length || 0,
        numMercancias: datosForm?.mercancias?.length || 0,
        tieneAutotransporte: !!datosForm?.autotransporte,
        numFiguras: datosForm?.figuras?.length || 0
      });

      // Verificar y alertar sobre datos faltantes críticos
      if (!datosForm?.mercancias || datosForm.mercancias.length === 0) {
        logger.warn('viajes', 'Borrador creado sin mercancías');
      }

      if (!datosForm?.rfcEmisor) {
        logger.warn('viajes', 'RFC del emisor faltante - Configura tu empresa');
      }

      if (!datosForm?.rfcReceptor) {
        logger.warn('viajes', 'RFC del receptor faltante');
      }
      
      // ========== PASO 4: VINCULAR TODO EN TRACKING_DATA ==========
      await this.actualizarTrackingData(viaje.id, {
        viaje_id: viaje.id,
        factura_id: facturaId,
        borrador_carta_porte_id: borradorCP.id,
        tipo_servicio: wizardData.tipoServicio,
        flujo_completo_creado: true,
        fecha_creacion: new Date().toISOString()
      });
      
      logger.info('viajes', 'Viaje completo creado exitosamente', {
        viajeId: viaje.id,
        facturaId,
        borradorId: borradorCP.id
      });
      
      return {
        viaje_id: viaje.id,
        factura_id: facturaId,
        borrador_carta_porte_id: borradorCP.id
      };
      
    } catch (error: any) {
      logger.error('viajes', 'Error en creación de viaje completo', error);
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
    
    // Construir direcciones completas
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
    
    // Tracking data completo
    const trackingDataCompleto = {
      created_from: 'ViajeWizard',
      timestamp: new Date().toISOString(),
      cliente: wizardData.cliente ? {
        id: wizardData.cliente.id,
        nombre_razon_social: wizardData.cliente.nombre_razon_social,
        regimen_fiscal: wizardData.cliente.regimen_fiscal,
        uso_cfdi: wizardData.cliente.uso_cfdi
      } : null,
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
      ruta: wizardData.rutaCalculada ? {
        distanciaTotal: wizardData.rutaCalculada.distanciaTotal,
        tiempoEstimado: wizardData.rutaCalculada.tiempoEstimado,
        rutaPolyline: wizardData.rutaCalculada.rutaPolyline,
        pasos: wizardData.rutaCalculada.pasos
      } : null,
      descripcionMercancia: wizardData.descripcionMercancia,
      claveBienesTransp: wizardData.claveBienesTransp,
      tipo_servicio: wizardData.tipoServicio
    };
    
    const { data: viaje, error } = await supabase
      .from('viajes')
      .insert({
        user_id: user.user.id,
        origen: direccionOrigenCompleta,
        destino: direccionDestinoCompleta,
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
        tracking_data: trackingDataCompleto
      })
      .select()
      .single();
    
    if (error) {
      logger.error('viajes', 'Error creando viaje maestro', error);
      throw new Error(`Error creando viaje: ${error.message}`);
    }
    
    logger.debug('viajes', 'Viaje maestro creado con datos completos');
    return viaje;
  }
  
  /**
   * Crear pre-factura con validaciones estrictas
   */
  private static async crearPreFactura(viajeId: string, wizardData: ViajeWizardData): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    // Validar régimen fiscal del cliente
    if (!wizardData.cliente?.regimen_fiscal) {
      logger.error('facturacion', 'Cliente sin régimen fiscal', {
        cliente_id: wizardData.cliente?.id,
        nombre: wizardData.cliente?.nombre_razon_social
      });
      throw new Error(
        `El cliente "${wizardData.cliente?.nombre_razon_social || 'seleccionado'}" no tiene régimen fiscal configurado. ` +
        'Por favor, actualiza los datos del cliente antes de continuar.'
      );
    }
    
    logger.debug('facturacion', 'Régimen fiscal validado', {
      cliente: wizardData.cliente.nombre_razon_social
    });
    
    // Obtener configuración de empresa
    const { data: config, error: configError } = await supabase
      .from('configuracion_empresa')
      .select('rfc_emisor, razon_social, regimen_fiscal, serie_factura, folio_actual_factura, folio_inicial_factura')
      .eq('user_id', user.user.id)
      .single();
    
    if (configError || !config || !config.rfc_emisor) {
      throw new Error('Configura tu empresa en Configuración antes de crear facturas');
    }
    
    // Calcular folio
    const folioAUsar = config.folio_actual_factura || config.folio_inicial_factura || 1;
    const serieAUsar = config.serie_factura || 'ZS';
    
    logger.debug('facturacion', 'Usando configuración', {
      serie: serieAUsar,
      folio: folioAUsar
    });
    
    const facturaData = wizardData.facturaData!;
    
    const { data: factura, error } = await supabase
      .from('facturas')
      .insert({
        user_id: user.user.id,
        viaje_id: viajeId,
        tipo_comprobante: 'I',
        serie: serieAUsar,
        folio: folioAUsar.toString().padStart(3, '0'),
        fecha_expedicion: new Date().toISOString(),
        rfc_emisor: config.rfc_emisor,
        nombre_emisor: config.razon_social,
        regimen_fiscal_emisor: config.regimen_fiscal,
        rfc_receptor: wizardData.cliente?.rfc || 'XAXX010101000',
        nombre_receptor: wizardData.cliente?.nombre_razon_social || 'Público General',
        regimen_fiscal_receptor: wizardData.cliente.regimen_fiscal,
        uso_cfdi: ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01', 'CN01'].includes(facturaData.usoCfdi) 
          ? facturaData.usoCfdi 
          : 'G03',
        domicilio_fiscal_receptor: wizardData.cliente?.domicilio_fiscal?.codigo_postal || null,
        subtotal: facturaData.subtotal || 0,
        total: facturaData.total || 0,
        total_impuestos_trasladados: facturaData.iva || 0,
        moneda: 'MXN',
        status: 'draft',
        tiene_carta_porte: true,
        notas: facturaData.observaciones,
        metadata: {
          created_from: 'ViajeWizard',
          viaje_id: viajeId,
          tipo_servicio: wizardData.tipoServicio,
          regimen_fiscal_validado: true,
          fecha_validacion: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (error) {
      logger.error('facturacion', 'Error creando factura', error);
      throw new Error(`Error creando factura: ${error.message}`);
    }
    
    // Incrementar folio
    await supabase
      .from('configuracion_empresa')
      .update({ folio_actual_factura: folioAUsar + 1 })
      .eq('user_id', user.user.id);
    
    logger.debug('facturacion', 'Folio incrementado', { nuevoFolio: folioAUsar + 1 });
    
    return factura.id;
  }
  
  /**
   * Crear borrador de Carta Porte
   */
  private static async crearBorradorCartaPorte(
    viajeId: string, 
    wizardData: ViajeWizardData,
    facturaId?: string
  ) {
    logger.debug('viajes', 'Iniciando creación de borrador Carta Porte', {
      viajeId,
      tieneFactura: !!facturaId,
      numMercancias: wizardData.mercancias?.length || 0
    });
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    // Obtener datos del emisor desde configuración
    const { data: configEmpresa } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    // Mapear wizard data a formato Carta Porte usando mapper (método correcto)
    const cartaPorteData = await ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(wizardData);
    
    // Crear borrador - castear datos_formulario a Json
    const insertData = {
      user_id: user.user.id,
      viaje_id: viajeId,
      nombre_borrador: `CP-${wizardData.cliente?.nombre_razon_social || 'Viaje'}-${new Date().toISOString().slice(0,10)}`,
      datos_formulario: cartaPorteData as Json,
      version_formulario: '3.1',
      auto_saved: false
    };
    
    const { data: borrador, error } = await supabase
      .from('borradores_carta_porte')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      logger.error('viajes', 'Error creando borrador CP', error);
      throw new Error(`Error creando borrador: ${error.message}`);
    }
    
    return borrador;
  }

  /**
   * Guardar mercancías directamente en tabla
   */
  private static async guardarMercanciasDirectas(viajeId: string, mercancias: any[]): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');

    const mercanciasData = mercancias.map(m => ({
      viaje_id: viajeId,
      user_id: user.user!.id,
      bienes_transp: m.bienes_transp || m.claveSAT || '78101800',
      descripcion: m.descripcion || 'Mercancía general',
      cantidad: m.cantidad || 1,
      clave_unidad: m.clave_unidad || m.unidad || 'KGM',
      peso_kg: m.peso_kg || m.peso || 0,
      valor_mercancia: m.valor_mercancia || m.valor || 0,
      moneda: m.moneda || 'MXN',
      material_peligroso: m.material_peligroso || false
    }));

    const { error } = await supabase
      .from('mercancias')
      .insert(mercanciasData);

    if (error) {
      logger.error('mercancias', 'Error guardando mercancías', error);
      throw new Error(`Error guardando mercancías: ${error.message}`);
    }
  }

  /**
   * Actualizar tracking data del viaje
   */
  private static async actualizarTrackingData(viajeId: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('viajes')
      .update({ tracking_data: data })
      .eq('id', viajeId);

    if (error) {
      logger.error('viajes', 'Error actualizando tracking data', error);
    }
  }

  /**
   * Registrar auditoría
   */
  private static async registrarAuditoria(eventType: string, data: any): Promise<void> {
    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Validar disponibilidad de recursos
   */
  private static async validarDisponibilidadRecursos(wizardData: ViajeWizardData): Promise<void> {
    if (wizardData.conductor) {
      const resultado = await DisponibilidadService.validarDisponibilidadConductor(
        wizardData.conductor.id,
        wizardData.origen?.fechaHoraSalidaLlegada || new Date().toISOString(),
        wizardData.destino?.fechaHoraSalidaLlegada || new Date(Date.now() + 86400000).toISOString()
      );
      
      if (!resultado.disponible) {
        logger.warn('viajes', 'Conductor no disponible', {
          conductorId: wizardData.conductor.id,
          conflictos: resultado.conflictos,
          advertencias: resultado.advertencias
        });
      }
    }
  }

  /**
   * Crear borrador de Carta Porte desde un viaje existente
   * Método público que delega a ViajeCartaPorteService
   */
  static async crearBorradorDesdeViaje(
    viajeId: string
  ): Promise<{ success: boolean; borradorId?: string; error?: string }> {
    try {
      logger.info('viajes', 'Creando borrador desde viaje existente', { viajeId });
      
      // 1. Obtener datos del viaje desde BD usando el mapper
      const cartaPorteData = await ViajeToCartaPorteMapper.mapFromViajeDB(viajeId);
      
      // 2. Construir wizardData desde los datos mapeados
      const wizardData = await this.construirWizardDataDesdeViaje(viajeId, cartaPorteData);
      
      // 3. Delegar a ViajeCartaPorteService
      const result = await ViajeCartaPorteService.crearBorradorDesdeViaje(viajeId, wizardData);
      
      logger.info('viajes', 'Borrador creado exitosamente', { 
        viajeId, 
        borradorId: result.borrador_id 
      });
      
      return {
        success: true,
        borradorId: result.borrador_id
      };
    } catch (error: any) {
      logger.error('viajes', 'Error creando borrador desde viaje', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Construir ViajeWizardData desde datos de BD
   */
  private static async construirWizardDataDesdeViaje(
    viajeId: string,
    cartaPorteData: any
  ): Promise<ViajeWizardData> {
    // Obtener viaje con relaciones
    const { data: viaje, error } = await supabase
      .from('viajes')
      .select(`
        *,
        conductores!conductor_id(*),
        vehiculos!vehiculo_id(*),
        remolques!remolque_id(*),
        clientes_proveedores!viajes_cliente_id_fkey(*)
      `)
      .eq('id', viajeId)
      .single();

    if (error || !viaje) {
      throw new Error(`No se pudo obtener el viaje: ${error?.message}`);
    }

    const trackingData = (viaje.tracking_data as any) || {};
    
    // Normalizar ubicaciones
    let origen = trackingData.ubicaciones?.origen || trackingData.origen;
    let destino = trackingData.ubicaciones?.destino || trackingData.destino;
    
    if (!origen) {
      origen = { nombre: viaje.origen, direccion: viaje.origen, domicilio: {} };
    }
    if (!destino) {
      destino = { nombre: viaje.destino, direccion: viaje.destino, domicilio: {} };
    }

    return {
      tipoServicio: trackingData.tipo_servicio || 'flete_pagado',
      cliente: viaje.clientes_proveedores || trackingData.cliente,
      conductor: viaje.conductores || trackingData.conductor,
      vehiculo: viaje.vehiculos || trackingData.vehiculo,
      remolque: viaje.remolques || trackingData.remolque,
      origen,
      destino,
      descripcionMercancia: trackingData.descripcionMercancia || 'Mercancía general',
      distanciaRecorrida: viaje.distancia_km || trackingData.distanciaTotal || 100,
      figuras: trackingData.figuras || [],
      currentStep: 6,
      isValid: true
    };
  }
}
