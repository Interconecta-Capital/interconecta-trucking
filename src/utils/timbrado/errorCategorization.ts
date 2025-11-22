// 🔐 ISO 27001 A.16.1 - Gestión de incidentes de seguridad de la información
// Categorización de errores de timbrado para feedback al usuario

export interface CategorizedError {
  type: 'user_editable' | 'system_error' | 'validation_error' | 'connection_error' | 'authorization_error';
  title: string;
  message: string;
  userActionable: boolean;
  suggestedActions: string[];
  technicalDetails?: string;
}

/**
 * Categoriza errores de timbrado y proporciona mensajes útiles al usuario
 */
export function categorizeError(error: any): CategorizedError {
  const errorMessage = error?.message || error?.error || String(error);
  const errorName = error?.name || '';

  // 1. Errores de conexión/red
  if (
    errorName === 'FunctionsFetchError' ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('net::ERR_FAILED')
  ) {
    return {
      type: 'connection_error',
      title: 'Error de Conexión',
      message: 'No se pudo conectar con el servicio de timbrado. Por favor verifica tu conexión a internet.',
      userActionable: true,
      suggestedActions: [
        'Verifica tu conexión a internet',
        'Recarga la página e intenta nuevamente',
        'Si el problema persiste, contacta a soporte'
      ],
      technicalDetails: errorMessage
    };
  }

  // 2. Errores de autorización
  if (
    errorMessage.includes('No autorizado') ||
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized')
  ) {
    return {
      type: 'authorization_error',
      title: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      userActionable: true,
      suggestedActions: [
        'Cierra sesión e inicia sesión nuevamente',
        'Verifica que tengas permisos para timbrar documentos'
      ],
      technicalDetails: errorMessage
    };
  }

  // 3. Errores de validación del SAT (CFDI40xxx)
  if (
    errorMessage.includes('CFDI40') ||
    errorMessage.includes('c_RegimenFiscal') ||
    errorMessage.includes('c_UsoCFDI') ||
    errorMessage.includes('catálogo') ||
    errorMessage.includes('no contiene un valor')
  ) {
    return {
      type: 'validation_error',
      title: 'Error de Validación del SAT',
      message: 'El SAT rechazó el documento porque algunos campos no cumplen con los catálogos oficiales.',
      userActionable: true,
      suggestedActions: [
        'Verifica que el Régimen Fiscal del receptor esté correctamente configurado en el cliente',
        'Asegúrate de que el Uso de CFDI sea válido',
        'Revisa que todos los datos fiscales estén completos',
        'Edita el cliente/receptor para agregar la información faltante'
      ],
      technicalDetails: errorMessage
    };
  }

  // 4. Errores de validación de datos
  if (
    errorMessage.includes('Se requieren') ||
    errorMessage.includes('Debe proporcionar') ||
    errorMessage.includes('Formato inválido') ||
    errorMessage.includes('RFC inválido') ||
    errorMessage.includes('validationErrors')
  ) {
    return {
      type: 'validation_error',
      title: 'Datos Incompletos o Inválidos',
      message: 'Algunos campos requeridos están incompletos o tienen formato inválido.',
      userActionable: true,
      suggestedActions: [
        'Revisa que todos los campos requeridos estén completos',
        'Verifica que los RFCs sean válidos (12-13 caracteres)',
        'Asegúrate de tener al menos 2 ubicaciones (origen y destino)',
        'Verifica que el certificado CSD esté vigente'
      ],
      technicalDetails: errorMessage
    };
  }

  // 5. Errores de PAC (Proveedor de Certificación)
  if (
    errorMessage.includes('PAC') ||
    errorMessage.includes('SW') ||
    errorMessage.includes('Conectia') ||
    errorMessage.includes('301') || // Error común del PAC
    errorMessage.includes('302') ||
    errorMessage.includes('certificado')
  ) {
    return {
      type: 'user_editable',
      title: 'Error en Certificación Fiscal',
      message: 'Hubo un problema al certificar el documento con el PAC.',
      userActionable: true,
      suggestedActions: [
        'Verifica que tu certificado CSD esté vigente y cargado correctamente',
        'Revisa que la contraseña del certificado sea correcta',
        'Asegúrate de que el certificado pertenezca al RFC emisor',
        'Contacta a soporte si el certificado es válido'
      ],
      technicalDetails: errorMessage
    };
  }

  // 6. Errores de datos de ubicaciones
  if (
    errorMessage.includes('ubicaciones') ||
    errorMessage.includes('origen') ||
    errorMessage.includes('destino')
  ) {
    return {
      type: 'user_editable',
      title: 'Ubicaciones Incompletas',
      message: 'Las ubicaciones de origen y destino no están completas.',
      userActionable: true,
      suggestedActions: [
        'Ve a la sección de Ubicaciones del viaje',
        'Asegúrate de tener al menos origen y destino definidos',
        'Verifica que cada ubicación tenga dirección completa',
        'Guarda los cambios antes de intentar timbrar'
      ],
      technicalDetails: errorMessage
    };
  }

  // 7. Errores de mercancías
  if (
    errorMessage.includes('mercancía') ||
    errorMessage.includes('conceptos') ||
    errorMessage.includes('producto')
  ) {
    return {
      type: 'user_editable',
      title: 'Información de Mercancías Incompleta',
      message: 'La información de las mercancías o conceptos está incompleta.',
      userActionable: true,
      suggestedActions: [
        'Ve a la sección de Mercancías del viaje',
        'Asegúrate de tener al menos una mercancía definida',
        'Verifica que la mercancía tenga descripción, peso y valor',
        'Guarda los cambios antes de intentar timbrar'
      ],
      technicalDetails: errorMessage
    };
  }

  // 8. Errores de CORS (problemas de servidor/configuración)
  if (
    errorMessage.includes('CORS') ||
    errorMessage.includes('Access-Control-Allow-Origin')
  ) {
    return {
      type: 'system_error',
      title: 'Error del Sistema',
      message: 'Hay un problema temporal con el servicio. Estamos trabajando en resolverlo.',
      userActionable: false,
      suggestedActions: [
        'Espera unos minutos e intenta nuevamente',
        'Si el problema persiste, contacta a soporte técnico'
      ],
      technicalDetails: 'Error de configuración CORS del servidor'
    };
  }

  // 9. Errores genéricos del sistema
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('Internal Server Error') ||
    errorMessage.includes('ReferenceError') ||
    errorMessage.includes('TypeError')
  ) {
    return {
      type: 'system_error',
      title: 'Error Interno del Sistema',
      message: 'Ocurrió un error inesperado en el servidor. Nuestro equipo ha sido notificado.',
      userActionable: false,
      suggestedActions: [
        'Intenta nuevamente en unos minutos',
        'Si el error persiste, contacta a soporte con el código de error'
      ],
      technicalDetails: errorMessage
    };
  }

  // 10. Error genérico (fallback)
  return {
    type: 'system_error',
    title: 'Error Desconocido',
    message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    userActionable: true,
    suggestedActions: [
      'Revisa que todos los datos del documento estén completos',
      'Intenta timbrar nuevamente',
      'Si el error persiste, contacta a soporte'
    ],
    technicalDetails: errorMessage
  };
}

/**
 * Formatea un error categorizado para mostrar al usuario
 */
export function formatErrorForUser(categorizedError: CategorizedError): string {
  const { title, message, suggestedActions } = categorizedError;
  
  let formatted = `**${title}**\n\n${message}`;
  
  if (suggestedActions.length > 0) {
    formatted += '\n\n**Qué puedes hacer:**\n';
    suggestedActions.forEach((action, index) => {
      formatted += `${index + 1}. ${action}\n`;
    });
  }
  
  return formatted;
}

/**
 * Determina el ícono apropiado según el tipo de error
 */
export function getErrorIcon(errorType: CategorizedError['type']): string {
  switch (errorType) {
    case 'user_editable':
    case 'validation_error':
      return '📝';
    case 'connection_error':
      return '🌐';
    case 'authorization_error':
      return '🔒';
    case 'system_error':
      return '⚠️';
    default:
      return '❌';
  }
}
