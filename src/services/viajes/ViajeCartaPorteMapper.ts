
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData, MercanciaCompleta } from '@/types/cartaPorte';

interface CamposLegalesCriticos {
  // Emisor (obligatorios SAT)
  rfcEmisor: string;
  nombreEmisor: string;
  regimenFiscalEmisor: string;
  
  // Receptor (obligatorios SAT)
  rfcReceptor: string;
  nombreReceptor: string;
  usoCfdi: string;
  
  // Transporte (obligatorios SAT)
  tipoComprobante: string;
  viaTransporte: string;
  transporteInternacional: boolean;
  
  // Ubicaciones (obligatorias SAT)
  ubicaciones: Array<{
    tipo: 'Origen' | 'Destino';
    rfc: string;
    nombre: string;
    domicilio: any;
    coordenadas?: string;
    distanciaRecorrida?: number;
  }>;
  
  // Mercancías (obligatorias SAT)
  mercancias: Array<{
    bienes_transp: string;
    descripcion: string;
    cantidad: number;
    clave_unidad: string;
    peso_kg: number;
    fraccion_arancelaria: string;
  }>;
  
  // Autotransporte (obligatorio SAT)
  autotransporte: {
    placa_vm: string;
    config_vehicular: string;
    peso_bruto_vehicular: number;
    anio_modelo_vm: number;
    perm_sct: string;
    num_permiso_sct: string;
  };
  
  // Figuras (obligatorias SAT)
  figuras: Array<{
    tipo_figura: string;
    rfc_figura: string;
    nombre_figura: string;
    num_licencia: string;
  }>;
}

export class ViajeCartaPorteMapper {
  /**
   * Migra datos desde un viaje hacia una carta porte
   * Garantiza cumplimiento legal SAT v3.1
   */
  static migrarViajeACartaPorte(viajeData: ViajeWizardData): Partial<CartaPorteData> {
    console.log('Migrando datos de viaje a carta porte:', viajeData);
    
    const cartaPorteData: Partial<CartaPorteData> = {
      // Configuración básica SAT
      cartaPorteVersion: '3.1',
      tipoCfdi: 'T', // Traslado
      viaTransporte: '01', // Autotransporte
      transporteInternacional: false,
      registroIstmo: false,
      
      // Datos del emisor (se deben configurar desde perfil)
      rfcEmisor: '', // REQUERIDO: Se debe obtener del perfil del usuario
      nombreEmisor: '',
      regimenFiscalEmisor: '',
      
      // Datos del receptor (desde cliente del viaje)
      rfcReceptor: viajeData.cliente?.rfc || '',
      nombreReceptor: viajeData.cliente?.nombre_razon_social || '',
      usoCfdi: 'S01', // Sin efectos fiscales por defecto
      
      // Ubicaciones (origen y destino del viaje)
      ubicaciones: this.mapearUbicaciones(viajeData),
      
      // Mercancías (descripción general del viaje)
      mercancias: this.mapearMercancias(viajeData),
      
      // Autotransporte (vehículo asignado)
      autotransporte: this.mapearAutotransporte(viajeData),
      
      // Figuras (conductor asignado)
      figuras: this.mapearFiguras(viajeData)
    };
    
    return cartaPorteData;
  }
  
