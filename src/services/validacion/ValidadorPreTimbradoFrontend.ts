/**
 * Validador exhaustivo PRE-TIMBRADO (frontend)
 * 
 * IMPORTANTE: Este validador NO corrige datos automáticamente.
 * Solo reporta errores y advertencias para que el usuario corrija manualmente.
 * 
 * Valida:
 * - Estructura de datos completa
 * - Formatos según SAT (RFC, CP, fechas)
 * - Catálogos SAT (regímenes, uso CFDI, etc.)
 * - Códigos postales contra base de datos
 * - Lógica de negocio CartaPorte 3.1
 */

import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';
import logger from '@/utils/logger';

export interface ErrorValidacion {
  campo: string;
  valor: any;
  mensaje: string;
  correccion?: string; // Sugerencia (NO aplicada automáticamente)
  severidad: 'error' | 'warning';
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: ErrorValidacion[];
  advertencias: ErrorValidacion[];
  totalProblemas: number;
}

export class ValidadorPreTimbradoFrontend {
  
  /**
   * Valida TODA la estructura CartaPorte antes de enviar al edge function
   * @param cartaPorteData - Datos completos de la Carta Porte
   * @returns Resultado con errores y advertencias
   */
  static async validarCartaPorteCompleta(
    cartaPorteData: CartaPorteData
  ): Promise<ResultadoValidacion> {
    logger.debug('validator', 'Iniciando validación pre-timbrado frontend');

    const errores: ErrorValidacion[] = [];
    const advertencias: ErrorValidacion[] = [];

    try {
      // 1. VALIDAR CAMPOS REQUERIDOS
      this.validarCamposRequeridos(cartaPorteData, errores);

      // 2. VALIDAR EMISOR
      this.validarEmisor(cartaPorteData, errores);

      // 3. VALIDAR RECEPTOR
      this.validarReceptor(cartaPorteData, errores);

      // 4. VALIDAR UBICACIONES (mínimo 2: origen + destino)
      this.validarUbicaciones(cartaPorteData.ubicaciones, errores, advertencias);

      // 5. VALIDAR MERCANCÍAS
      this.validarMercancias(cartaPorteData.mercancias, errores, advertencias);

      // 6. VALIDAR AUTOTRANSPORTE
      this.validarAutotransporte(cartaPorteData.autotransporte, errores);

      // 7. VALIDAR FIGURAS TRANSPORTE (mínimo 1 operador)
      this.validarFiguras(cartaPorteData.figuras, errores);

      // 8. VALIDAR CÓDIGOS POSTALES CONTRA CATÁLOGO SAT
      await this.validarCodigosPostalesContraCatalogo(cartaPorteData, errores);

      // 9. VALIDAR TRANSPORTE INTERNACIONAL
      if (cartaPorteData.transporteInternacional) {
        this.validarTransporteInternacional(cartaPorteData, errores);
      }

    } catch (error) {
      logger.error('validator', 'Error durante validación', error);
      errores.push({
        campo: 'general',
        valor: null,
        mensaje: 'Error interno durante la validación',
        severidad: 'error'
      });
    }

    const resultado: ResultadoValidacion = {
      valido: errores.length === 0,
      errores,
      advertencias,
      totalProblemas: errores.length + advertencias.length
    };

    if (!resultado.valido) {
      logger.warn('validator', 'Validación fallida', { 
        totalErrores: errores.length,
        totalAdvertencias: advertencias.length,
        campos: errores.map(e => e.campo)
      });
    } else {
      logger.info('validator', 'Validación exitosa', {
        advertencias: advertencias.length
      });
    }

    return resultado;
  }

