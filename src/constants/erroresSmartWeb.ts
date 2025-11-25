/**
 * Catálogo completo de errores SmartWeb PAC
 * Fuente: https://developers.sw.com.mx/knowledge-base/listado-de-codigos-de-errores/
 * 
 * Este catálogo permite proporcionar mensajes descriptivos y soluciones
 * para cada código de error que retorna el PAC SmartWeb
 */

export interface ErrorSmartWeb {
  codigo: string;
  tipo: 'validacion' | 'timbrado' | 'cancelacion' | 'sistema' | 'autenticacion';
  mensaje: string;
  solucion: string;
  critico: boolean;
}

export const ERRORES_SMARTWEB: Record<string, ErrorSmartWeb> = {
  // ==================== ERRORES DE VALIDACIÓN CFDI ====================
  '300': {
    codigo: '300',
    tipo: 'validacion',
    mensaje: 'CFDI40108 - El valor del campo Nombre del nodo Emisor no se encuentra en el listado del SAT',
    solucion: 'Verifica que el nombre del emisor coincida EXACTAMENTE con el registrado en el SAT (incluyendo acentos, mayúsculas y espacios). Revisa tu configuración en la sección "Mi Empresa".',
    critico: true
  },
  '301': {
    codigo: '301',
    tipo: 'validacion',
    mensaje: 'CFDI40139 - El RFC del Receptor no existe en la lista de RFCs inscritos no cancelados del SAT',
    solucion: 'Verifica que el RFC del receptor esté correcto y activo en el SAT. Puedes consultar en: https://www.sat.gob.mx/aplicacion/operacion/31274/consulta-tu-informacion-fiscal',
    critico: true
  },
  '302': {
    codigo: '302',
    tipo: 'validacion',
    mensaje: 'Error en la estructura del XML - Nodo requerido faltante',
    solucion: 'Revisa la estructura del CFDI. Asegúrate de incluir todos los nodos obligatorios según el estándar CFDI 4.0 y Carta Porte 3.1.',
    critico: true
  },
  '303': {
    codigo: '303',
    tipo: 'validacion',
    mensaje: 'CFDI40101 - El campo Régimen Fiscal del Emisor no es válido',
    solucion: 'Verifica que el régimen fiscal sea uno de los válidos del catálogo c_RegimenFiscal del SAT (ej: 601, 603, 612, etc.).',
    critico: true
  },
  '304': {
    codigo: '304',
    tipo: 'validacion',
    mensaje: 'CFDI40171 - El valor del campo UsoCFDI no es válido',
    solucion: 'Para Carta Porte usa "CP01" (Por definir) o "S01" (Sin efectos fiscales). Consulta el catálogo c_UsoCFDI completo.',
    critico: true
  },
  '305': {
    codigo: '305',
    tipo: 'validacion',
    mensaje: 'CartaPorte31 - Se requieren mínimo 2 ubicaciones (Origen y Destino)',
    solucion: 'Asegúrate de incluir al menos una ubicación de Origen y una de Destino en el complemento Carta Porte.',
    critico: true
  },
  '306': {
    codigo: '306',
    tipo: 'validacion',
    mensaje: 'CartaPorte31 - Falta información obligatoria de Autotransporte',
    solucion: 'Verifica que incluyas: PermSCT, NumPermisoSCT, ConfigVehicular, PlacaVM, AnioModeloVM, AseguraRespCivil y PolizaRespCivil.',
    critico: true
  },
  '307': {
    codigo: '307',
    tipo: 'validacion',
    mensaje: 'CartaPorte31 - Se requiere al menos un Operador (TipoFigura = 01)',
    solucion: 'Incluye al menos un operador con su número de licencia en el nodo FiguraTransporte.',
    critico: true
  },
  '308': {
    codigo: '308',
    tipo: 'validacion',
    mensaje: 'CFDI40124 - El formato del código postal no es válido',
    solucion: 'Los códigos postales deben ser de exactamente 5 dígitos. Verifica todos los CPs en emisor, receptor y ubicaciones.',
    critico: true
  },

  // ==================== ERRORES DE CERTIFICADO ====================
  '401': {
    codigo: '401',
    tipo: 'autenticacion',
    mensaje: 'Certificado CSD no válido o expirado',
    solucion: 'Verifica que tu certificado CSD (archivo .cer y .key) esté vigente. Descarga un nuevo certificado desde el SAT si es necesario.',
    critico: true
  },
  '402': {
    codigo: '402',
    tipo: 'autenticacion',
    mensaje: 'La contraseña del certificado es incorrecta',
    solucion: 'Verifica la contraseña de tu certificado CSD. Es la misma que usaste al generarlo en el SAT.',
    critico: true
  },
  '403': {
    codigo: '403',
    tipo: 'autenticacion',
    mensaje: 'Token de autenticación inválido o expirado',
    solucion: 'Regenera tu token de API en el panel de SmartWeb. Los tokens tienen una vigencia limitada.',
    critico: true
  },

  // ==================== ERRORES DE TIMBRADO ====================
  '501': {
    codigo: '501',
    tipo: 'timbrado',
    mensaje: 'No hay timbres disponibles en tu cuenta',
    solucion: 'Recarga timbres en tu cuenta de SmartWeb. Ve a: Panel de control > Comprar timbres.',
    critico: true
  },
  '502': {
    codigo: '502',
    tipo: 'timbrado',
    mensaje: 'El UUID ya fue utilizado previamente (comprobante duplicado)',
    solucion: 'Este CFDI ya fue timbrado. Si necesitas generar uno nuevo, modifica algún dato (folio, fecha, etc.).',
    critico: true
  },
  '503': {
    codigo: '503',
    tipo: 'timbrado',
    mensaje: 'Error de comunicación con el SAT - Servicio temporalmente no disponible',
    solucion: 'Los servicios del SAT están temporalmente fuera de servicio. Intenta nuevamente en unos minutos.',
    critico: false
  },

  // ==================== ERRORES DE CANCELACIÓN ====================
  '601': {
    codigo: '601',
    tipo: 'cancelacion',
    mensaje: 'El UUID no existe o no pertenece al emisor',
    solucion: 'Verifica que el UUID sea correcto y que pertenezca al RFC emisor que estás usando.',
    critico: true
  },
  '602': {
    codigo: '602',
    tipo: 'cancelacion',
    mensaje: 'El motivo de cancelación no es válido',
    solucion: 'Los motivos válidos son: 01 (Comprobante emitido con errores con relación), 02 (Comprobante emitido con errores sin relación), 03 (No se llevó a cabo la operación), 04 (Operación nominativa relacionada en una factura global).',
    critico: true
  },
  '603': {
    codigo: '603',
    tipo: 'cancelacion',
    mensaje: 'Falta UUID de sustitución cuando el motivo es 01',
    solucion: 'Si el motivo de cancelación es "01", debes proporcionar el UUID del comprobante que sustituye al cancelado.',
    critico: true
  },

  // ==================== ERRORES DE SISTEMA ====================
  '701': {
    codigo: '701',
    tipo: 'sistema',
    mensaje: 'Error interno del servidor PAC',
    solucion: 'Error temporal del servidor. Intenta nuevamente en unos momentos. Si persiste, contacta a soporte de SmartWeb.',
    critico: false
  },
  '702': {
    codigo: '702',
    tipo: 'sistema',
    mensaje: 'Timeout - La operación tardó demasiado tiempo',
    solucion: 'La operación excedió el tiempo máximo (30 segundos). Simplifica el CFDI o intenta nuevamente.',
    critico: false
  }
};

