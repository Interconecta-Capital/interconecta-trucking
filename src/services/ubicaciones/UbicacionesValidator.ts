/**
 * FASE 5: Validador Completo de Ubicaciones según SAT v3.1
 * Valida que las ubicaciones cumplan con todos los requisitos del complemento Carta Porte
 */

import { UbicacionCompleta } from '@/types/cartaPorte';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface UbicacionesValidationResult {
  valido: boolean;
  errores: ValidationError[];
  warnings: ValidationError[];
}

export class UbicacionesValidator {
  /**
   * Validar todas las ubicaciones de una Carta Porte
   */
  static validarUbicaciones(ubicaciones: UbicacionCompleta[]): UbicacionesValidationResult {
    const errores: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validación 1: Debe haber al menos 2 ubicaciones (Origen y Destino)
    if (!ubicaciones || ubicaciones.length < 2) {
      errores.push({
        field: 'ubicaciones',
        message: 'Se requieren al menos 2 ubicaciones: Origen y Destino',
        severity: 'error'
      });
      return { valido: false, errores, warnings };
    }

    // Validación 2: Debe existir al menos un origen
    const origen = ubicaciones.find(u => u.tipo_ubicacion === 'Origen');
    if (!origen) {
      errores.push({
        field: 'ubicaciones.origen',
        message: 'Falta ubicación de Origen',
        severity: 'error'
      });
    }

    // Validación 3: Debe existir al menos un destino
    const destino = ubicaciones.find(u => u.tipo_ubicacion === 'Destino');
    if (!destino) {
      errores.push({
        field: 'ubicaciones.destino',
        message: 'Falta ubicación de Destino',
        severity: 'error'
      });
    }

    // Validación 4: Validar cada ubicación individualmente
    ubicaciones.forEach((ubicacion, index) => {
      this.validarUbicacionIndividual(ubicacion, index, errores, warnings);
    });

    // Validación 5: El destino debe tener distancia recorrida
    if (destino && !destino.distancia_recorrida) {
      errores.push({
        field: 'ubicaciones.destino.distancia_recorrida',
        message: 'La ubicación de Destino debe tener distancia recorrida en kilómetros',
        severity: 'error'
      });
    }

    return {
      valido: errores.length === 0,
      errores,
      warnings
    };
  }

  /**
   * Validar una ubicación individual
   */
  private static validarUbicacionIndividual(
    ubicacion: UbicacionCompleta,
    index: number,
    errores: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const prefix = `ubicaciones[${index}]`;

    // Validar ID Ubicación
    if (!ubicacion.id_ubicacion) {
      errores.push({
        field: `${prefix}.id_ubicacion`,
        message: `Ubicación ${index + 1} (${ubicacion.tipo_ubicacion}): Falta ID de ubicación`,
        severity: 'error'
      });
    }

    // Validar Tipo de Ubicación
    if (!ubicacion.tipo_ubicacion || !['Origen', 'Destino'].includes(ubicacion.tipo_ubicacion)) {
      errores.push({
        field: `${prefix}.tipo_ubicacion`,
        message: `Ubicación ${index + 1}: Tipo de ubicación inválido (debe ser 'Origen' o 'Destino')`,
        severity: 'error'
      });
    }

    // Validar RFC
    if (!ubicacion.rfc_remitente_destinatario) {
      errores.push({
        field: `${prefix}.rfc_remitente_destinatario`,
        message: `Ubicación ${index + 1} (${ubicacion.tipo_ubicacion}): Falta RFC del remitente/destinatario`,
        severity: 'error'
      });
    } else if (!this.validarFormatoRFC(ubicacion.rfc_remitente_destinatario)) {
      errores.push({
        field: `${prefix}.rfc_remitente_destinatario`,
        message: `Ubicación ${index + 1} (${ubicacion.tipo_ubicacion}): RFC inválido '${ubicacion.rfc_remitente_destinatario}'`,
        severity: 'error'
      });
    }

    // Validar Nombre
    if (!ubicacion.nombre_remitente_destinatario) {
      errores.push({
        field: `${prefix}.nombre_remitente_destinatario`,
        message: `Ubicación ${index + 1} (${ubicacion.tipo_ubicacion}): Falta nombre del remitente/destinatario`,
        severity: 'error'
      });
    }

    // Validar Fecha/Hora
    if (!ubicacion.fecha_llegada_salida) {
      errores.push({
        field: `${prefix}.fecha_llegada_salida`,
        message: `Ubicación ${index + 1} (${ubicacion.tipo_ubicacion}): Falta fecha/hora de salida o llegada`,
        severity: 'error'
      });
    }

    // Validar Domicilio
    if (!ubicacion.domicilio) {
      errores.push({
        field: `${prefix}.domicilio`,
        message: `Ubicación ${index + 1} (${ubicacion.tipo_ubicacion}): Falta información del domicilio`,
        severity: 'error'
      });
    } else {
      this.validarDomicilio(ubicacion.domicilio, index, ubicacion.tipo_ubicacion || '', prefix, errores, warnings);
    }
  }