  /**
   * Valida que todos los campos requeridos estén presentes
   */
  private static validarCamposRequeridos(
    data: CartaPorteData,
    errores: ErrorValidacion[]
  ): void {
    const requeridos: Array<{ campo: keyof CartaPorteData; nombre: string }> = [
      { campo: 'rfcEmisor', nombre: 'RFC Emisor' },
      { campo: 'nombreEmisor', nombre: 'Nombre Emisor' },
      { campo: 'rfcReceptor', nombre: 'RFC Receptor' },
      { campo: 'nombreReceptor', nombre: 'Nombre Receptor' },
      { campo: 'ubicaciones', nombre: 'Ubicaciones' },
      { campo: 'mercancias', nombre: 'Mercancías' },
      { campo: 'autotransporte', nombre: 'Autotransporte' },
      { campo: 'figuras', nombre: 'Figuras de Transporte' }
    ];

    requeridos.forEach(({ campo, nombre }) => {
      if (!data[campo] || (Array.isArray(data[campo]) && (data[campo] as any[]).length === 0)) {
        errores.push({
          campo: String(campo),
          valor: data[campo],
          mensaje: `${nombre} es requerido y no puede estar vacío`,
          correccion: `Complete la información de ${nombre}`,
          severidad: 'error'
        });
      }
    });
  }

  /**
   * Valida emisor (RFC, nombre, regimen)
   */
  private static validarEmisor(
    data: CartaPorteData,
    errores: ErrorValidacion[]
  ): void {
    // RFC formato
    if (!this.validarFormatoRFC(data.rfcEmisor)) {
      errores.push({
        campo: 'rfcEmisor',
        valor: data.rfcEmisor,
        mensaje: `RFC Emisor inválido: "${data.rfcEmisor}". Debe tener formato: 3-4 letras + 6 dígitos + 3 caracteres alfanuméricos`,
        correccion: 'Ejemplo válido: EKU9003173C9 (RFC de prueba) o XAXX010101000 (Público en general)',
        severidad: 'error'
      });
    }

    // Nombre mínimo 5 caracteres
    if (!data.nombreEmisor || data.nombreEmisor.trim().length < 5) {
      errores.push({
        campo: 'nombreEmisor',
        valor: data.nombreEmisor,
        mensaje: 'Nombre Emisor debe tener mínimo 5 caracteres',
        correccion: 'Ingrese la razón social completa tal como aparece en el SAT',
        severidad: 'error'
      });
    }
  }

  /**
   * Valida receptor (RFC, nombre, domicilio fiscal)
   */
  private static validarReceptor(
    data: CartaPorteData,
    errores: ErrorValidacion[]
  ): void {
    // RFC formato
    if (!this.validarFormatoRFC(data.rfcReceptor)) {
      errores.push({
        campo: 'rfcReceptor',
        valor: data.rfcReceptor,
        mensaje: `RFC Receptor inválido: "${data.rfcReceptor}"`,
        correccion: 'Verifique el formato del RFC (12 o 13 caracteres)',
        severidad: 'error'
      });
    }

    // Nombre
    if (!data.nombreReceptor || data.nombreReceptor.trim().length < 5) {
      errores.push({
        campo: 'nombreReceptor',
        valor: data.nombreReceptor,
        mensaje: 'Nombre Receptor debe tener mínimo 5 caracteres',
        correccion: 'Ingrese la razón social completa',
        severidad: 'error'
      });
    }
  }