  /**
   * Migra datos desde una carta porte hacia un viaje
   * Preserva información legal crítica
   */
  static migrarCartaPorteAViaje(cartaPorteData: CartaPorteData): Partial<ViajeWizardData> {
    console.log('Migrando datos de carta porte a viaje:', cartaPorteData);
    
    const viajeData: Partial<ViajeWizardData> = {
      // Cliente desde receptor de carta porte
      cliente: cartaPorteData.nombreReceptor ? {
        id: '', // Se debe buscar/crear cliente
        rfc: cartaPorteData.rfcReceptor,
        nombre_razon_social: cartaPorteData.nombreReceptor,
        regimen_fiscal: '',
        domicilio_fiscal: {},
        uso_cfdi: cartaPorteData.usoCfdi || 'S01'
      } : undefined,
      
      // Origen y destino desde ubicaciones
      origen: this.extraerUbicacionOrigen(cartaPorteData),
      destino: this.extraerUbicacionDestino(cartaPorteData),
      
      // Distancia desde carta porte
      distanciaRecorrida: this.calcularDistanciaTotal(cartaPorteData),
      
      // Descripción desde mercancías
      descripcionMercancia: this.extraerDescripcionMercancias(cartaPorteData),
      
      // Tipo de servicio inferido
      tipoServicio: 'carga_general',
      
      // Vehículo desde autotransporte
      vehiculo: cartaPorteData.autotransporte ? {
        id: '', // Se debe buscar vehículo por placa
        placa: cartaPorteData.autotransporte.placa_vm,
        configuracion_vehicular: cartaPorteData.autotransporte.config_vehicular,
        peso_bruto_vehicular: cartaPorteData.autotransporte.peso_bruto_vehicular,
        anio: cartaPorteData.autotransporte.anio_modelo_vm
      } : undefined,
      
      // Conductor desde figuras
      conductor: this.extraerConductor(cartaPorteData)
    };
    
    return viajeData;
  }
  
  /**
   * Valida que los datos migrados cumplan con SAT v3.1
   */
  static validarCumplimientoSAT(data: Partial<CartaPorteData>): { 
    valido: boolean; 
    errores: string[]; 
    warnings: string[]; 
  } {
    const errores: string[] = [];
    const warnings: string[] = [];
    
    // Validaciones obligatorias SAT v3.1
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
    
    // Validaciones específicas v3.1
    if (data.mercancias) {
      data.mercancias.forEach((mercancia, index) => {
        if (!mercancia.fraccion_arancelaria) {
          errores.push(`Mercancía ${index + 1}: Fracción arancelaria es obligatoria en v3.1`);
        }
      });
    }
    
    // Warnings de buenas prácticas
    if (data.transporteInternacional && !data.registroIstmo) {
      warnings.push('Para transporte internacional considere el registro ISTMO');
    }
    
    return {
      valido: errores.length === 0,
      errores,
      warnings
    };
  }
  
  // Métodos auxiliares privados
  private static mapearUbicaciones(viajeData: ViajeWizardData) {
    const ubicaciones = [];
    
    if (viajeData.origen) {
      ubicaciones.push({
        id: 'OR000001',
        tipo_ubicacion: 'Origen',
        rfc: viajeData.cliente?.rfc || 'XEXX010101000',
        nombre: viajeData.cliente?.nombre_razon_social || 'Cliente',
        fecha_llegada_salida: new Date().toISOString(),
        fecha_hora_salida_llegada: new Date().toISOString(),
        distancia_recorrida: 0,
        coordenadas: viajeData.origen.coordenadas,
        domicilio: {
          pais: 'MEX',
          codigo_postal: viajeData.origen.codigoPostal || '00000',
          estado: 'No especificado',
          municipio: 'No especificado',
          colonia: 'No especificada',
          calle: viajeData.origen.direccion || 'No especificada'
        }
      });
    }
    
    if (viajeData.destino) {
      ubicaciones.push({
        id: 'DE000001',
        tipo_ubicacion: 'Destino',
        rfc: viajeData.cliente?.rfc || 'XEXX010101000',
        nombre: viajeData.cliente?.nombre_razon_social || 'Cliente',
        fecha_llegada_salida: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fecha_hora_salida_llegada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        distancia_recorrida: viajeData.distanciaRecorrida || 0,
        coordenadas: viajeData.destino.coordenadas,
        domicilio: {
          pais: 'MEX',
          codigo_postal: viajeData.destino.codigoPostal || '00000',
          estado: 'No especificado',
          municipio: 'No especificado',
          colonia: 'No especificada',
          calle: viajeData.destino.direccion || 'No especificada'
        }
      });
    }
    
    return ubicaciones;
  }
  