/**
 * Obtiene información detallada de un error SmartWeb por código
 * @param codigo - Código de error retornado por SmartWeb
 * @returns Información del error o null si no existe
 */
export function obtenerErrorSmartWeb(codigo: string): ErrorSmartWeb | null {
  return ERRORES_SMARTWEB[codigo] || null;
}

/**
 * Formatea un error de SmartWeb para mostrarlo al usuario de forma clara
 * @param codigoError - Código de error
 * @param mensajeOriginal - Mensaje original del PAC
 * @returns Mensaje formateado con solución
 */
export function formatearErrorParaUsuario(
  codigoError: string, 
  mensajeOriginal: string
): string {
  const error = obtenerErrorSmartWeb(codigoError);
  
  if (error) {
    return `
❌ **Error ${error.codigo}** - ${error.tipo}

**Problema:**
${error.mensaje}

**Cómo solucionarlo:**
${error.solucion}

**Detalle técnico:**
${mensajeOriginal}
    `.trim();
  }
  
  // Si no conocemos el error, retornar el mensaje original
  return `❌ Error desconocido (${codigoError}): ${mensajeOriginal}`;
}

/**
 * Verifica si un error es crítico (bloquea el timbrado)
 * @param codigo - Código de error
 * @returns true si el error es crítico
 */
export function esErrorCritico(codigo: string): boolean {
  const error = obtenerErrorSmartWeb(codigo);
  return error?.critico ?? true; // Por defecto, considerar crítico
}

/**
 * Agrupa errores por tipo
 * @param codigos - Array de códigos de error
 * @returns Errores agrupados por tipo
 */
export function agruparErroresPorTipo(codigos: string[]): Record<string, ErrorSmartWeb[]> {
  const agrupados: Record<string, ErrorSmartWeb[]> = {
    validacion: [],
    timbrado: [],
    cancelacion: [],
    sistema: [],
    autenticacion: []
  };

  codigos.forEach(codigo => {
    const error = obtenerErrorSmartWeb(codigo);
    if (error) {
      agrupados[error.tipo].push(error);
    }
  });

  return agrupados;
}
