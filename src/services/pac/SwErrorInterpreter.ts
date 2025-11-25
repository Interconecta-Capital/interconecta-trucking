/**
 * SwErrorInterpreter - Intérprete de errores de SmartWeb y SAT
 * 
 * Mapea códigos de error del PAC y SAT a mensajes amigables
 * con sugerencias de solución
 * 
 * @see FASE_3_IMPLEMENTACION.md
 */

import logger from '@/utils/logger';

export interface InterpretedError {
  codigo: string;
  mensaje: string;
  mensajeUsuario: string;
  severidad: 'critico' | 'error' | 'advertencia' | 'info';
  accion: string;
  documentacion?: string;
  campoRelacionado?: string;
  esRecuperable: boolean;
}

export interface SwErrorResponse {
  status: number;
  message: string;
  messageDetail?: string;
  data?: any;
}

/**
 * Catálogo de errores del SAT para CFDI 4.0 y Carta Porte 3.1
 */
const CATALOGO_ERRORES_SAT: Record<string, Omit<InterpretedError, 'codigo'>> = {
  // Errores generales CFDI
  'CFDI40100': {
    mensaje: 'El RFC del emisor no se encuentra registrado en la LCO del SAT',
    mensajeUsuario: 'El RFC del emisor no está dado de alta en el SAT',
    severidad: 'critico',
    accion: 'Verifique que el RFC del emisor sea correcto y esté activo en la lista de contribuyentes',
    campoRelacionado: 'rfcEmisor',
    esRecuperable: false
  },
  'CFDI40101': {
    mensaje: 'El RFC del receptor no se encuentra registrado en la LRFC del SAT',
    mensajeUsuario: 'El RFC del receptor no está registrado en el SAT',
    severidad: 'critico',
    accion: 'Verifique que el RFC del receptor sea correcto',
    campoRelacionado: 'rfcReceptor',
    esRecuperable: false
  },
  'CFDI40102': {
    mensaje: 'El nombre del emisor no coincide con el registrado en el SAT',
    mensajeUsuario: 'El nombre del emisor no coincide con el registro fiscal',
    severidad: 'error',
    accion: 'Use el nombre exacto como aparece en la Constancia de Situación Fiscal',
    campoRelacionado: 'nombreEmisor',
    esRecuperable: true
  },
  'CFDI40103': {
    mensaje: 'El régimen fiscal no corresponde al registrado para el RFC',
    mensajeUsuario: 'El régimen fiscal del emisor es incorrecto',
    severidad: 'error',
    accion: 'Seleccione el régimen fiscal correcto de acuerdo a su situación fiscal',
    campoRelacionado: 'regimenFiscalEmisor',
    esRecuperable: true
  },
  'CFDI40104': {
    mensaje: 'El código postal del lugar de expedición no existe en el catálogo del SAT',
    mensajeUsuario: 'El código postal de expedición no es válido',
    severidad: 'error',
    accion: 'Verifique que el código postal exista en el catálogo SEPOMEX del SAT',
    campoRelacionado: 'lugarExpedicion',
    esRecuperable: true
  },
  'CFDI40999': {
    mensaje: 'Error genérico de estructura XML',
    mensajeUsuario: 'El documento tiene errores de estructura',
    severidad: 'critico',
    accion: 'Revise la estructura completa del XML. Verifique que todos los campos obligatorios estén presentes y tengan el formato correcto',
    documentacion: 'http://omawww.sat.gob.mx/tramitesyservicios/Paginas/anexo_20.htm',
    esRecuperable: true
  },

  // Errores específicos de Carta Porte 3.1
  'CCP301': {
    mensaje: 'El código postal de la ubicación no existe en el catálogo del SAT',
    mensajeUsuario: 'Código postal no válido en una ubicación',
    severidad: 'error',
    accion: 'Verifique que el código postal exista en el catálogo SEPOMEX',
    campoRelacionado: 'ubicaciones.domicilio.codigoPostal',
    esRecuperable: true
  },
  'CCP302': {
    mensaje: 'El estado no corresponde al código postal indicado',
    mensajeUsuario: 'El estado no coincide con el código postal',
    severidad: 'error',
    accion: 'El código postal pertenece a otro estado. Verifique la correlación CP-Estado en el catálogo SAT',
    campoRelacionado: 'ubicaciones.domicilio.estado',
    esRecuperable: true
  },
  'CCP303': {
    mensaje: 'El municipio no corresponde al código postal indicado',
    mensajeUsuario: 'El municipio no coincide con el código postal',
    severidad: 'error',
    accion: 'El código postal pertenece a otro municipio. Verifique la correlación CP-Municipio en el catálogo SAT',
    campoRelacionado: 'ubicaciones.domicilio.municipio',
    esRecuperable: true
  },
  'CCP304': {
    mensaje: 'La localidad no corresponde al código postal indicado',
    mensajeUsuario: 'La localidad no coincide con el código postal',
    severidad: 'advertencia',
    accion: 'Verifique la localidad según el catálogo SEPOMEX',
    campoRelacionado: 'ubicaciones.domicilio.localidad',
    esRecuperable: true
  },
  'CCP305': {
    mensaje: 'La distancia recorrida debe ser mayor a cero para ubicaciones de tipo Destino',
    mensajeUsuario: 'La distancia al destino debe ser mayor a 0',
    severidad: 'error',
    accion: 'Calcule la distancia real entre origen y destino usando el mapa',
    campoRelacionado: 'ubicaciones.distanciaRecorrida',
    esRecuperable: true
  },
  'CCP306': {
    mensaje: 'La fecha de llegada debe ser posterior a la fecha de salida',
    mensajeUsuario: 'Las fechas de viaje son incoherentes',
    severidad: 'error',
    accion: 'Verifique que la fecha de salida del origen sea anterior a la fecha de llegada al destino',
    campoRelacionado: 'ubicaciones.fechaHoraSalidaLlegada',
    esRecuperable: true
  },
  'CCP401': {
    mensaje: 'La clave de producto/servicio no es válida para Carta Porte',
    mensajeUsuario: 'Clave de producto no válida para transporte',
    severidad: 'error',
    accion: 'Use una clave del catálogo de productos permitidos para Carta Porte',
    campoRelacionado: 'mercancias.bienesTransp',
    esRecuperable: true
  },
  'CCP402': {
    mensaje: 'El peso de la mercancía excede la capacidad del vehículo',
    mensajeUsuario: 'El peso total excede la capacidad del vehículo',
    severidad: 'advertencia',
    accion: 'Verifique que el peso de las mercancías no exceda el peso bruto vehicular',
    campoRelacionado: 'mercancias.pesoKg',
    esRecuperable: true
  },
  'CCP501': {
    mensaje: 'La configuración vehicular no existe en el catálogo del SAT',
    mensajeUsuario: 'Configuración vehicular no válida',
    severidad: 'error',
    accion: 'Seleccione una configuración vehicular del catálogo SAT',
    campoRelacionado: 'autotransporte.configVehicular',
    esRecuperable: true
  },
  'CCP502': {
    mensaje: 'El permiso SCT no corresponde al tipo de carga indicado',
    mensajeUsuario: 'Permiso SCT incorrecto para este tipo de transporte',
    severidad: 'error',
    accion: 'Seleccione el tipo de permiso SCT correcto según el servicio',
    campoRelacionado: 'autotransporte.permSct',
    esRecuperable: true
  },
  'CCP601': {
    mensaje: 'El RFC de la figura de transporte no es válido',
    mensajeUsuario: 'RFC del operador/transportista inválido',
    severidad: 'error',
    accion: 'Verifique que el RFC del operador sea correcto',
    campoRelacionado: 'figuras.rfcFigura',
    esRecuperable: true
  },
  'CCP602': {
    mensaje: 'El número de licencia es obligatorio para operadores',
    mensajeUsuario: 'Falta número de licencia del operador',
    severidad: 'error',
    accion: 'Ingrese el número de licencia de conducir del operador',
    campoRelacionado: 'figuras.numLicencia',
    esRecuperable: true
  },

  // Errores de SmartWeb
  'SW001': {
    mensaje: 'Token de autenticación inválido o expirado',
    mensajeUsuario: 'Error de autenticación con el PAC',
    severidad: 'critico',
    accion: 'Contacte al administrador para renovar credenciales del PAC',
    esRecuperable: false
  },
  'SW002': {
    mensaje: 'Créditos de timbrado insuficientes',
    mensajeUsuario: 'No hay timbres disponibles',
    severidad: 'critico',
    accion: 'Adquiera más timbres en su cuenta de SmartWeb',
    esRecuperable: false
  },
  'SW003': {
    mensaje: 'El servicio de timbrado no está disponible temporalmente',
    mensajeUsuario: 'Servicio de timbrado temporalmente no disponible',
    severidad: 'advertencia',
    accion: 'Intente nuevamente en unos minutos. Si persiste, contacte soporte',
    esRecuperable: true
  },
  'SW004': {
    mensaje: 'El XML enviado no cumple con el esquema XSD',
    mensajeUsuario: 'El documento tiene errores de formato',
    severidad: 'error',
    accion: 'Revise que todos los campos obligatorios estén presentes y tengan el formato correcto',
    esRecuperable: true
  },
  'SW005': {
    mensaje: 'Error de comunicación con el SAT',
    mensajeUsuario: 'No se pudo conectar con el SAT',
    severidad: 'advertencia',
    accion: 'El SAT puede estar en mantenimiento. Intente más tarde',
    esRecuperable: true
  }
};