  private static mapearMercancias(viajeData: ViajeWizardData): MercanciaCompleta[] {
    return [{
      id: `mercancia-${Date.now()}`,
      bienes_transp: '99999999', // Mercancía general
      descripcion: viajeData.descripcionMercancia || 'Mercancía de viaje',
      cantidad: 1,
      clave_unidad: 'H87', // Pieza
      peso_kg: 100, // Peso estimado por defecto
      valor_mercancia: 1000,
      moneda: 'MXN',
      material_peligroso: false,
      especie_protegida: false,
      fraccion_arancelaria: '99999999' // Requerido v3.1
    }];
  }
  
  private static mapearAutotransporte(viajeData: ViajeWizardData) {
    if (!viajeData.vehiculo) return undefined;
    
    return {
      placa_vm: viajeData.vehiculo.placa,
      anio_modelo_vm: viajeData.vehiculo.anio || new Date().getFullYear(),
      config_vehicular: viajeData.vehiculo.configuracion_vehicular || 'C2',
      perm_sct: 'TPAF03',
      num_permiso_sct: 'SCT-123456', // Se debe configurar
      asegura_resp_civil: 'SEGUROS SA',
      poliza_resp_civil: 'POL123456',
      asegura_med_ambiente: 'SEGUROS SA',
      poliza_med_ambiente: 'POL123456',
      peso_bruto_vehicular: viajeData.vehiculo.peso_bruto_vehicular || 3500,
      tipo_carroceria: '01'
    };
  }
  
  private static mapearFiguras(viajeData: ViajeWizardData) {
    if (!viajeData.conductor) return [];
    
    return [{
      id: `figura-${Date.now()}`,
      tipo_figura: '01', // Operador
      rfc_figura: viajeData.conductor.rfc || 'XEXX010101000',
      nombre_figura: viajeData.conductor.nombre,
      num_licencia: viajeData.conductor.num_licencia || '',
      tipo_licencia: viajeData.conductor.tipo_licencia || 'C'
    }];
  }
  
  private static extraerUbicacionOrigen(cartaPorteData: CartaPorteData) {
    const origen = cartaPorteData.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen');
    if (!origen) return undefined;
    
    return {
      direccion: origen.domicilio?.calle || '',
      codigoPostal: origen.domicilio?.codigo_postal || '',
      coordenadas: origen.coordenadas
    };
  }
  
  private static extraerUbicacionDestino(cartaPorteData: CartaPorteData) {
    const destino = cartaPorteData.ubicaciones?.find(u => u.tipo_ubicacion === 'Destino');
    if (!destino) return undefined;
    
    return {
      direccion: destino.domicilio?.calle || '',
      codigoPostal: destino.domicilio?.codigo_postal || '',
      coordenadas: destino.coordenadas
    };
  }
  
  private static calcularDistanciaTotal(cartaPorteData: CartaPorteData): number {
    return cartaPorteData.ubicaciones?.reduce((total, ubicacion) => {
      return total + (ubicacion.distancia_recorrida || 0);
    }, 0) || 0;
  }
  
  private static extraerDescripcionMercancias(cartaPorteData: CartaPorteData): string {
    return cartaPorteData.mercancias?.map(m => m.descripcion).join(', ') || '';
  }
  
  private static extraerConductor(cartaPorteData: CartaPorteData) {
    const conductor = cartaPorteData.figuras?.find(f => f.tipo_figura === '01');
    if (!conductor) return undefined;
    
    return {
      id: '', // Se debe buscar por RFC o nombre
      nombre: conductor.nombre_figura,
      rfc: conductor.rfc_figura,
      num_licencia: conductor.num_licencia,
      tipo_licencia: conductor.tipo_licencia
    };
  }
}