  /**
   * Validar domicilio de una ubicación
   */
  private static validarDomicilio(
    domicilio: any,
    index: number,
    tipo: string,
    prefix: string,
    errores: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Código Postal (OBLIGATORIO)
    if (!domicilio.codigo_postal) {
      errores.push({
        field: `${prefix}.domicilio.codigo_postal`,
        message: `Ubicación ${index + 1} (${tipo}): Código postal es OBLIGATORIO`,
        severity: 'error'
      });
    } else if (!this.validarCodigoPostal(domicilio.codigo_postal)) {
      errores.push({
        field: `${prefix}.domicilio.codigo_postal`,
        message: `Ubicación ${index + 1} (${tipo}): Código postal inválido '${domicilio.codigo_postal}' (debe ser 5 dígitos)`,
        severity: 'error'
      });
    }

    // Estado (OBLIGATORIO)
    if (!domicilio.estado) {
      errores.push({
        field: `${prefix}.domicilio.estado`,
        message: `Ubicación ${index + 1} (${tipo}): Estado es obligatorio`,
        severity: 'error'
      });
    }

    // País (OBLIGATORIO - por defecto MEX)
    if (!domicilio.pais) {
      warnings.push({
        field: `${prefix}.domicilio.pais`,
        message: `Ubicación ${index + 1} (${tipo}): País no especificado, se asumirá 'MEX'`,
        severity: 'warning'
      });
    }

    // Calle (Recomendado)
    if (!domicilio.calle) {
      warnings.push({
        field: `${prefix}.domicilio.calle`,
        message: `Ubicación ${index + 1} (${tipo}): Se recomienda especificar la calle`,
        severity: 'warning'
      });
    }

    // Municipio (Recomendado)
    if (!domicilio.municipio) {
      warnings.push({
        field: `${prefix}.domicilio.municipio`,
        message: `Ubicación ${index + 1} (${tipo}): Se recomienda especificar el municipio`,
        severity: 'warning'
      });
    }
  }

  /**
   * Validar formato de RFC
   */
  private static validarFormatoRFC(rfc: string): boolean {
    if (!rfc) return false;
    
    // RFC Persona Física: 13 caracteres (AAAA######XXX)
    // RFC Persona Moral: 12 caracteres (AAA######XXX)
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
    
    return rfcRegex.test(rfc.toUpperCase());
  }

  /**
   * Validar formato de código postal mexicano
   */
  private static validarCodigoPostal(cp: string): boolean {
    if (!cp) return false;
    
    // Código postal mexicano: 5 dígitos
    const cpRegex = /^\d{5}$/;
    
    return cpRegex.test(cp);
  }

  /**
   * Obtener resumen de validación en texto legible
   */
  static obtenerResumenValidacion(resultado: UbicacionesValidationResult): string {
    if (resultado.valido) {
      return '✅ Todas las ubicaciones son válidas';
    }

    const erroresTexto = resultado.errores.map(e => `❌ ${e.message}`).join('\n');
    const warningsTexto = resultado.warnings.length > 0 
      ? '\n\n' + resultado.warnings.map(w => `⚠️ ${w.message}`).join('\n')
      : '';

    return `Errores encontrados:\n${erroresTexto}${warningsTexto}`;
  }
}