/**
 * Patrones de errores comunes para detección automática
 */
const PATRONES_ERROR = [
  { patron: /RFC.*emisor.*no.*encontr/i, codigo: 'CFDI40100' },
  { patron: /RFC.*receptor.*no.*encontr/i, codigo: 'CFDI40101' },
  { patron: /nombre.*no.*coincide/i, codigo: 'CFDI40102' },
  { patron: /regimen.*fiscal.*incorrecto/i, codigo: 'CFDI40103' },
  { patron: /codigo.*postal.*no.*existe/i, codigo: 'CCP301' },
  { patron: /estado.*no.*corresponde/i, codigo: 'CCP302' },
  { patron: /municipio.*no.*corresponde/i, codigo: 'CCP303' },
  { patron: /distancia.*mayor.*cero/i, codigo: 'CCP305' },
  { patron: /fecha.*llegada.*posterior/i, codigo: 'CCP306' },
  { patron: /clave.*producto.*no.*valida/i, codigo: 'CCP401' },
  { patron: /configuracion.*vehicular.*no.*existe/i, codigo: 'CCP501' },
  { patron: /token.*invalido|autenticacion/i, codigo: 'SW001' },
  { patron: /creditos.*insuficientes|timbres/i, codigo: 'SW002' },
  { patron: /servicio.*no.*disponible/i, codigo: 'SW003' },
  { patron: /XSD|esquema.*xml/i, codigo: 'SW004' }
];

