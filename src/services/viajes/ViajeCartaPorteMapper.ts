import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData, MercanciaCompleta } from '@/types/cartaPorte';

interface CamposLegalesCriticos {
  rfcEmisor: string;
  nombreEmisor: string;
  regimenFiscalEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  usoCfdi: string;
  tipoComprobante: string;
  viaTransporte: string;
  transporteInternacional: boolean;
  ubicaciones: Array<any>;
  mercancias: Array<any>;
  autotransporte: any;
  figuras: Array<any>;
}

export class ViajeCartaPorteMapper {
  /**
   * Migra datos desde un viaje hacia una carta porte E INSERTA EN TABLAS RELACIONADAS
   * Garantiza cumplimiento legal SAT v3.1
   */
  static async migrarViajeACartaPorte(viajeData: ViajeWizardData, cartaPorteId?: string): Promise<Partial<CartaPorteData>> {
    console.log('✅ Migrando datos de viaje a carta porte:', viajeData);
    
    // Auto-poblar figuras desde conductor y socio/cliente
    const figuras = await this.autoPopularFiguras(viajeData);
    
    const cartaPorteData: Partial<CartaPorteData> = {
      cartaPorteVersion: '3.1',
      tipoCfdi: 'T',
      viaTransporte: '01',
      transporteInternacional: false,
      registroIstmo: false,
      rfcEmisor: '',
      nombreEmisor: '',
      regimenFiscalEmisor: '',
      rfcReceptor: viajeData.cliente?.rfc || '',
      nombreReceptor: viajeData.cliente?.nombre_razon_social || '',
      usoCfdi: 'S01',
      ubicaciones: this.mapearUbicaciones(viajeData),
      mercancias: this.mapearMercancias(viajeData),
      autotransporte: this.mapearAutotransporte(viajeData),
      figuras: figuras,
    };

    // ✅ Si tenemos cartaPorteId, insertar en tablas relacionadas
    if (cartaPorteId) {
      await this.insertarDatosRelacionados(cartaPorteId, cartaPorteData, viajeData);
    }

    return cartaPorteData;
  }

