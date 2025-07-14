
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData, MercanciaCompleta } from '@/types/cartaPorte';

export class ViajeToCartaPorteMapper {
  static mapToCartaPorteData(wizardData: ViajeWizardData) {
    // Mapear datos básicos de configuración
    const configuracion = {
      version: '3.1',
      tipoComprobante: 'T', // Traslado
      emisor: {
        rfc: '', // Se debe configurar desde el perfil del usuario
        nombre: '',
        regimenFiscal: ''
      },
      receptor: {
        rfc: wizardData.cliente?.rfc || '',
        nombre: wizardData.cliente?.nombre_razon_social || '',
        usoCfdi: 'S01'
      }
    };

    // Mapear ubicaciones (origen y destino)
    const ubicaciones = [];
    
    if (wizardData.origen) {
      ubicaciones.push({
        tipoUbicacion: 'Origen',
        idUbicacion: 'OR000001',
        direccion: wizardData.origen.direccion,
        codigoPostal: wizardData.origen.codigoPostal,
        coordenadas: wizardData.origen.coordenadas,
        fechaHoraSalidaLlegada: new Date().toISOString()
      });
    }

    if (wizardData.destino) {
      ubicaciones.push({
        tipoUbicacion: 'Destino',
        idUbicacion: 'DE000001',
        direccion: wizardData.destino.direccion,
        codigoPostal: wizardData.destino.codigoPostal,
        coordenadas: wizardData.destino.coordenadas,
        distanciaRecorrida: wizardData.distanciaRecorrida,
        fechaHoraSalidaLlegada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Mañana por defecto
      });
    }

    // Mapear mercancías con datos inteligentes basados en la descripción
    const mercancias: MercanciaCompleta[] = this.generateIntelligentMercancia(wizardData);

    // Mapear autotransporte completo
    const autotransporte = {
      placa: wizardData.vehiculo?.placa || '',
      configVehicular: wizardData.vehiculo?.configuracion_vehicular || 'C2',
      pesoBrutoVehicular: wizardData.vehiculo?.peso_bruto_vehicular || 3500,
      anioModeloVm: wizardData.vehiculo?.anio || new Date().getFullYear(),
      // Incluir datos completos del vehículo
      marca: wizardData.vehiculo?.marca || '',
      modelo: wizardData.vehiculo?.modelo || '',
      tipo_carroceria: wizardData.vehiculo?.tipo_carroceria || '01',
      // Datos de seguros y permisos
      permiso_sct: wizardData.vehiculo?.permiso_sct || 'TPAF03',
      numero_permiso_sct: wizardData.vehiculo?.numero_permiso_sct || 'SCT-123456',
      aseguradora_responsabilidad_civil: wizardData.vehiculo?.aseguradora_responsabilidad_civil || 'SEGUROS SA',
      poliza_responsabilidad_civil: wizardData.vehiculo?.poliza_responsabilidad_civil || 'POL123456',
      aseguradora_medio_ambiente: wizardData.vehiculo?.aseguradora_medio_ambiente || 'SEGUROS SA',
      poliza_medio_ambiente: wizardData.vehiculo?.poliza_medio_ambiente || 'POL123456'
    };

    // Mapear figuras de transporte completas
    const figuras = [];
    if (wizardData.conductor) {
      figuras.push({
        tipoFigura: '01', // Operador
        nombreFigura: wizardData.conductor.nombre,
        rfcFigura: wizardData.conductor.rfc || 'XEXX010101000',
        numLicencia: wizardData.conductor.num_licencia || '',
        tipoLicencia: wizardData.conductor.tipo_licencia || 'C',
        // Datos adicionales del conductor
        curp: wizardData.conductor.curp || '',
        operador_sct: wizardData.conductor.operador_sct || false,
        residencia_fiscal: wizardData.conductor.residencia_fiscal || 'MEX',
        vigencia_licencia: wizardData.conductor.vigencia_licencia || '',
        // Domicilio del conductor si está disponible
        domicilio: {
          pais: 'MEX',
          codigo_postal: wizardData.conductor.direccion?.codigo_postal || '06000',
          estado: wizardData.conductor.direccion?.estado || 'Ciudad de México',
          municipio: wizardData.conductor.direccion?.municipio || 'Ciudad de México',
          colonia: wizardData.conductor.direccion?.colonia || 'Centro',
          calle: wizardData.conductor.direccion?.calle || 'Calle sin número'
        }
      });
    }

    return {
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      // Metadatos del viaje
      tipoServicio: wizardData.tipoServicio,
      descripcionMercancia: wizardData.descripcionMercancia,
      // Sincronizar datos de la ruta calculada
      rutaCalculada: wizardData.distanciaRecorrida ? {
        distancia: wizardData.distanciaRecorrida,
        duracion: wizardData.distanciaRecorrida ? Math.round(wizardData.distanciaRecorrida / 60) : undefined,
        coordenadas: {
          origen: wizardData.origen?.coordenadas,
          destino: wizardData.destino?.coordenadas
        }
      } : undefined
    };
  }

