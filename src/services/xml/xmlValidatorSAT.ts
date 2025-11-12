
import { CartaPorteData } from '@/types/cartaPorte';

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: ValidationError[];
}

export class XMLValidatorSAT {
  // ✅ FASE 2: Helper para buscar campos en ambos formatos
  private static getFieldValue(obj: any, ...fieldNames: string[]): any {
    for (const fieldName of fieldNames) {
      if (obj?.[fieldName] !== undefined && obj[fieldName] !== null && obj[fieldName] !== '') {
        return obj[fieldName];
      }
    }
    return undefined;
  }

  // Validaciones específicas del SAT para Carta Porte 3.1
  static validateCartaPorteCompliance(data: CartaPorteData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const details: ValidationError[] = [];

    // Validación de datos obligatorios del emisor
    if (!data.rfcEmisor) {
      errors.push('RFC del emisor es obligatorio');
      details.push({
        field: 'rfcEmisor',
        code: 'CP001',
        message: 'El RFC del emisor es obligatorio según el estándar SAT',
        severity: 'error'
      });
    } else if (!this.validarFormatoRFC(data.rfcEmisor)) {
      errors.push('Formato de RFC del emisor inválido');
      details.push({
        field: 'rfcEmisor',
        code: 'CP002',
        message: 'El RFC del emisor no tiene un formato válido',
        severity: 'error'
      });
    }

    if (!data.nombreEmisor || data.nombreEmisor.trim().length < 3) {
      errors.push('Nombre del emisor es obligatorio (mínimo 3 caracteres)');
      details.push({
        field: 'nombreEmisor',
        code: 'CP003',
        message: 'El nombre del emisor debe tener al menos 3 caracteres',
        severity: 'error'
      });
    }

    // Validación de datos obligatorios del receptor
    if (!data.rfcReceptor) {
      errors.push('RFC del receptor es obligatorio');
      details.push({
        field: 'rfcReceptor',
        code: 'CP004',
        message: 'El RFC del receptor es obligatorio según el estándar SAT',
        severity: 'error'
      });
    } else if (!this.validarFormatoRFC(data.rfcReceptor)) {
      errors.push('Formato de RFC del receptor inválido');
      details.push({
        field: 'rfcReceptor',
        code: 'CP005',
        message: 'El RFC del receptor no tiene un formato válido',
        severity: 'error'
      });
    }

    if (!data.nombreReceptor || data.nombreReceptor.trim().length < 3) {
      errors.push('Nombre del receptor es obligatorio (mínimo 3 caracteres)');
      details.push({
        field: 'nombreReceptor',
        code: 'CP006',
        message: 'El nombre del receptor debe tener al menos 3 caracteres',
        severity: 'error'
      });
    }

    // Validación de ubicaciones
    const ubicaciones = data.ubicaciones || [];
    
    console.log('🔍 [VALIDACION] Validando ubicaciones:', {
      total: ubicaciones.length,
      ubicaciones: ubicaciones.map(u => ({
        tipo: this.getFieldValue(u, 'tipo_ubicacion', 'tipoUbicacion'),
        rfc: this.getFieldValue(u, 'rfc', 'rfcRemitenteDestinatario'),
        cp: this.getFieldValue(u.domicilio, 'codigo_postal', 'codigoPostal')
      }))
    });
    
    if (ubicaciones.length < 2) {
      errors.push('Debe especificar al menos una ubicación de origen y una de destino');
      details.push({
        field: 'ubicaciones',
        code: 'CP007',
        message: 'Se requieren mínimo 2 ubicaciones: origen y destino',
        severity: 'error'
      });
    } else {
      // ✅ FASE 2: Buscar en ambos formatos
      const tieneOrigen = ubicaciones.some(u => {
        const tipo = this.getFieldValue(u, 'tipo_ubicacion', 'tipoUbicacion');
        return tipo === 'Origen';
      });
      
      const tieneDestino = ubicaciones.some(u => {
        const tipo = this.getFieldValue(u, 'tipo_ubicacion', 'tipoUbicacion');
        return tipo === 'Destino';
      });
      
      if (!tieneOrigen) {
        errors.push('Debe especificar al menos una ubicación de origen');
        details.push({
          field: 'ubicaciones',
          code: 'CP008',
          message: 'Falta ubicación de origen',
          severity: 'error'
        });
      }
      
      if (!tieneDestino) {
        errors.push('Debe especificar al menos una ubicación de destino');
        details.push({
          field: 'ubicaciones',
          code: 'CP009',
          message: 'Falta ubicación de destino',
          severity: 'error'
        });
      }

      // Validar códigos postales - ✅ FASE 2: Buscar en ambos formatos
      ubicaciones.forEach((ub, index) => {
        const codigoPostal = this.getFieldValue(ub.domicilio, 'codigo_postal', 'codigoPostal');
        if (!codigoPostal || !this.validarCodigoPostal(codigoPostal)) {
          warnings.push(`Código postal inválido en ubicación ${index + 1}`);
          details.push({
            field: `ubicaciones[${index}].codigoPostal`,
            code: 'CP010',
            message: 'Código postal debe tener 5 dígitos',
            severity: 'warning'
          });
        }
      });
    }

    // Validación de mercancías
    const mercancias = data.mercancias || [];
    if (mercancias.length === 0) {
      errors.push('Debe especificar al menos una mercancía');
      details.push({
        field: 'mercancias',
        code: 'CP011',
        message: 'Se requiere al menos una mercancía para el transporte',
        severity: 'error'
      });
    } else {
      mercancias.forEach((merc, index) => {
        if (!merc.bienes_transp || merc.bienes_transp.trim().length === 0) {
          errors.push(`Descripción de mercancía ${index + 1} es obligatoria`);
          details.push({
            field: `mercancias[${index}].bienesTransp`,
            code: 'CP012',
            message: 'La descripción de la mercancía es obligatoria',
            severity: 'error'
          });
        }

        if (!merc.cantidad || merc.cantidad <= 0) {
          errors.push(`Cantidad de mercancía ${index + 1} debe ser mayor a 0`);
          details.push({
            field: `mercancias[${index}].cantidad`,
            code: 'CP013',
            message: 'La cantidad debe ser un número positivo',
            severity: 'error'
          });
        }

        if (!merc.peso_kg || merc.peso_kg <= 0) {
          warnings.push(`Peso de mercancía ${index + 1} debe ser mayor a 0`);
          details.push({
            field: `mercancias[${index}].peso`,
            code: 'CP014',
            message: 'Se recomienda especificar el peso de la mercancía',
            severity: 'warning'
          });
        }
      });
    }

    // Validación de autotransporte
    if (!data.autotransporte) {
      errors.push('Información de autotransporte es obligatoria');
      details.push({
        field: 'autotransporte',
        code: 'CP015',
        message: 'Debe especificar la información del vehículo de transporte',
        severity: 'error'
      });
    } else {
      if (!data.autotransporte.placa_vm || data.autotransporte.placa_vm.trim().length === 0) {
        errors.push('Placa del vehículo es obligatoria');
        details.push({
          field: 'autotransporte.placa',
          code: 'CP016',
          message: 'La placa del vehículo es obligatoria',
          severity: 'error'
        });
      }

      if (!data.autotransporte.config_vehicular) {
        errors.push('Configuración vehicular es obligatoria');
        details.push({
          field: 'autotransporte.configuracion',
          code: 'CP017',
          message: 'Debe especificar la configuración vehicular',
          severity: 'error'
        });
      }

      if (!data.autotransporte.asegura_resp_civil) {
        warnings.push('Se recomienda especificar la aseguradora de responsabilidad civil');
        details.push({
          field: 'autotransporte.seguro',
          code: 'CP018',
          message: 'Se recomienda especificar información del seguro',
          severity: 'warning'
        });
      }
    }

    // Validación de figuras de transporte
    const figuras = data.figuras || [];
    if (figuras.length === 0) {
      errors.push('Debe especificar al menos una figura de transporte');
      details.push({
        field: 'figuras',
        code: 'CP019',
        message: 'Se requiere al menos una figura de transporte (operador, propietario, etc.)',
        severity: 'error'
      });
    } else {
      figuras.forEach((fig, index) => {
        if (!fig.rfc_figura || !this.validarFormatoRFC(fig.rfc_figura)) {
          errors.push(`RFC de figura ${index + 1} es inválido`);
          details.push({
            field: `figuras[${index}].rfc`,
            code: 'CP020',
            message: 'El RFC de la figura de transporte es inválido',
            severity: 'error'
          });
        }

        if (!fig.nombre_figura || fig.nombre_figura.trim().length < 3) {
          errors.push(`Nombre de figura ${index + 1} es muy corto`);
          details.push({
            field: `figuras[${index}].nombre`,
            code: 'CP021',
            message: 'El nombre de la figura debe tener al menos 3 caracteres',
            severity: 'error'
          });
        }
      });
    }

    // Validaciones específicas de versión 3.1
    if (data.cartaPorteVersion === '3.1') {
      if (data.transporteInternacional === 'Sí' || data.transporteInternacional === true) {
        if (!data.pais_origen_destino) {
          warnings.push('Para transporte internacional se recomienda especificar país de origen/destino');
          details.push({
            field: 'paisOrigenDestino',
            code: 'CP022',
            message: 'Especificar país para transporte internacional',
            severity: 'warning'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details
    };
  }

  static validateXMLStructure(xmlString: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const details: ValidationError[] = [];

    try {
      // Validaciones básicas de estructura XML
      if (!xmlString || xmlString.trim().length === 0) {
        errors.push('XML vacío o nulo');
        return { isValid: false, errors, warnings, details };
      }

      // Validar que sea XML bien formado
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        errors.push('XML mal formado - errores de sintaxis');
        details.push({
          field: 'xml',
          code: 'XML001',
          message: 'El XML contiene errores de sintaxis',
          severity: 'error'
        });
      }

      // Validar namespace de Carta Porte
      const root = xmlDoc.documentElement;
      if (!root.getAttribute('xmlns:cartaporte')) {
        warnings.push('Falta namespace de CartaPorte');
        details.push({
          field: 'xml.namespace',
          code: 'XML002',
          message: 'Se recomienda incluir el namespace de CartaPorte',
          severity: 'warning'
        });
      }

      // Validar versión
      const cartaPorteElement = xmlDoc.getElementsByTagName('cartaporte:CartaPorte')[0];
      if (cartaPorteElement) {
        const version = cartaPorteElement.getAttribute('Version');
        if (!version || (version !== '3.0' && version !== '3.1')) {
          warnings.push('Versión de CartaPorte no es la más reciente');
          details.push({
            field: 'xml.version',
            code: 'XML003',
            message: 'Se recomienda usar la versión más reciente del complemento',
            severity: 'warning'
          });
        }
      }

    } catch (error) {
      errors.push(`Error procesando XML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      details.push({
        field: 'xml',
        code: 'XML004',
        message: 'Error crítico procesando la estructura XML',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details
    };
  }

  private static validarFormatoRFC(rfc: string): boolean {
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc.toUpperCase());
  }

  private static validarCodigoPostal(cp: string): boolean {
    const cpRegex = /^[0-9]{5}$/;
    return cpRegex.test(cp);
  }
}