/**
 * Intérprete de errores de SmartWeb y SAT
 */
export class SwErrorInterpreter {
  
  /**
   * Interpretar un código de error
   */
  static interpret(errorCode: string, errorMessage?: string): InterpretedError {
    // Buscar en catálogo por código
    const catalogEntry = CATALOGO_ERRORES_SAT[errorCode.toUpperCase()];
    
    if (catalogEntry) {
      return {
        codigo: errorCode.toUpperCase(),
        ...catalogEntry
      };
    }

    // Si no está en catálogo, intentar detectar por patrón
    if (errorMessage) {
      const detected = this.detectarPorPatron(errorMessage);
      if (detected) {
        return detected;
      }
    }

    // Error desconocido
    return {
      codigo: errorCode || 'UNKNOWN',
      mensaje: errorMessage || 'Error desconocido',
      mensajeUsuario: 'Ha ocurrido un error inesperado',
      severidad: 'error',
      accion: 'Revise los datos ingresados y vuelva a intentar. Si el problema persiste, contacte soporte técnico',
      esRecuperable: true
    };
  }

  /**
   * Interpretar respuesta de error de SmartWeb
   */
  static interpretSwResponse(response: SwErrorResponse): InterpretedError[] {
    const errores: InterpretedError[] = [];

    logger.debug('sw-error', 'Interpretando respuesta SW', {
      status: response.status,
      message: response.message
    });

    // Interpretar código HTTP
    if (response.status === 401) {
      errores.push(this.interpret('SW001'));
    } else if (response.status === 402) {
      errores.push(this.interpret('SW002'));
    } else if (response.status === 503) {
      errores.push(this.interpret('SW003'));
    }

    // Interpretar mensaje
    if (response.message) {
      const errorInterpretado = this.detectarPorPatron(response.message);
      if (errorInterpretado && !errores.some(e => e.codigo === errorInterpretado.codigo)) {
        errores.push(errorInterpretado);
      }
    }

    // Interpretar detalle
    if (response.messageDetail) {
      const detalleInterpretado = this.detectarPorPatron(response.messageDetail);
      if (detalleInterpretado && !errores.some(e => e.codigo === detalleInterpretado.codigo)) {
        errores.push(detalleInterpretado);
      }
    }

    // Si no se detectó nada específico, crear error genérico
    if (errores.length === 0) {
      errores.push({
        codigo: `HTTP_${response.status}`,
        mensaje: response.message || 'Error de comunicación',
        mensajeUsuario: 'Error al procesar la solicitud',
        severidad: response.status >= 500 ? 'critico' : 'error',
        accion: 'Intente nuevamente. Si el problema persiste, contacte soporte',
        esRecuperable: response.status < 500
      });
    }

    return errores;
  }