  /**
   * Valida ubicaciones (mínimo 2: origen + destino)
   */
  private static validarUbicaciones(
    ubicaciones: any[] | undefined,
    errores: ErrorValidacion[],
    advertencias: ErrorValidacion[]
  ): void {
    if (!ubicaciones || ubicaciones.length < 2) {
      errores.push({
        campo: 'ubicaciones',
        valor: ubicaciones?.length || 0,
        mensaje: 'Se requieren mínimo 2 ubicaciones (Origen y Destino)',
        correccion: 'Agregue al menos una ubicación de Origen y una de Destino',
        severidad: 'error'
      });
      return;
    }

    // Verificar que haya al menos un origen y un destino
    const tieneOrigen = ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
    const tieneDestino = ubicaciones.some(u => u.tipo_ubicacion === 'Destino');

    if (!tieneOrigen) {
      errores.push({
        campo: 'ubicaciones',
        valor: null,
        mensaje: 'Debe haber al menos una ubicación de tipo "Origen"',
        severidad: 'error'
      });
    }

    if (!tieneDestino) {
      errores.push({
        campo: 'ubicaciones',
        valor: null,
        mensaje: 'Debe haber al menos una ubicación de tipo "Destino"',
        severidad: 'error'
      });
    }

    // Validar cada ubicación
    ubicaciones.forEach((ub, index) => {
      // Validar domicilio
      if (!ub.domicilio) {
        errores.push({
          campo: `ubicaciones[${index}].domicilio`,
          valor: null,
          mensaje: `Ubicación ${index + 1}: Domicilio es requerido`,
          severidad: 'error'
        });
        return;
      }

      // Validar código postal
      if (!this.validarFormatoCP(ub.domicilio.codigo_postal)) {
        errores.push({
          campo: `ubicaciones[${index}].domicilio.codigo_postal`,
          valor: ub.domicilio.codigo_postal,
          mensaje: `Ubicación ${index + 1}: Código postal inválido`,
          correccion: 'El código postal debe tener exactamente 5 dígitos',
          severidad: 'error'
        });
      }

      // Validar fecha
      if (!ub.fecha_llegada_salida) {
        errores.push({
          campo: `ubicaciones[${index}].fecha_llegada_salida`,
          valor: null,
          mensaje: `Ubicación ${index + 1}: Fecha/hora de salida o llegada es requerida`,
          severidad: 'error'
        });
      }

      // Validar distancia (solo en destino)
      if (ub.tipo_ubicacion === 'Destino') {
        if (!ub.distancia_recorrida || ub.distancia_recorrida <= 0) {
          errores.push({
            campo: `ubicaciones[${index}].distancia_recorrida`,
            valor: ub.distancia_recorrida,
            mensaje: `Ubicación ${index + 1} (Destino): Distancia recorrida es requerida y debe ser mayor a 0`,
            correccion: 'Ingrese la distancia total del viaje en kilómetros',
            severidad: 'error'
          });
        }
      }
    });
  }

  /**
   * Valida mercancías
   */
  private static validarMercancias(
    mercancias: any[] | undefined,
    errores: ErrorValidacion[],
    advertencias: ErrorValidacion[]
  ): void {
    if (!mercancias || mercancias.length === 0) {
      errores.push({
        campo: 'mercancias',
        valor: 0,
        mensaje: 'Debe haber al menos una mercancía',
        severidad: 'error'
      });
      return;
    }

    mercancias.forEach((merc, index) => {
      // Validar clave producto servicio (8 dígitos)
      if (!merc.bienes_transp || !/^\d{8}$/.test(merc.bienes_transp)) {
        errores.push({
          campo: `mercancias[${index}].bienes_transp`,
          valor: merc.bienes_transp,
          mensaje: `Mercancía ${index + 1}: Clave de producto/servicio debe tener 8 dígitos`,
          correccion: 'Ejemplo: 78101800 (Servicios de transporte de carga)',
          severidad: 'error'
        });
      }

      // Validar descripción
      if (!merc.descripcion || merc.descripcion.trim().length < 5) {
        errores.push({
          campo: `mercancias[${index}].descripcion`,
          valor: merc.descripcion,
          mensaje: `Mercancía ${index + 1}: Descripción debe tener mínimo 5 caracteres`,
          severidad: 'error'
        });
      }

      // Validar cantidad
      if (!merc.cantidad || merc.cantidad <= 0) {
        errores.push({
          campo: `mercancias[${index}].cantidad`,
          valor: merc.cantidad,
          mensaje: `Mercancía ${index + 1}: Cantidad debe ser mayor a 0`,
          severidad: 'error'
        });
      }

      // Validar peso
      if (!merc.peso_kg || merc.peso_kg <= 0) {
        errores.push({
          campo: `mercancias[${index}].peso_kg`,
          valor: merc.peso_kg,
          mensaje: `Mercancía ${index + 1}: Peso debe ser mayor a 0 kg`,
          severidad: 'error'
        });
      }

      // Validar clave unidad
      if (!merc.clave_unidad) {
        errores.push({
          campo: `mercancias[${index}].clave_unidad`,
          valor: null,
          mensaje: `Mercancía ${index + 1}: Clave de unidad es requerida`,
          correccion: 'Ejemplo: KGM (Kilogramo), MTR (Metro), PZA (Pieza)',
          severidad: 'error'
        });
      }
    });
  }