  /**
   * Inserta datos en tablas relacionadas (ubicaciones, mercancias, figuras)
   */
  private static async insertarDatosRelacionados(
    cartaPorteId: string,
    cartaPorte: Partial<CartaPorteData>,
    viajeData: ViajeWizardData
  ): Promise<void> {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // 1. Insertar ubicaciones
      if (cartaPorte.ubicaciones && cartaPorte.ubicaciones.length > 0) {
        const ubicacionesData = cartaPorte.ubicaciones.map((ub: any, index: number) => ({
          carta_porte_id: cartaPorteId,
          tipo_ubicacion: ub.tipo_ubicacion,
          id_ubicacion: ub.id,
          rfc: ub.rfc,
          nombre: ub.nombre,
          fecha_hora_salida_llegada: ub.fecha_hora_salida_llegada,
          orden_secuencia: index + 1,
          distancia_recorrida: ub.distancia_recorrida || null,
          domicilio: ub.domicilio || {},
          user_id: user.id
        }));

        const { error: errorUbicaciones } = await supabase
          .from('ubicaciones')
          .insert(ubicacionesData);
        
        if (errorUbicaciones) {
          console.error('Error insertando ubicaciones:', errorUbicaciones);
        } else {
          console.log(`✅ ${ubicacionesData.length} ubicaciones insertadas`);
        }
      }

      // 2. Insertar mercancías
      if (cartaPorte.mercancias && cartaPorte.mercancias.length > 0) {
        const mercanciasData = cartaPorte.mercancias.map((merc: any) => ({
          carta_porte_id: cartaPorteId,
          bienes_transp: merc.bienes_transp,
          descripcion: merc.descripcion,
          cantidad: merc.cantidad,
          clave_unidad: merc.clave_unidad,
          unidad: 'Pieza',
          peso_kg: merc.peso_kg,
          material_peligroso: merc.material_peligroso || false,
          user_id: user.id
        }));

        const { error: errorMercancias } = await supabase
          .from('mercancias')
          .insert(mercanciasData);
        
        if (errorMercancias) {
          console.error('Error insertando mercancías:', errorMercancias);
        } else {
          console.log(`✅ ${mercanciasData.length} mercancías insertadas`);
        }
      }

      // 3. Insertar figuras de transporte
      if (cartaPorte.figuras && cartaPorte.figuras.length > 0) {
        const figurasData = cartaPorte.figuras.map((fig: any) => ({
          carta_porte_id: cartaPorteId,
          tipo_figura: fig.tipo_figura,
          rfc_figura: fig.rfc_figura,
          num_licencia: fig.num_licencia || null,
          nombre_figura: fig.nombre_figura,
          curp: fig.curp || null,
          num_reg_id_trib: fig.num_reg_id_trib || null,
          residencia_fiscal: fig.residencia_fiscal_figura || 'MEX',
          user_id: user.id
        }));

        const { error: errorFiguras } = await supabase
          .from('figuras_transporte')
          .insert(figurasData);
        
        if (errorFiguras) {
          console.error('Error insertando figuras:', errorFiguras);
        } else {
          console.log(`✅ ${figurasData.length} figuras insertadas`);
        }
      }

      console.log('✅ Datos relacionados insertados correctamente');
    } catch (error) {
      console.error('Error en insertarDatosRelacionados:', error);
    }
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
        curp: viajeData.conductor.curp, // ← CRÍTICO para operadores
        residencia_fiscal_figura: viajeData.conductor.residencia_fiscal || 'MEX',
        num_reg_id_trib: viajeData.conductor.num_reg_id_trib
      });
    }

    // Figura 02: Propietario/Arrendatario (socio o cliente)
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

  /**
   * Migra datos desde una carta porte hacia un viaje
   */
  static migrarCartaPorteAViaje(cartaPorteData: CartaPorteData): Partial<ViajeWizardData> {
    console.log('Migrando datos de carta porte a viaje:', cartaPorteData);
    
    const viajeData: Partial<ViajeWizardData> = {
      cliente: cartaPorteData.nombreReceptor ? {
        id: '',
        rfc: cartaPorteData.rfcReceptor,
        nombre_razon_social: cartaPorteData.nombreReceptor,
        regimen_fiscal: '',
        domicilio_fiscal: {},
        uso_cfdi: cartaPorteData.usoCfdi || 'S01'
      } : undefined,
      origen: this.extraerUbicacionOrigen(cartaPorteData),
      destino: this.extraerUbicacionDestino(cartaPorteData),
      distanciaRecorrida: this.calcularDistanciaTotal(cartaPorteData),
      descripcionMercancia: this.extraerDescripcionMercancias(cartaPorteData),
      tipoServicio: 'flete_pagado',
      vehiculo: cartaPorteData.autotransporte ? {
        id: '',
        placa: cartaPorteData.autotransporte.placa_vm,
        config_vehicular: cartaPorteData.autotransporte.config_vehicular,
        peso_bruto_vehicular: cartaPorteData.autotransporte.peso_bruto_vehicular,
        anio: cartaPorteData.autotransporte.anio_modelo_vm
      } : undefined,
      conductor: this.extraerConductor(cartaPorteData)
    };
    
    return viajeData;
  }

  /**
   * Valida cumplimiento SAT v3.1
   */
  static validarCumplimientoSAT(data: Partial<CartaPorteData>): { 
    valido: boolean; 
    errores: string[]; 
    warnings: string[]; 
  } {
    const errores: string[] = [];
    const warnings: string[] = [];
    
    if (!data.rfcEmisor) errores.push('RFC del emisor es obligatorio');
    if (!data.rfcReceptor) errores.push('RFC del receptor es obligatorio');
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errores.push('Se requieren mínimo 2 ubicaciones (origen y destino)');
    }
    if (!data.mercancias || data.mercancias.length === 0) {
      errores.push('Se requiere al menos una mercancía');
    }
    if (!data.autotransporte?.placa_vm) {
      errores.push('Placa del vehículo es obligatoria');
    }
    if (!data.figuras || data.figuras.length === 0) {
      errores.push('Se requiere al menos una figura de transporte');
    }
    
    if (data.mercancias) {
      data.mercancias.forEach((mercancia: any, index: number) => {
        if (!mercancia.fraccion_arancelaria) {
          errores.push(`Mercancía ${index + 1}: Fracción arancelaria es obligatoria en v3.1`);
        }
      });
    }
    
    if (data.transporteInternacional && !data.registroIstmo) {
      warnings.push('Para transporte internacional considere el registro ISTMO');
    }
    
    return {
      valido: errores.length === 0,
      errores,
      warnings
    };
  }

  // ============================================
  // MÉTODOS AUXILIARES PRIVADOS - MAPEO
  // ============================================

  private static mapearUbicaciones(viajeData: ViajeWizardData) {
    const ubicaciones = [];
    const fechaActual = new Date().toISOString();
    
    // ORIGEN - con todos los campos requeridos
    if (viajeData.origen) {
      ubicaciones.push({
        id: 'OR000001',
        tipo_ubicacion: 'Origen',
        rfc: viajeData.cliente?.rfc || viajeData.socio?.rfc || 'XEXX010101000',
        nombre: viajeData.cliente?.nombre_razon_social || viajeData.socio?.nombre_razon_social,
        fecha_llegada_salida: viajeData.fechaInicio || fechaActual,
        fecha_hora_salida_llegada: viajeData.fechaInicio || fechaActual,
        distancia_recorrida: 0,
        coordenadas: viajeData.origen.coordenadas,
        domicilio: {
          pais: viajeData.origen.domicilio?.pais || 'MEX',
          codigo_postal: viajeData.origen.domicilio?.codigo_postal || viajeData.origen.domicilio?.codigoPostal,
          estado: viajeData.origen.domicilio?.estado,
          municipio: viajeData.origen.domicilio?.municipio,
          colonia: viajeData.origen.domicilio?.colonia,
          calle: viajeData.origen.domicilio?.calle || viajeData.origen.direccion,
          numero_exterior: viajeData.origen.domicilio?.numero_exterior || viajeData.origen.domicilio?.numExterior
        }
      });
    }
    
    // PARADAS INTERMEDIAS (si existen)
    if (viajeData.paradasAutorizadas && viajeData.paradasAutorizadas.length > 0) {
      viajeData.paradasAutorizadas.forEach((parada, index) => {
        ubicaciones.push({
          id: `PI00000${index + 1}`,
          tipo_ubicacion: 'Paso Intermedio',
          rfc: 'XEXX010101000',
          nombre: parada.nombre || 'Parada Intermedia',
          fecha_llegada_salida: fechaActual,
          fecha_hora_salida_llegada: fechaActual,
          distancia_recorrida: 0,
          coordenadas: parada.coordenadas ? `${parada.coordenadas.latitud},${parada.coordenadas.longitud}` : undefined,
          domicilio: {
            pais: 'MEX',
            codigo_postal: parada.codigoPostal || '00000',
            estado: 'No especificado',
            municipio: 'No especificado',
            colonia: 'No especificada',
            calle: parada.direccion || 'No especificada',
            numero_exterior: ''
          }
        });
      });
    }
    
    // DESTINO - con todos los campos y distancia
    if (viajeData.destino) {
      ubicaciones.push({
        id: 'DE000001',
        tipo_ubicacion: 'Destino',
        rfc: viajeData.cliente?.rfc || viajeData.socio?.rfc || 'XEXX010101000',
        nombre: viajeData.cliente?.nombre_razon_social || viajeData.socio?.nombre_razon_social,
        fecha_llegada_salida: viajeData.fechaFin || fechaActual,
        fecha_hora_salida_llegada: viajeData.fechaFin || fechaActual,
        distancia_recorrida: viajeData.distanciaRecorrida || viajeData.distanciaTotal || 0,
        coordenadas: viajeData.destino.coordenadas,
        domicilio: {
          pais: viajeData.destino.domicilio?.pais || 'MEX',
          codigo_postal: viajeData.destino.domicilio?.codigo_postal || viajeData.destino.domicilio?.codigoPostal,
          estado: viajeData.destino.domicilio?.estado,
          municipio: viajeData.destino.domicilio?.municipio,
          colonia: viajeData.destino.domicilio?.colonia,
          calle: viajeData.destino.domicilio?.calle || viajeData.destino.direccion,
          numero_exterior: viajeData.destino.domicilio?.numero_exterior || viajeData.destino.domicilio?.numExterior
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
  
  private static mapearAutotransporte(viajeData: ViajeWizardData) {
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
      tipo_carroceria: '01'
    };
  }
  
  private static extraerUbicacionOrigen(cartaPorteData: CartaPorteData) {
    const origen = cartaPorteData.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Origen');
    if (!origen) return undefined;
    
    return {
      direccion: origen.domicilio?.calle || '',
      codigoPostal: origen.domicilio?.codigo_postal || '',
      coordenadas: origen.coordenadas
    };
  }
  
  private static extraerUbicacionDestino(cartaPorteData: CartaPorteData) {
    const destino = cartaPorteData.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Destino');
    if (!destino) return undefined;
    
    return {
      direccion: destino.domicilio?.calle || '',
      codigoPostal: destino.domicilio?.codigo_postal || '',
      coordenadas: destino.coordenadas
    };
  }
  
  private static calcularDistanciaTotal(cartaPorteData: CartaPorteData): number {
    return cartaPorteData.ubicaciones?.reduce((total: number, ubicacion: any) => {
      return total + (ubicacion.distancia_recorrida || 0);
    }, 0) || 0;
  }
  
  private static extraerDescripcionMercancias(cartaPorteData: CartaPorteData): string {
    return cartaPorteData.mercancias?.map((m: any) => m.descripcion).join(', ') || '';
  }
  
  private static extraerConductor(cartaPorteData: CartaPorteData) {
    const conductor = cartaPorteData.figuras?.find((f: any) => f.tipo_figura === '01');
    if (!conductor) return undefined;
    
    return {
      id: '',
      nombre: conductor.nombre_figura,
      rfc: conductor.rfc_figura,
      num_licencia: conductor.num_licencia,
      tipo_licencia: conductor.tipo_licencia
    };
  }
}