  /**
   * Detectar error por patrón en el mensaje
   */
  private static detectarPorPatron(mensaje: string): InterpretedError | null {
    for (const { patron, codigo } of PATRONES_ERROR) {
      if (patron.test(mensaje)) {
        return this.interpret(codigo, mensaje);
      }
    }
    return null;
  }

  /**
   * Obtener sugerencias de corrección para un error
   */
  static getSugerencias(error: InterpretedError): string[] {
    const sugerencias: string[] = [error.accion];

    switch (error.codigo) {
      case 'CCP301':
      case 'CCP302':
      case 'CCP303':
        sugerencias.push('Use la búsqueda de código postal para autocompletar estado y municipio');
        sugerencias.push('Verifique en https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/Descarga.aspx');
        break;
      case 'CFDI40100':
      case 'CFDI40101':
        sugerencias.push('Verifique el RFC en https://www.sat.gob.mx/aplicacion/43824/verifica-si-estas-en-la-lista-de-contribuyentes');
        break;
      case 'CCP601':
        sugerencias.push('El RFC debe tener 12 caracteres (moral) o 13 caracteres (física)');
        sugerencias.push('No use el RFC genérico de extranjero (XEXX010101000) para operadores nacionales');
        break;
      case 'SW002':
        sugerencias.push('Contacte a su representante de SmartWeb para adquirir más timbres');
        break;
    }

    return sugerencias;
  }

  /**
   * Obtener errores agrupados por severidad
   */
  static agruparPorSeveridad(errores: InterpretedError[]): {
    criticos: InterpretedError[];
    errores: InterpretedError[];
    advertencias: InterpretedError[];
    info: InterpretedError[];
  } {
    return {
      criticos: errores.filter(e => e.severidad === 'critico'),
      errores: errores.filter(e => e.severidad === 'error'),
      advertencias: errores.filter(e => e.severidad === 'advertencia'),
      info: errores.filter(e => e.severidad === 'info')
    };
  }

  /**
   * Verificar si hay errores críticos que impiden el timbrado
   */
  static tieneErroresCriticos(errores: InterpretedError[]): boolean {
    return errores.some(e => e.severidad === 'critico' && !e.esRecuperable);
  }

  /**
   * Obtener resumen de errores para mostrar al usuario
   */
  static getResumenUsuario(errores: InterpretedError[]): string {
    if (errores.length === 0) {
      return 'Validación exitosa';
    }

    const agrupados = this.agruparPorSeveridad(errores);
    const partes: string[] = [];

    if (agrupados.criticos.length > 0) {
      partes.push(`${agrupados.criticos.length} error(es) crítico(s)`);
    }
    if (agrupados.errores.length > 0) {
      partes.push(`${agrupados.errores.length} error(es)`);
    }
    if (agrupados.advertencias.length > 0) {
      partes.push(`${agrupados.advertencias.length} advertencia(s)`);
    }

    return `Se encontraron: ${partes.join(', ')}`;
  }
}
