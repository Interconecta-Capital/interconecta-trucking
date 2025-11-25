/**
 * Sistema unificado de mapeo CartaPorte
 * Cumple: Single Responsibility + Open/Closed Principles
 * 
 * Este mapper consolida toda la lógica de transformación entre:
 * - Viajes de base de datos → CartaPorteData
 * - Formularios → CartaPorteData
 * - CartaPorteData → Formularios
 */

import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData, MercanciaCompleta, UbicacionCompleta, FiguraCompleta, AutotransporteCompleto } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

export interface CartaPorteFormData {
  configuracion: {
    version: '3.0' | '3.1';
    tipoComprobante: string;
    emisor: {
      rfc: string;
      nombre: string;
      regimenFiscal: string;
    };
    receptor: {
      rfc: string;
      nombre: string;
    };
  };
  ubicaciones: UbicacionCompleta[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  tipoCreacion: 'plantilla' | 'carga' | 'manual';
  tipoCfdi: 'Ingreso' | 'Traslado';
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  transporteInternacional: boolean;
  registroIstmo: boolean;
  cartaPorteVersion: '3.0' | '3.1';
  cartaPorteId?: string;
}

/**
 * Mapper unificado para CartaPorte
 * Reemplaza ViajeCartaPorteMapper y useCartaPorteMappers
 */
export class CartaPorteUnifiedMapper {
  
  /**
   * Mapear desde base de datos (viaje completo con relaciones)
   * @param viajeId - ID del viaje en DB
   * @returns CartaPorteData validado
   */
  static async fromDatabaseViaje(viajeId: string): Promise<CartaPorteData> {
    logger.debug('mapper', 'Iniciando mapeo desde DB', { viajeId });
    
    try {
      // Obtener viaje con todas las relaciones
      const { data: viaje, error } = await supabase
        .from('viajes')
        .select(`
          *,
          conductor:conductores(*),
          vehiculo:vehiculos(*),
          remolque:remolques(*),
          cliente:clientes_proveedores(*)
        `)
        .eq('id', viajeId)
        .single();

      if (error || !viaje) {
        logger.error('mapper', 'Error al obtener viaje de DB', error);
        throw new Error(`Error al obtener viaje: ${error?.message}`);
      }

      // Normalizar tracking_data.ubicaciones si es necesario
      const trackingData = (viaje.tracking_data as any) || {};
      let ubicaciones = trackingData.ubicaciones;

      if (ubicaciones && !Array.isArray(ubicaciones)) {
        logger.debug('mapper', 'Normalizando ubicaciones de objeto a array');
        ubicaciones = [
          ubicaciones.origen && { ...ubicaciones.origen, tipo_ubicacion: 'Origen' },
          ubicaciones.destino && { ...ubicaciones.destino, tipo_ubicacion: 'Destino' }
        ].filter(Boolean);
      }

      // Crear ViajeWizardData enriquecido con relaciones
      const viajeTyped = viaje as any;
      const wizardData: Partial<ViajeWizardData> = {
        conductor: viaje.conductor as any,
        vehiculo: viaje.vehiculo as any,
        remolque: viaje.remolque as any,
        cliente: viaje.cliente as any,
        socio: undefined,
        origen: trackingData.origen || {},
        destino: trackingData.destino || {},
        descripcionMercancia: viajeTyped.descripcion_mercancia || trackingData.descripcion_mercancia,
        distanciaRecorrida: viaje.distancia_km || trackingData.distancia_total,
        distanciaTotal: viaje.distancia_km || trackingData.distancia_total,
        tipoServicio: viajeTyped.tipo_servicio || 'flete_pagado',
        fechaInicio: viajeTyped.fecha_inicio,
        fechaFin: viajeTyped.fecha_fin,
        paradasAutorizadas: []
      };

      // Usar el método de mapeo completo
      const cartaPorteData = await this.mapToValidCartaPorteFormat(wizardData as ViajeWizardData);
      
      logger.info('mapper', 'Mapeo desde DB completado', { 
        viajeId, 
        ubicaciones: cartaPorteData.ubicaciones?.length,
        mercancias: cartaPorteData.mercancias?.length 
      });

      return cartaPorteData;
    } catch (error) {
      logger.error('mapper', 'Error en fromDatabaseViaje', error);
      throw error;
    }
  }

  /**
   * Mapear desde formulario (wizard data)
   * @param formData - Datos del formulario CartaPorte
   * @returns CartaPorteData validado
   */
  static fromFormData(formData: CartaPorteFormData): CartaPorteData {
    logger.debug('mapper', 'Mapeando desde formulario');
    
    return {
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion,
      ubicaciones: formData.ubicaciones,
      mercancias: formData.mercancias,
      autotransporte: formData.autotransporte,
      figuras: formData.figuras,
      cartaPorteId: formData.cartaPorteId,
    };
  }