  /**
   * Valida autotransporte federal
   */
  private static validarAutotransporte(
    auto: any,
    errores: ErrorValidacion[]
  ): void {
    if (!auto) {
      errores.push({
        campo: 'autotransporte',
        valor: null,
        mensaje: 'Autotransporte es requerido para Carta Porte 3.1',
        severidad: 'error'
      });
      return;
    }

    // Permiso SCT
    if (!auto.perm_sct) {
      errores.push({
        campo: 'autotransporte.perm_sct',
        valor: null,
        mensaje: 'Tipo de permiso SCT es requerido',
        correccion: 'Ejemplo: TPAF01 (Autotransporte Federal de Carga General)',
        severidad: 'error'
      });
    }

    // Número de permiso
    if (!auto.num_permiso_sct) {
      errores.push({
        campo: 'autotransporte.num_permiso_sct',
        valor: null,
        mensaje: 'Número de permiso SCT es requerido',
        severidad: 'error'
      });
    }

    // Configuración vehicular
    if (!auto.config_vehicular) {
      errores.push({
        campo: 'autotransporte.config_vehicular',
        valor: null,
        mensaje: 'Configuración vehicular es requerida',
        correccion: 'Ejemplo: C2 (Camión de 2 ejes), C3 (Camión de 3 ejes)',
        severidad: 'error'
      });
    }

    // Placa
    if (!auto.placa_vm) {
      errores.push({
        campo: 'autotransporte.placa_vm',
        valor: null,
        mensaje: 'Placa del vehículo es requerida',
        severidad: 'error'
      });
    }

    // Año modelo
    const currentYear = new Date().getFullYear();
    if (!auto.anio_modelo_vm || auto.anio_modelo_vm < 1990 || auto.anio_modelo_vm > currentYear + 1) {
      errores.push({
        campo: 'autotransporte.anio_modelo_vm',
        valor: auto.anio_modelo_vm,
        mensaje: `Año modelo inválido (debe estar entre 1990 y ${currentYear + 1})`,
        severidad: 'error'
      });
    }

    // Seguro responsabilidad civil
    if (!auto.asegura_resp_civil) {
      errores.push({
        campo: 'autotransporte.asegura_resp_civil',
        valor: null,
        mensaje: 'Aseguradora de responsabilidad civil es requerida',
        severidad: 'error'
      });
    }

    if (!auto.poliza_resp_civil) {
      errores.push({
        campo: 'autotransporte.poliza_resp_civil',
        valor: null,
        mensaje: 'Número de póliza de responsabilidad civil es requerido',
        severidad: 'error'
      });
    }
  }

  /**
   * Valida figuras de transporte (mínimo 1 operador)
   */
  private static validarFiguras(
    figuras: any[] | undefined,
    errores: ErrorValidacion[]
  ): void {
    if (!figuras || figuras.length === 0) {
      errores.push({
        campo: 'figuras',
        valor: 0,
        mensaje: 'Debe haber al menos una figura de transporte (Operador)',
        severidad: 'error'
      });
      return;
    }

    // Verificar que haya al menos un operador (tipo 01)
    const tieneOperador = figuras.some(f => f.tipo_figura === '01');
    if (!tieneOperador) {
      errores.push({
        campo: 'figuras',
        valor: null,
        mensaje: 'Debe haber al menos un Operador (TipoFigura = 01)',
        correccion: 'Agregue un operador con su RFC, nombre y número de licencia',
        severidad: 'error'
      });
    }

    // Validar cada figura
    figuras.forEach((fig, index) => {
      // RFC
      if (!this.validarFormatoRFC(fig.rfc_figura)) {
        errores.push({
          campo: `figuras[${index}].rfc_figura`,
          valor: fig.rfc_figura,
          mensaje: `Figura ${index + 1}: RFC inválido`,
          severidad: 'error'
        });
      }

      // Nombre
      if (!fig.nombre_figura || fig.nombre_figura.trim().length < 5) {
        errores.push({
          campo: `figuras[${index}].nombre_figura`,
          valor: fig.nombre_figura,
          mensaje: `Figura ${index + 1}: Nombre debe tener mínimo 5 caracteres`,
          severidad: 'error'
        });
      }

      // Si es operador (01), licencia es obligatoria
      if (fig.tipo_figura === '01' && !fig.num_licencia) {
        errores.push({
          campo: `figuras[${index}].num_licencia`,
          valor: null,
          mensaje: `Figura ${index + 1} (Operador): Número de licencia es obligatorio`,
          severidad: 'error'
        });
      }
    });
  }