  static mapToValidCartaPorteFormat(wizardData: ViajeWizardData): CartaPorteData {
    const baseData = this.mapToCartaPorteData(wizardData);
    
    // Validaciones más tolerantes con fallbacks
    console.log('🔍 Validando datos del wizard:', {
      cliente: !!wizardData.cliente,
      clienteRfc: wizardData.cliente?.rfc,
      origen: !!wizardData.origen,
      destino: !!wizardData.destino,
      vehiculo: !!wizardData.vehiculo,
      conductor: !!wizardData.conductor
    });

    // Validar RFC del cliente (requerido)
    if (!baseData.configuracion.receptor.rfc) {
      const errorMsg = 'RFC del cliente es requerido para crear la carta porte';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Validar ubicaciones mínimas
    if (baseData.ubicaciones.length < 2) {
      const errorMsg = 'Se requieren al menos origen y destino para crear la carta porte';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Asegurar al menos una mercancía (crear por defecto si no existe)
    if (baseData.mercancias.length === 0) {
      console.log('⚠️ No hay mercancías definidas, creando mercancía por defecto');
      baseData.mercancias.push({
        id: `mercancia-default-${Date.now()}`,
        bienes_transp: '99999999',
        descripcion: wizardData.descripcionMercancia || 'Mercancía general',
        cantidad: 1,
        clave_unidad: 'H87',
        peso_kg: 100,
        valor_mercancia: 1000,
        moneda: 'MXN',
        material_peligroso: false,
        especie_protegida: false,
        fraccion_arancelaria: '99999999'
      });
    }

    console.log('✅ Validaciones completadas, generando CartaPorteData');

    // Obtener datos del usuario para el emisor
    const emisorData = this.getEmisorData(wizardData);

    // Retornar en formato CartaPorteData con todos los campos sincronizados
    return {
      cartaPorteVersion: '3.1',
      rfcEmisor: emisorData.rfc,
      nombreEmisor: emisorData.nombre,
      regimenFiscalEmisor: emisorData.regimenFiscal,
      rfcReceptor: baseData.configuracion.receptor.rfc,
      nombreReceptor: baseData.configuracion.receptor.nombre,
      usoCfdi: baseData.configuracion.receptor.usoCfdi || 'S01',
      tipoCfdi: 'T', // Traslado
      transporteInternacional: false,
      registroIstmo: false,
      viaTransporte: '01', // Autotransporte
      mercancias: baseData.mercancias,
      ubicaciones: baseData.ubicaciones.map(ub => ({
        id: ub.idUbicacion,
        tipo_ubicacion: ub.tipoUbicacion,
        rfc: baseData.configuracion.receptor.rfc,
        nombre: baseData.configuracion.receptor.nombre,
        fecha_llegada_salida: ub.fechaHoraSalidaLlegada,
        fecha_hora_salida_llegada: ub.fechaHoraSalidaLlegada,
        distancia_recorrida: ub.distanciaRecorrida || 0,
        coordenadas: ub.coordenadas,
        domicilio: {
          pais: 'MEX',
          codigo_postal: ub.codigoPostal || '06600',
          estado: 'Ciudad de México',
          municipio: 'Ciudad de México',
          colonia: 'Centro',
          calle: ub.direccion || 'Calle sin número'
        }
      })),
      autotransporte: {
        placa_vm: baseData.autotransporte.placa,
        anio_modelo_vm: baseData.autotransporte.anioModeloVm,
        config_vehicular: baseData.autotransporte.configVehicular,
        perm_sct: baseData.autotransporte.permiso_sct || 'TPAF03',
        num_permiso_sct: baseData.autotransporte.numero_permiso_sct || 'SCT-123456',
        asegura_resp_civil: baseData.autotransporte.aseguradora_responsabilidad_civil || 'SEGUROS SA',
        poliza_resp_civil: baseData.autotransporte.poliza_responsabilidad_civil || 'POL123456',
        asegura_med_ambiente: baseData.autotransporte.aseguradora_medio_ambiente || 'SEGUROS SA',
        poliza_med_ambiente: baseData.autotransporte.poliza_medio_ambiente || 'POL123456',
        peso_bruto_vehicular: baseData.autotransporte.pesoBrutoVehicular,
        tipo_carroceria: baseData.autotransporte.tipo_carroceria || '01',
        marca: baseData.autotransporte.marca || '',
        modelo: baseData.autotransporte.modelo || '',
        remolques: []
      },
      figuras: baseData.figuras.map(fig => ({
        id: `figura-${Date.now()}`,
        tipo_figura: fig.tipoFigura,
        rfc_figura: fig.rfcFigura,
        nombre_figura: fig.nombreFigura,
        num_licencia: fig.numLicencia,
        tipo_licencia: fig.tipoLicencia,
        curp: fig.curp || '',
        operador_sct: fig.operador_sct || false,
        residencia_fiscal_figura: fig.residencia_fiscal || 'MEX',
        vigencia_licencia: fig.vigencia_licencia || '',
        domicilio: fig.domicilio || {
          pais: 'MEX',
          codigo_postal: '06000',
          estado: 'Ciudad de México',
          municipio: 'Ciudad de México',
          colonia: 'Centro',
          calle: 'Calle sin número'
        }
      }))
    };
  }

  /**
   * Obtener datos del emisor (usuario actual)
   */
  static getEmisorData(wizardData: ViajeWizardData) {
    // En un viaje real, estos datos vendrían del perfil del usuario
    // Por ahora, usar datos por defecto válidos
    return {
      rfc: 'XAXX010101000', // RFC genérico para pruebas
      nombre: 'Empresa Transportista S.A. de C.V.',
      regimenFiscal: '601' // General de Ley Personas Morales
    };
  }

  /**
   * Generar ID único para la carta porte
   */
  /**
   * Genera mercancías inteligentes basado en la descripción usando IA/heurísticas
   */
  static generateIntelligentMercancia(wizardData: ViajeWizardData): MercanciaCompleta[] {
    const descripcion = wizardData.descripcionMercancia || 'Mercancía general';
    
    // Análisis inteligente de la descripción para sugerir datos
    const analisis = this.analyzeCargoDescription(descripcion);
    
    return [{
      id: `mercancia-${Date.now()}`,
      bienes_transp: analisis.claveProdServ,
      descripcion: descripcion,
      cantidad: analisis.cantidad,
      clave_unidad: analisis.claveUnidad,
      peso_kg: analisis.peso,
      valor_mercancia: analisis.valor,
      moneda: 'MXN',
      material_peligroso: analisis.materialPeligroso,
      especie_protegida: analisis.especieProtegida,
      fraccion_arancelaria: analisis.fraccionArancelaria,
      // Agregar metadatos de IA
      aiGenerated: true,
      aiConfidence: analisis.confidence
    }];
  }

  /**
   * Analiza la descripción de mercancía para sugerir datos fiscales
   */
  static analyzeCargoDescription(descripcion: string) {
    const desc = descripcion.toLowerCase();
    
    // Patrones comunes para diferentes tipos de mercancía
    const patterns = {
      textiles: {
        keywords: ['ropa', 'textil', 'tela', 'prendas', 'algodón', 'poliéster'],
        claveProdServ: '53101500', // Textiles
        fraccionArancelaria: '61091000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 50
      },
      alimentos: {
        keywords: ['comida', 'alimento', 'fruta', 'verdura', 'carne', 'lácteos'],
        claveProdServ: '50101500', // Alimentos
        fraccionArancelaria: '08042000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 100
      },
      electronica: {
        keywords: ['computadora', 'electrónico', 'teléfono', 'tv', 'tablet', 'equipo'],
        claveProdServ: '43211500', // Equipos electrónicos
        fraccionArancelaria: '85171100',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 25
      },
      construccion: {
        keywords: ['cemento', 'ladrillo', 'material', 'construcción', 'fierro', 'varilla'],
        claveProdServ: '30111500', // Materiales construcción
        fraccionArancelaria: '72142000',
        claveUnidad: 'TNE', // Tonelada
        pesoPromedio: 1000
      },
      quimicos: {
        keywords: ['químico', 'pintura', 'solvente', 'ácido', 'reactivo'],
        claveProdServ: '12101600', // Productos químicos
        fraccionArancelaria: '38099100',
        claveUnidad: 'LTR', // Litro
        pesoPromedio: 200,
        materialPeligroso: true
      }
    };

    // Buscar coincidencias
    let categoria = null;
    let maxCoincidencias = 0;
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const coincidencias = pattern.keywords.filter(keyword => desc.includes(keyword)).length;
      if (coincidencias > maxCoincidencias) {
        maxCoincidencias = coincidencias;
        categoria = pattern;
      }
    }

    // Si no hay coincidencias, usar valores por defecto
    if (!categoria || maxCoincidencias === 0) {
      categoria = {
        claveProdServ: '99999999',
        fraccionArancelaria: '99999999',
        claveUnidad: 'H87',
        pesoPromedio: 100,
        materialPeligroso: false
      };
    }

    // Extraer cantidad si está mencionada en la descripción
    const cantidadMatch = desc.match(/(\d+)\s*(kilogramos?|kg|toneladas?|piezas?|unidades?|cajas?)/);
    const cantidad = cantidadMatch ? parseInt(cantidadMatch[1]) : 1;

    // Calcular peso basado en cantidad y tipo
    const pesoEstimado = cantidad * (categoria.pesoPromedio || 100);

    // Calcular valor estimado (muy básico)
    const valorEstimado = Math.max(pesoEstimado * 10, 1000);

    return {
      claveProdServ: categoria.claveProdServ,
      fraccionArancelaria: categoria.fraccionArancelaria,
      claveUnidad: categoria.claveUnidad,
      cantidad: cantidad,
      peso: pesoEstimado,
      valor: valorEstimado,
      materialPeligroso: categoria.materialPeligroso || false,
      especieProtegida: false,
      confidence: (maxCoincidencias > 0 ? 'alta' : 'baja') as 'alta' | 'media' | 'baja'
    };
  }

  static generateCartaPorteId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `CP-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validar completitud de datos antes del mapeo
   */
  static validateWizardData(wizardData: ViajeWizardData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!wizardData.cliente) {
      errors.push('Cliente no seleccionado');
    } else if (!wizardData.cliente.rfc) {
      errors.push('RFC del cliente es requerido');
    }

    if (!wizardData.origen) {
      errors.push('Origen no definido');
    }

    if (!wizardData.destino) {
      errors.push('Destino no definido');
    }

    if (!wizardData.vehiculo) {
      errors.push('Vehículo no asignado');
    }

    if (!wizardData.conductor) {
      errors.push('Conductor no asignado');
    }

    if (!wizardData.descripcionMercancia) {
      errors.push('Descripción de mercancía faltante');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