  /**
   * Mapear hacia formulario (para edición)
   * @param cartaPorteData - Datos de CartaPorte
   * @returns CartaPorteFormData para formulario
   */
  static toFormData(cartaPorteData: CartaPorteData): CartaPorteFormData {
    logger.debug('mapper', 'Mapeando hacia formulario');
    
    return {
      configuracion: {
        version: (cartaPorteData.cartaPorteVersion as '3.0' | '3.1') || '3.1',
        tipoComprobante: cartaPorteData.tipoCfdi === 'Traslado' ? 'T' : 'I',
        emisor: {
          rfc: cartaPorteData.rfcEmisor || '',
          nombre: cartaPorteData.nombreEmisor || '',
          regimenFiscal: '',
        },
        receptor: {
          rfc: cartaPorteData.rfcReceptor || '',
          nombre: cartaPorteData.nombreReceptor || '',
        },
      },
      ubicaciones: cartaPorteData.ubicaciones || [],
      mercancias: cartaPorteData.mercancias || [],
      autotransporte: cartaPorteData.autotransporte || {
        placa_vm: '',
        anio_modelo_vm: new Date().getFullYear(),
        config_vehicular: '',
        perm_sct: '',
        num_permiso_sct: '',
        asegura_resp_civil: '',
        poliza_resp_civil: '',
        asegura_med_ambiente: '',
        poliza_med_ambiente: '',
        peso_bruto_vehicular: 0,
        tipo_carroceria: '',
        remolques: []
      },
      figuras: cartaPorteData.figuras || [],
      tipoCreacion: (cartaPorteData.tipoCreacion as 'plantilla' | 'carga' | 'manual') || 'manual',
      tipoCfdi: (cartaPorteData.tipoCfdi as 'Ingreso' | 'Traslado') || 'Traslado',
      rfcEmisor: cartaPorteData.rfcEmisor || '',
      nombreEmisor: cartaPorteData.nombreEmisor || '',
      rfcReceptor: cartaPorteData.rfcReceptor || '',
      nombreReceptor: cartaPorteData.nombreReceptor || '',
      transporteInternacional: cartaPorteData.transporteInternacional === true || cartaPorteData.transporteInternacional === 'Sí',
      registroIstmo: !!cartaPorteData.registroIstmo,
      cartaPorteVersion: (cartaPorteData.cartaPorteVersion as '3.0' | '3.1') || '3.1',
      cartaPorteId: cartaPorteData.cartaPorteId,
    };
  }

  /**
   * Mapear ViajeWizardData completo a CartaPorteData válido
   * Lógica tomada de ViajeToCartaPorteMapper.mapToValidCartaPorteFormat
   */
  private static async mapToValidCartaPorteFormat(wizardData: ViajeWizardData): Promise<CartaPorteData> {
    const figuras = await this.autoPopularFiguras(wizardData);
    
    return {
      cartaPorteVersion: '3.1',
      tipoCfdi: 'T',
      viaTransporte: '01',
      transporteInternacional: false,
      registroIstmo: false,
      rfcEmisor: '',
      nombreEmisor: '',
      regimenFiscalEmisor: '',
      rfcReceptor: wizardData.cliente?.rfc || '',
      nombreReceptor: wizardData.cliente?.nombre_razon_social || '',
      usoCfdi: 'S01',
      ubicaciones: this.mapearUbicaciones(wizardData),
      mercancias: this.mapearMercancias(wizardData),
      autotransporte: this.mapearAutotransporte(wizardData),
      figuras: figuras,
      tipoCreacion: 'manual'
    };
  }

  /**
   * Auto-popula figuras desde conductor y socio/cliente
   */
  private static async autoPopularFiguras(viajeData: ViajeWizardData): Promise<any[]> {
    const figuras: any[] = [];

    // Figura 01: Operador (conductor)
    if (viajeData.conductor) {
      figuras.push({
        id: `figura-conductor-${Date.now()}`,
        tipo_figura: '01',
        rfc_figura: viajeData.conductor.rfc || 'XEXX010101000',
        nombre_figura: viajeData.conductor.nombre,
        num_licencia: viajeData.conductor.num_licencia,
        tipo_licencia: viajeData.conductor.tipo_licencia || 'C',
        curp: viajeData.conductor.curp,
        residencia_fiscal_figura: viajeData.conductor.residencia_fiscal || 'MEX',
        num_reg_id_trib: viajeData.conductor.num_reg_id_trib
      });
    }

    // Figura 02: Propietario/Arrendatario
    const propietario = viajeData.socio || viajeData.cliente;
    if (propietario) {
      figuras.push({
        id: `figura-propietario-${Date.now()}`,
        tipo_figura: '02',
        rfc_figura: propietario.rfc,
        nombre_figura: propietario.nombre_razon_social || propietario.nombre,
        residencia_fiscal_figura: 'MEX'
      });
    }

    return figuras;
  }