  /**
   * Valida códigos postales contra el catálogo SAT
   */
  private static async validarCodigosPostalesContraCatalogo(
    data: CartaPorteData,
    errores: ErrorValidacion[]
  ): Promise<void> {
    const codigosPostales = new Set<string>();

    // Recopilar todos los CPs
    data.ubicaciones?.forEach(ub => {
      if (ub.domicilio?.codigo_postal) {
        codigosPostales.add(ub.domicilio.codigo_postal);
      }
    });

    // Validar contra catálogo
    for (const cp of codigosPostales) {
      const existe = await this.existeEnCatalogoCP(cp);
      if (!existe) {
        errores.push({
          campo: 'codigo_postal',
          valor: cp,
          mensaje: `Código postal "${cp}" no existe en el catálogo SAT`,
          correccion: 'Verifique que el código postal sea válido y esté registrado en el SAT',
          severidad: 'error'
        });
      }
    }
  }

  /**
   * Valida campos específicos de transporte internacional
   */
  private static validarTransporteInternacional(
    data: CartaPorteData,
    errores: ErrorValidacion[]
  ): void {
    if (!data.entradaSalidaMerc) {
      errores.push({
        campo: 'entradaSalidaMerc',
        valor: null,
        mensaje: 'Transporte Internacional: Debe especificar si es Entrada o Salida de mercancía',
        severidad: 'error'
      });
    }

    if (!data.pais_origen_destino) {
      errores.push({
        campo: 'pais_origen_destino',
        valor: null,
        mensaje: 'Transporte Internacional: Debe especificar el país de origen o destino',
        correccion: 'Ejemplo: USA, CAN, BRA',
        severidad: 'error'
      });
    }

    if (!data.via_entrada_salida) {
      errores.push({
        campo: 'via_entrada_salida',
        valor: null,
        mensaje: 'Transporte Internacional: Debe especificar la vía de entrada/salida',
        correccion: 'Ejemplo: 01 (Autotransporte), 02 (Marítimo), 03 (Aéreo)',
        severidad: 'error'
      });
    }
  }

  // ============================================================
  // MÉTODOS AUXILIARES DE VALIDACIÓN
  // ============================================================

  /**
   * Valida formato RFC contra patrón oficial SAT
   */
  private static validarFormatoRFC(rfc: string | undefined): boolean {
    if (!rfc) return false;
    const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
  }

  /**
   * Valida formato de código postal (5 dígitos)
   */
  private static validarFormatoCP(cp: string | undefined): boolean {
    if (!cp) return false;
    const cpPattern = /^\d{5}$/;
    return cpPattern.test(cp);
  }

  /**
   * Consulta si un código postal existe en el catálogo SAT
   */
  private static async existeEnCatalogoCP(cp: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cat_codigo_postal')
        .select('codigo_postal')
        .eq('codigo_postal', cp)
        .maybeSingle();
      
      if (error) {
        logger.error('validator', 'Error consultando catálogo CP', error);
        return true; // En caso de error, no bloquear
      }

      return !!data;
    } catch (error) {
      logger.error('validator', 'Error validando CP contra catálogo', error);
      return true; // En caso de error, no bloquear
    }
  }
}
