
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

  static async mapToValidCartaPorteFormat(wizardData: ViajeWizardData): Promise<CartaPorteData> {
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

    // Obtener datos del usuario para el emisor (AHORA ES ASYNC)
    const emisorData = await this.getEmisorData();

    // FASE 2: Mapear configuración general con tipo CFDI estandarizado
    // Retornar en formato CartaPorteData con todos los campos sincronizados
    return {
      cartaPorteVersion: '3.1',
      rfcEmisor: emisorData.rfc,
      nombreEmisor: emisorData.nombre,
      regimenFiscalEmisor: emisorData.regimenFiscal,
      rfcReceptor: baseData.configuracion.receptor.rfc,
      nombreReceptor: baseData.configuracion.receptor.nombre,
      usoCfdi: baseData.configuracion.receptor.usoCfdi || 'S01',
      tipoCfdi: 'Traslado', // FASE 2: Usar 'Traslado' en lugar de 'T' (se convierte en XML generator)
      transporteInternacional: false,
      registroIstmo: false,
      viaTransporte: '01', // Autotransporte
      mercancias: baseData.mercancias,
      ubicaciones: baseData.ubicaciones.map(ub => {
        // ✅ CORRECCIÓN: Soportar ambas estructuras (domicilio.codigo_postal y codigoPostal directo)
        const codigoPostal = ub.domicilio?.codigo_postal || ub.domicilio?.codigoPostal || ub.codigoPostal || '';
        
        if (!codigoPostal) {
          console.warn('⚠️ Ubicación sin código postal:', ub.tipoUbicacion, ub.direccion);
        }
        
        return {
          id: ub.idUbicacion,
          tipo_ubicacion: ub.tipoUbicacion,
          rfc: baseData.configuracion.receptor.rfc,
          nombre: baseData.configuracion.receptor.nombre,
          fecha_llegada_salida: ub.fechaHoraSalidaLlegada,
          fecha_hora_salida_llegada: ub.fechaHoraSalidaLlegada,
          distancia_recorrida: ub.distanciaRecorrida || 0,
          coordenadas: ub.coordenadas,
          domicilio: {
            pais: ub.domicilio?.pais || 'MEX',
            codigo_postal: codigoPostal,
            estado: ub.domicilio?.estado || '',
            municipio: ub.domicilio?.municipio || '',
            colonia: ub.domicilio?.colonia || '',
            calle: ub.domicilio?.calle || ub.direccion || ''
          }
        };
      }),
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
   * Obtener datos del emisor (usuario actual) desde configuracion_empresa
   */
  static async getEmisorData(): Promise<{ rfc: string; nombre: string; regimenFiscal: string }> {
    // IMPORTAR SERVICIO DE CONFIGURACIÓN
    const { ConfiguracionEmisorService } = await import('@/services/configuracion/ConfiguracionEmisorService');
    
    try {
      const emisorData = await ConfiguracionEmisorService.obtenerDatosEmisor();
      return {
        rfc: emisorData.rfc,
        nombre: emisorData.nombre,
        regimenFiscal: emisorData.regimenFiscal
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos del emisor:', error);
      throw new Error(`No se pueden obtener datos del emisor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Validar que los datos del wizard están completos para crear Carta Porte
   */
  static validarDatosCompletos(wizardData: ViajeWizardData): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar cliente
    if (!wizardData.cliente) {
      errores.push('Cliente no seleccionado');
    } else {
      if (!wizardData.cliente.rfc) errores.push('RFC del cliente faltante');
      if (!wizardData.cliente.nombre_razon_social) errores.push('Nombre del cliente faltante');
      // Régimen fiscal es recomendado pero no bloqueante
      if (!wizardData.cliente.regimen_fiscal) {
        console.warn('⚠️ Régimen fiscal del cliente no especificado');
      }
    }

    // Validar ubicaciones
    if (!wizardData.origen) {
      errores.push('Origen no especificado');
    } else {
      if (!wizardData.origen.direccion && !wizardData.origen.nombre) {
        errores.push('Dirección de origen incompleta');
      }
    }

    if (!wizardData.destino) {
      errores.push('Destino no especificado');
    } else {
      if (!wizardData.destino.direccion && !wizardData.destino.nombre) {
        errores.push('Dirección de destino incompleta');
      }
    }

    // Validar vehículo
    if (!wizardData.vehiculo) {
      errores.push('Vehículo no seleccionado');
    } else {
      if (!wizardData.vehiculo.placa) errores.push('Placa del vehículo faltante');
      // Permiso SCT es recomendado pero no bloqueante para borrador
      if (!wizardData.vehiculo.permiso_sct) {
        console.warn('⚠️ Permiso SCT del vehículo no especificado');
      }
    }

    // Validar conductor
    if (!wizardData.conductor) {
      errores.push('Conductor no seleccionado');
    } else {
      if (!wizardData.conductor.nombre) errores.push('Nombre del conductor faltante');
      // RFC y licencia son recomendados pero no bloqueantes para borrador
      if (!wizardData.conductor.rfc) {
        console.warn('⚠️ RFC del conductor no especificado');
      }
      if (!wizardData.conductor.num_licencia) {
        console.warn('⚠️ Número de licencia del conductor no especificado');
      }
    }

    // Mercancía
    if (!wizardData.descripcionMercancia) {
      errores.push('Descripción de mercancía faltante');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Generar ID único para la carta porte
   */
  /**
   * Genera mercancías inteligentes basado en la descripción usando IA/heurísticas
   * FASE 1: Integrado con MercanciaMultipleParser para detectar múltiples productos
   */
  static generateIntelligentMercancia(wizardData: ViajeWizardData): MercanciaCompleta[] {
    const descripcion = wizardData.descripcionMercancia || 'Mercancía general';
    
    // FASE 1: Primero intentar detectar múltiples productos
    const { MercanciaMultipleParser } = require('@/services/mercancias/MercanciaMultipleParser');
    const productosDetectados = MercanciaMultipleParser.analizarDescripcion(descripcion);
    
    if (productosDetectados.length > 1) {
      console.log(`✅ FASE 1: Detectados ${productosDetectados.length} productos distintos`);
      
      // Generar una mercancía por cada producto detectado
      return productosDetectados.map((producto, index) => {
        const analisis = this.analyzeCargoDescription(producto.descripcion);
        
        return {
          id: `mercancia-${Date.now()}-${index}`,
          bienes_transp: analisis.claveProdServ,
          descripcion: producto.descripcion,
          cantidad: producto.cantidad,
          clave_unidad: producto.unidad, // Usar unidad detectada por el parser
          peso_kg: analisis.peso, // Usar peso calculado por analyzeCargoDescription
          valor_mercancia: analisis.valor, // Usar valor calculado
          moneda: 'MXN',
          material_peligroso: analisis.materialPeligroso,
          especie_protegida: analisis.especieProtegida,
          fraccion_arancelaria: analisis.fraccionArancelaria,
          aiGenerated: true,
          aiConfidence: analisis.confidence
        };
      });
    }
    
    // Si solo hay un producto o no se detectaron múltiples, usar análisis normal
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
      aiGenerated: true,
      aiConfidence: analisis.confidence
    }];
  }

  /**
   * Analiza la descripción de mercancía para sugerir datos fiscales
   */
  static analyzeCargoDescription(descripcion: string) {
    const desc = descripcion.toLowerCase();
    
    // Patrones comunes para diferentes tipos de mercancía (AMPLIADO)
    const patterns = {
      textiles: {
        keywords: ['ropa', 'textil', 'tela', 'prendas', 'algodón', 'poliéster', 'vestido', 'camisa', 'pantalón'],
        claveProdServ: '53101500', // Textiles
        fraccionArancelaria: '61091000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 50
      },
      alimentos: {
        keywords: ['comida', 'alimento', 'fruta', 'verdura', 'carne', 'lácteos', 'queso', 'leche', 'pan', 'cereal'],
        claveProdServ: '50101500', // Alimentos
        fraccionArancelaria: '08042000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 100
      },
      electronica: {
        keywords: ['computadora', 'electrónico', 'teléfono', 'tv', 'tablet', 'equipo', 'laptop', 'celular', 'smartphone'],
        claveProdServ: '43211500', // Equipos electrónicos
        fraccionArancelaria: '85171100',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 25
      },
      construccion: {
        keywords: ['cemento', 'ladrillo', 'material', 'construcción', 'fierro', 'varilla', 'arena', 'grava', 'block'],
        claveProdServ: '30111500', // Materiales construcción
        fraccionArancelaria: '72142000',
        claveUnidad: 'TNE', // Tonelada
        pesoPromedio: 1000
      },
      quimicos: {
        keywords: ['químico', 'pintura', 'solvente', 'ácido', 'reactivo', 'corrosivo', 'tóxico'],
        claveProdServ: '12101600', // Productos químicos
        fraccionArancelaria: '38099100',
        claveUnidad: 'LTR', // Litro
        pesoPromedio: 200,
        materialPeligroso: true
      },
      automotriz: {
        keywords: ['auto', 'automóvil', 'coche', 'refacciones', 'llantas', 'motor', 'transmisión', 'frenos', 'suspensión', 'batería'],
        claveProdServ: '25101500', // Partes automotrices
        fraccionArancelaria: '87089900',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 30
      },
      farmaceuticos: {
        keywords: ['medicamento', 'fármaco', 'medicina', 'vacuna', 'antibiótico', 'pastillas', 'jarabe', 'inyección'],
        claveProdServ: '51101500', // Productos farmacéuticos
        fraccionArancelaria: '30049000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 10
      },
      maquinaria: {
        keywords: ['maquinaria', 'equipo industrial', 'herramienta', 'torno', 'prensa', 'compresor', 'generador'],
        claveProdServ: '21101500', // Maquinaria industrial
        fraccionArancelaria: '84159000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 500
      },
      bebidas: {
        keywords: ['bebida', 'refresco', 'agua', 'jugo', 'cerveza', 'vino', 'licor', 'alcohol'],
        claveProdServ: '50202200', // Bebidas
        fraccionArancelaria: '22021000',
        claveUnidad: 'LTR', // Litro
        pesoPromedio: 150
      },
      papel: {
        keywords: ['papel', 'cartón', 'embalaje', 'caja', 'cuaderno', 'libro', 'revista'],
        claveProdServ: '14111500', // Productos de papel
        fraccionArancelaria: '48191000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 80
      },
      plasticos: {
        keywords: ['plástico', 'pet', 'polietileno', 'pvc', 'resina', 'envase plástico'],
        claveProdServ: '40101600', // Plásticos
        fraccionArancelaria: '39201000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 60
      },
      madera: {
        keywords: ['madera', 'mueble', 'tarima', 'pallet', 'triplay', 'aglomerado'],
        claveProdServ: '30101500', // Productos de madera
        fraccionArancelaria: '44071000',
        claveUnidad: 'MTR', // Metro
        pesoPromedio: 200
      },
      metales: {
        keywords: ['acero', 'aluminio', 'metal', 'hierro', 'cobre', 'lámina', 'perfil'],
        claveProdServ: '30111700', // Metales
        fraccionArancelaria: '72142000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 500
      },
      vidrio: {
        keywords: ['vidrio', 'cristal', 'ventana', 'espejo', 'botella de vidrio'],
        claveProdServ: '30131500', // Productos de vidrio
        fraccionArancelaria: '70051000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 100
      },
      electrodomesticos: {
        keywords: ['refrigerador', 'lavadora', 'estufa', 'microondas', 'licuadora', 'electrodoméstico'],
        claveProdServ: '52141500', // Electrodomésticos
        fraccionArancelaria: '85161000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 40
      },
      agricola: {
        keywords: ['semilla', 'fertilizante', 'agroquímico', 'herbicida', 'pesticida', 'agrícola'],
        claveProdServ: '10171500', // Productos agrícolas
        fraccionArancelaria: '31010000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 150
      },
      cosmeticos: {
        keywords: ['cosmético', 'perfume', 'crema', 'shampoo', 'maquillaje', 'jabón'],
        claveProdServ: '53131600', // Cosméticos
        fraccionArancelaria: '33049900',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 20
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
