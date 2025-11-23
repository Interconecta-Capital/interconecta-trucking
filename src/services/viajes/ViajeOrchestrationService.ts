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
import { DisponibilidadService } from './DisponibilidadService';

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
      // ========== PASO 0: VALIDAR DISPONIBILIDAD (ISO 27001 A.18.1.3) ==========
      await this.validarDisponibilidadRecursos(wizardData);
      
      // ========== PASO 1: CREAR VIAJE (MAESTRO) ==========
      const viaje = await this.crearViajeMaestro(wizardData);
      console.log('✅ [ORCHESTRATOR] Viaje creado:', viaje.id);
      
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
        console.log(`✅ [ORCHESTRATOR] ${wizardData.mercancias.length} mercancías guardadas en tabla`);
      }
      
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
      const borradorCP = await this.crearBorradorCartaPorte(viaje.id, wizardData, facturaId); // ✅ FASE 2: Ya es async
      console.log('✅ [ORCHESTRATOR] Borrador CP creado:', borradorCP.id);

      // ✅ FASE 2: Logs de verificación detallados
      console.log('📋 [ORCHESTRATOR] Verificación de datos del borrador:', {
        borrador_id: borradorCP.id,
        viaje_id: viaje.id,
        rfcEmisor: borradorCP.datos_formulario?.rfcEmisor || '❌ FALTANTE',
        rfcReceptor: borradorCP.datos_formulario?.rfcReceptor || '❌ FALTANTE',
        nombreReceptor: borradorCP.datos_formulario?.nombreReceptor || '❌ FALTANTE',
        numUbicaciones: borradorCP.datos_formulario?.ubicaciones?.length || 0,
        numMercancias: borradorCP.datos_formulario?.mercancias?.length || 0,
        numFiguras: borradorCP.datos_formulario?.figuras?.length || 0,
        tieneAutotransporte: !!borradorCP.datos_formulario?.autotransporte
      });

      // Verificar y alertar sobre datos faltantes críticos
      if (!borradorCP.datos_formulario?.mercancias || borradorCP.datos_formulario.mercancias.length === 0) {
        console.error('❌ [ORCHESTRATOR] ALERTA: Borrador creado sin mercancías!');
      } else {
        console.log(`✅ [ORCHESTRATOR] Borrador con ${borradorCP.datos_formulario.mercancias.length} mercancía(s)`);
        borradorCP.datos_formulario.mercancias.forEach((m: any, i: number) => {
          console.log(`   ${i + 1}. ${m.descripcion} - ${m.cantidad} ${m.unidad || 'pz'} - ${m.peso_kg} kg`);
        });
      }

      if (!borradorCP.datos_formulario?.rfcEmisor) {
        console.error('❌ [ORCHESTRATOR] ALERTA: RFC del emisor faltante! Configura tu empresa.');
      }

      if (!borradorCP.datos_formulario?.rfcReceptor) {
        console.error('❌ [ORCHESTRATOR] ALERTA: RFC del receptor faltante!');
      }
      
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
      
      // Mercancía (solo metadata, NO duplicar datos)
      descripcionMercancia: wizardData.descripcionMercancia,
      claveBienesTransp: wizardData.claveBienesTransp,
      // ⚠️ ELIMINADO: mercancias array - ahora se guardan en tabla mercancias
      
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
   * ⚡ FASE 6: MEJORADO - Crear pre-factura con validaciones estrictas
   * Crear pre-factura (borrador) vinculada al viaje
   * ✅ USA serie_factura y folio_inicial_factura de configuración_empresa
   * ✅ VALIDA que el cliente tenga régimen fiscal configurado (ISO 27001 A.18.1.3)
   * ⚠️ IMPORTANTE: Este campo es OBLIGATORIO para timbrado según normativa SAT
   */
  private static async crearPreFactura(viajeId: string, wizardData: ViajeWizardData): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    // ✅ VALIDACIÓN CRÍTICA: Verificar que el cliente tiene régimen fiscal
    if (!wizardData.cliente?.regimen_fiscal) {
      console.error('❌ [FACTURA] Cliente sin régimen fiscal:', {
        cliente_id: wizardData.cliente?.id,
        nombre: wizardData.cliente?.nombre_razon_social,
        rfc: wizardData.cliente?.rfc
      });
      throw new Error(
        `⚠️ El cliente "${wizardData.cliente?.nombre_razon_social || 'seleccionado'}" no tiene régimen fiscal configurado. ` +
        'Por favor, actualiza los datos del cliente en el módulo de Clientes/Proveedores antes de continuar. ' +
        'Este dato es obligatorio para el timbrado según normativa SAT.'
      );
    }
    
    console.log('✅ [FACTURA] Régimen fiscal del cliente validado:', {
      cliente: wizardData.cliente.nombre_razon_social,
      regimen_fiscal: wizardData.cliente.regimen_fiscal
    });
    
    // Obtener configuración de empresa para RFC emisor y configuración de folios
    const { data: config, error: configError } = await supabase
      .from('configuracion_empresa')
      .select('rfc_emisor, razon_social, regimen_fiscal, serie_factura, folio_actual_factura, folio_inicial_factura')
      .eq('user_id', user.user.id)
      .single();
    
    if (configError || !config || !config.rfc_emisor) {
      throw new Error('⚠️ Configura tu empresa en Configuración antes de crear facturas');
    }
    
    // Calcular el folio a usar (folio_actual_factura o folio_inicial si no hay actual)
    const folioAUsar = config.folio_actual_factura || config.folio_inicial_factura || 1;
    const serieAUsar = config.serie_factura || 'ZS';
    
    console.log('📄 [FACTURA] Usando configuración:', {
      serie: serieAUsar,
      folio: folioAUsar,
      siguiente_folio: folioAUsar + 1,
      regimen_fiscal_emisor: config.regimen_fiscal,
      regimen_fiscal_receptor: wizardData.cliente.regimen_fiscal
    });
    
    const facturaData = wizardData.facturaData!;
    
    const { data: factura, error } = await supabase
      .from('facturas')
      .insert({
        user_id: user.user.id,
        viaje_id: viajeId, // 🔥 Vincular con viaje (CASCADE on delete)
        tipo_comprobante: 'I', // Ingreso
        serie: serieAUsar,
        folio: folioAUsar.toString().padStart(3, '0'),
        fecha_expedicion: new Date().toISOString(),
        rfc_emisor: config.rfc_emisor,
        nombre_emisor: config.razon_social,
        regimen_fiscal_emisor: config.regimen_fiscal,
        rfc_receptor: wizardData.cliente?.rfc || 'XAXX010101000',
        nombre_receptor: wizardData.cliente?.nombre_razon_social || 'Público General',
        regimen_fiscal_receptor: wizardData.cliente.regimen_fiscal, // ✅ CRÍTICO: Régimen fiscal validado
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
          tipo_servicio: wizardData.tipoServicio,
          // Auditoría: Registrar que el régimen fiscal fue validado
          regimen_fiscal_validado: true,
          fecha_validacion: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando factura:', error);
      throw new Error(`Error creando factura: ${error.message}`);
    }
    
    // Incrementar folio_actual_factura para la siguiente factura
    await supabase
      .from('configuracion_empresa')
      .update({ folio_actual_factura: folioAUsar + 1 })
      .eq('user_id', user.user.id);
    
    console.log('✅ [FACTURA] Folio incrementado a:', folioAUsar + 1);
    
    return factura.id;
  }
  
  /**
   * ✅ FASE 2 & 5: MEJORADO - Crear borrador de Carta Porte con validación async
   * Crear borrador de Carta Porte vinculado a viaje y factura
   * ✅ CRÍTICO: Usa await para esperar datos del emisor de configuracion_empresa
   * ✅ Sincroniza mercancías del viaje a la tabla mercancias
   */
  private static async crearBorradorCartaPorte(
    viajeId: string, 
    wizardData: ViajeWizardData,
    facturaId?: string
  ) {
    console.log('📋 [ORCHESTRATOR] Iniciando creación de borrador Carta Porte...');
    console.log('📋 [ORCHESTRATOR] Cliente:', {
      nombre: wizardData.cliente?.nombre_razon_social,
      rfc: wizardData.cliente?.rfc,
      regimen_fiscal: wizardData.cliente?.regimen_fiscal
    });
    console.log('📦 [ORCHESTRATOR] Mercancías del wizard:', {
      descripcionMercancia: wizardData.descripcionMercancia || 'No especificada',
      mercanciasArray: wizardData.mercancias ? `${wizardData.mercancias.length} mercancía(s) detallada(s)` : 'No hay array de mercancías',
      prioridad: wizardData.mercancias && wizardData.mercancias.length > 0 ? 'Usar array detallado' : 'Generar desde descripción'
    });
    
    // ✅ FASE 2: AWAIT obligatorio para obtener RFC del emisor
    const cartaPorteData = await ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(wizardData);
    
    // ✅ FASE 5: Logs detallados para debugging
    console.log('📋 [ORCHESTRATOR] Datos mapeados para borrador:', {
      rfcEmisor: cartaPorteData.rfcEmisor,
      nombreEmisor: cartaPorteData.nombreEmisor,
      rfcReceptor: cartaPorteData.rfcReceptor,
      nombreReceptor: cartaPorteData.nombreReceptor,
      ubicaciones: cartaPorteData.ubicaciones?.length || 0,
      mercancias: cartaPorteData.mercancias?.length || 0,
      figuras: cartaPorteData.figuras?.length || 0
    });
    
    // Log detallado de cada mercancía mapeada
    if (cartaPorteData.mercancias && cartaPorteData.mercancias.length > 0) {
      console.log('📦 [ORCHESTRATOR] Mercancías mapeadas:');
      cartaPorteData.mercancias.forEach((m: any, i: number) => {
        console.log(`   ${i + 1}. ${m.descripcion}`);
        console.log(`      - Cantidad: ${m.cantidad} ${m.unidad || 'pz'}`);
        console.log(`      - Peso: ${m.peso_kg} kg`);
        console.log(`      - Valor: $${m.valor_mercancia} ${m.moneda || 'MXN'}`);
        console.log(`      - Clave ProdServ: ${m.bienes_transp}`);
        console.log(`      - AI Generated: ${m.aiGenerated ? 'Sí' : 'No'}`);
      });
    }
    
    // Agregar referencia a factura si existe
    if (facturaId) {
      (cartaPorteData as any).factura_id = facturaId;
    }
    
    // Agregar referencia al viaje
    (cartaPorteData as any).viaje_id = viajeId;
    
    // ✅ FASE 1: Pasar viaje_id al crear borrador
    const borrador = await CartaPorteLifecycleManager.crearBorrador({
      nombre_borrador: `CP-Viaje-${wizardData.cliente?.nombre_razon_social || 'Cliente'}-${new Date().toLocaleDateString()}`,
      datos_formulario: cartaPorteData,
      version_formulario: '3.1',
      viaje_id: viajeId // ✅ CRÍTICO: Vincular con viaje desde el inicio
    });
    
    console.log('✅ [ORCHESTRATOR] Borrador CP creado con vínculos:', {
      borrador_id: borrador.id,
      viaje_id: viajeId,
      factura_id: facturaId || 'N/A'
    });
    
    return borrador;
  }
  
  /**
   * ✅ NUEVO: Guardar mercancías directamente en tabla (UNIFICADO)
   * Ahora hay UNA sola fuente de verdad: tabla mercancias
   * ISO 27001 A.9.4.1 - Control de acceso a la información
   */
  private static async guardarMercanciasDirectas(viajeId: string, mercancias: any[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');
    
    const mercanciasMapped = mercancias.map((m: any) => ({
      viaje_id: viajeId,
      user_id: user.user.id, // ✅ ISO 27001: Asegurar user_id para RLS
      estado: 'borrador',
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
    
    const { error } = await supabase
      .from('mercancias')
      .insert(mercanciasMapped);
    
    if (error) {
      console.error('❌ Error guardando mercancías:', error);
      throw error;
    }
    
    // Auditoría
    await this.registrarAuditoria('mercancias_created', {
      viaje_id: viajeId,
      cantidad_mercancias: mercancias.length
    });
  }
  
  /**
   * ✅ ACTUALIZADO: Vincular mercancías con carta porte cuando se timbra
   * Solo actualizamos estado y carta_porte_id, NO duplicamos datos
   */
  static async vincularMercanciasConCartaPorte(viajeId: string, cartaPorteId: string) {
    const { error } = await supabase
      .from('mercancias')
      .update({ 
        carta_porte_id: cartaPorteId,
        estado: 'timbrada'
      })
      .eq('viaje_id', viajeId)
      .eq('estado', 'borrador');
    
    if (error) {
      console.error('❌ Error vinculando mercancías:', error);
      throw error;
    }
    
    console.log(`✅ Mercancías vinculadas a carta porte ${cartaPorteId}`);
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
   * ✅ NUEVO: Validar disponibilidad de recursos antes de crear viaje
   * ISO 27001 A.18.1.3 - Integridad de datos
   */
  private static async validarDisponibilidadRecursos(wizardData: ViajeWizardData) {
    console.log('🔍 [ORCHESTRATOR] Validando disponibilidad de recursos...');
    
    const validacion = await DisponibilidadService.validarDisponibilidadCompleta(
      wizardData.conductor?.id,
      wizardData.vehiculo?.id,
      wizardData.remolque?.id,
      wizardData.socio?.id,
      wizardData.fechaInicio,
      wizardData.fechaFin
    );
    
    if (!validacion.todosDisponibles) {
      const conflictos = Object.entries(validacion.resultados)
        .filter(([_, resultado]) => !resultado.disponible)
        .map(([recurso, resultado]) => `${recurso}: ${resultado.conflictos[0]?.motivo}`)
        .join(', ');
      
      throw new Error(`Recursos no disponibles: ${conflictos}`);
    }
    
    // Mostrar advertencias si existen
    Object.entries(validacion.resultados).forEach(([recurso, resultado]) => {
      if (resultado.advertencias.length > 0) {
        console.warn(`⚠️ [${recurso}]:`, resultado.advertencias);
      }
    });
    
    console.log('✅ [ORCHESTRATOR] Todos los recursos están disponibles');
  }
  
  /**
   * ✅ NUEVO: Registrar eventos de auditoría
   * ISO 27001 A.12.4.1 - Registro de eventos
   */
  private static async registrarAuditoria(
    eventoTipo: string,
    datosEvento: any
  ) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      await supabase.from('security_audit_log').insert({
        user_id: user.user?.id,
        event_type: eventoTipo,
        event_data: {
          ...datosEvento,
          timestamp: new Date().toISOString(),
          control: 'ISO 27001 A.12.4.1'
        }
      });
    } catch (error) {
      console.warn('⚠️ Error registrando auditoría:', error);
      // No lanzar error para no interrumpir flujo principal
    }
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