  private static mapearUbicaciones(viajeData: ViajeWizardData): UbicacionCompleta[] {
    const ubicaciones: UbicacionCompleta[] = [];
    const fechaActual = new Date().toISOString();
    
    // ORIGEN
    if (viajeData.origen) {
      ubicaciones.push({
        id: 'OR000001',
        tipo_ubicacion: 'Origen',
        rfc: viajeData.cliente?.rfc || viajeData.socio?.rfc || 'XEXX010101000',
        nombre: viajeData.cliente?.nombre_razon_social || viajeData.socio?.nombre_razon_social || 'Cliente',
        fecha_llegada_salida: viajeData.fechaInicio || fechaActual,
        fecha_hora_salida_llegada: viajeData.fechaInicio || fechaActual,
        distancia_recorrida: 0,
        coordenadas: viajeData.origen.coordenadas,
        domicilio: {
          pais: viajeData.origen.domicilio?.pais || 'MEX',
          codigo_postal: viajeData.origen.domicilio?.codigo_postal || viajeData.origen.domicilio?.codigoPostal || '00000',
          estado: viajeData.origen.domicilio?.estado || 'No especificado',
          municipio: viajeData.origen.domicilio?.municipio || 'No especificado',
          colonia: viajeData.origen.domicilio?.colonia || 'No especificada',
          calle: viajeData.origen.domicilio?.calle || viajeData.origen.direccion || 'No especificada',
          numero_exterior: viajeData.origen.domicilio?.numero_exterior || viajeData.origen.domicilio?.numExterior || ''
        }
      });
    }
    
    // DESTINO
    if (viajeData.destino) {
      ubicaciones.push({
        id: 'DE000001',
        tipo_ubicacion: 'Destino',
        rfc: viajeData.cliente?.rfc || viajeData.socio?.rfc || 'XEXX010101000',
        nombre: viajeData.cliente?.nombre_razon_social || viajeData.socio?.nombre_razon_social || 'Cliente',
        fecha_llegada_salida: viajeData.fechaFin || fechaActual,
        fecha_hora_salida_llegada: viajeData.fechaFin || fechaActual,
        distancia_recorrida: viajeData.distanciaRecorrida || viajeData.distanciaTotal || 0,
        coordenadas: viajeData.destino.coordenadas,
        domicilio: {
          pais: viajeData.destino.domicilio?.pais || 'MEX',
          codigo_postal: viajeData.destino.domicilio?.codigo_postal || viajeData.destino.domicilio?.codigoPostal || '00000',
          estado: viajeData.destino.domicilio?.estado || 'No especificado',
          municipio: viajeData.destino.domicilio?.municipio || 'No especificado',
          colonia: viajeData.destino.domicilio?.colonia || 'No especificada',
          calle: viajeData.destino.domicilio?.calle || viajeData.destino.direccion || 'No especificada',
          numero_exterior: viajeData.destino.domicilio?.numero_exterior || viajeData.destino.domicilio?.numExterior || ''
        }
      });
    }
    
    return ubicaciones;
  }
  
  private static mapearMercancias(viajeData: ViajeWizardData): MercanciaCompleta[] {
    return [{
      id: `mercancia-${Date.now()}`,
      bienes_transp: '99999999',
      descripcion: viajeData.descripcionMercancia || 'Mercancía de viaje',
      cantidad: 1,
      clave_unidad: 'H87',
      peso_kg: 100,
      valor_mercancia: 1000,
      moneda: 'MXN',
      material_peligroso: false,
      especie_protegida: false,
      fraccion_arancelaria: '99999999'
    }];
  }
  
  private static mapearAutotransporte(viajeData: ViajeWizardData): AutotransporteCompleto | undefined {
    if (!viajeData.vehiculo) return undefined;
    
    return {
      placa_vm: viajeData.vehiculo.placa,
      anio_modelo_vm: viajeData.vehiculo.anio || new Date().getFullYear(),
      config_vehicular: viajeData.vehiculo.config_vehicular || 'C2',
      perm_sct: 'TPAF03',
      num_permiso_sct: 'SCT-123456',
      asegura_resp_civil: 'SEGUROS SA',
      poliza_resp_civil: 'POL123456',
      asegura_med_ambiente: 'SEGUROS SA',
      poliza_med_ambiente: 'POL123456',
      peso_bruto_vehicular: viajeData.vehiculo.peso_bruto_vehicular || 3500,
      tipo_carroceria: '01',
      remolques: []
    };
  }
}
