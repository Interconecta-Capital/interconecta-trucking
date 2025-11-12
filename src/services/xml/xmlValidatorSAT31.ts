
import { CartaPorteData } from '@/types/cartaPorte';
import { CatalogosSATService } from '@/services/catalogosSAT';

export interface ValidationError31 {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  solution?: string;
}

export interface ValidationResult31 {
  isValid: boolean;
  errors: ValidationError31[];
  warnings: ValidationError31[];
  totalFields: number;
  validFields: number;
  missingFields: string[];
  invalidFields: string[];
  score: number;
}

export class XMLValidatorSAT31 {
  private static catalogos = CatalogosSATService;

  static async validateCompleteCartaPorte(data: CartaPorteData): Promise<ValidationResult31> {
    const errors: ValidationError31[] = [];
    const warnings: ValidationError31[] = [];
    
    console.log('🔍 Iniciando validación SAT 3.1 completa...');

    // Validaciones básicas obligatorias
    await this.validateBasicData(data, errors);
    
    // Validaciones de ubicaciones
    await this.validateUbicaciones(data, errors, warnings);
    
    // Validaciones de mercancías
    await this.validateMercancias(data, errors, warnings);
    
    // Validaciones de autotransporte
    await this.validateAutotransporte(data, errors, warnings);
    
    // Validaciones de figuras
    await this.validateFiguras(data, errors, warnings);
    
    // Validaciones específicas v3.1
    await this.validateVersion31Requirements(data, errors, warnings);

    const totalFields = 50; // Estimado de campos críticos
    const validFields = totalFields - errors.length;
    const score = Math.max(0, (validFields / totalFields) * 100);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalFields,
      validFields,
      missingFields: errors.filter(e => e.code.startsWith('MISSING')).map(e => e.field),
      invalidFields: errors.filter(e => e.code.startsWith('INVALID')).map(e => e.field),
      score: Math.round(score)
    };
  }

  private static async validateBasicData(data: CartaPorteData, errors: ValidationError31[]) {
    // RFC Emisor
    if (!data.rfcEmisor) {
      errors.push({
        field: 'rfcEmisor',
        code: 'MISSING_RFC_EMISOR',
        message: 'RFC del emisor es obligatorio',
        severity: 'error',
        solution: 'Ingrese el RFC del emisor'
      });
    } else if (!this.validateRFC(data.rfcEmisor)) {
      errors.push({
        field: 'rfcEmisor',
        code: 'INVALID_RFC_EMISOR',
        message: 'Formato de RFC del emisor inválido',
        severity: 'error',
        solution: 'Use formato: ABC123456XXX (personas morales) o ABCD123456XXX (personas físicas)'
      });
    }

    // RFC Receptor
    if (!data.rfcReceptor) {
      errors.push({
        field: 'rfcReceptor',
        code: 'MISSING_RFC_RECEPTOR',
        message: 'RFC del receptor es obligatorio',
        severity: 'error'
      });
    } else if (!this.validateRFC(data.rfcReceptor)) {
      errors.push({
        field: 'rfcReceptor',
        code: 'INVALID_RFC_RECEPTOR',
        message: 'Formato de RFC del receptor inválido',
        severity: 'error'
      });
    }

    // Nombres obligatorios
    if (!data.nombreEmisor || data.nombreEmisor.trim().length < 3) {
      errors.push({
        field: 'nombreEmisor',
        code: 'MISSING_NOMBRE_EMISOR',
        message: 'Nombre del emisor es obligatorio (mínimo 3 caracteres)',
        severity: 'error'
      });
    }

    if (!data.nombreReceptor || data.nombreReceptor.trim().length < 3) {
      errors.push({
        field: 'nombreReceptor',
        code: 'MISSING_NOMBRE_RECEPTOR',
        message: 'Nombre del receptor es obligatorio (mínimo 3 caracteres)',
        severity: 'error'
      });
    }
  }

  private static async validateUbicaciones(data: CartaPorteData, errors: ValidationError31[], warnings: ValidationError31[]) {
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errors.push({
        field: 'ubicaciones',
        code: 'MISSING_UBICACIONES',
        message: 'Se requieren mínimo 2 ubicaciones (origen y destino)',
        severity: 'error'
      });
      return;
    }

    const tieneOrigen = data.ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
    const tieneDestino = data.ubicaciones.some(u => u.tipo_ubicacion === 'Destino');

    if (!tieneOrigen) {
      errors.push({
        field: 'ubicaciones',
        code: 'MISSING_ORIGEN',
        message: 'Falta ubicación de origen',
        severity: 'error'
      });
    }

    if (!tieneDestino) {
      errors.push({
        field: 'ubicaciones',
        code: 'MISSING_DESTINO',
        message: 'Falta ubicación de destino',
        severity: 'error'
      });
    }

    // Validar cada ubicación
    data.ubicaciones.forEach((ubicacion, index) => {
      // ✅ FASE 2: Código postal - buscar en ambos formatos (camelCase y snake_case)
      const domicilio = ubicacion.domicilio as any;
      const codigoPostal = domicilio?.codigoPostal || domicilio?.codigo_postal || ubicacion.codigo_postal;
      
      if (!codigoPostal) {
        errors.push({
          field: `ubicaciones[${index}].codigoPostal`,
          code: 'MISSING_CP',
          message: `Código postal obligatorio en ubicación ${index + 1}`,
          severity: 'error'
        });
      } else if (!this.validateCodigoPostal(codigoPostal)) {
        errors.push({
          field: `ubicaciones[${index}].codigoPostal`,
          code: 'INVALID_CP',
          message: `Código postal inválido en ubicación ${index + 1}`,
          severity: 'error'
        });
      }

      // Estado y municipio obligatorios
      if (!ubicacion.domicilio?.estado) {
        errors.push({
          field: `ubicaciones[${index}].estado`,
          code: 'MISSING_ESTADO',
          message: `Estado obligatorio en ubicación ${index + 1}`,
          severity: 'error'
        });
      }

      if (!ubicacion.domicilio?.municipio) {
        errors.push({
          field: `ubicaciones[${index}].municipio`,
          code: 'MISSING_MUNICIPIO',
          message: `Municipio obligatorio en ubicación ${index + 1}`,
          severity: 'error'
        });
      }

      // ✅ FASE 3: Distancia en destino - ahora es WARNING, no error
      if (ubicacion.tipo_ubicacion === 'Destino') {
        const distancia = ubicacion.distancia_recorrida || (ubicacion as any).distanciaRecorrida;
        
        if (!distancia || distancia <= 0) {
          warnings.push({
            field: `ubicaciones[${index}].distanciaRecorrida`,
            code: 'MISSING_DISTANCIA',
            message: 'Se recomienda calcular la distancia usando el mapa',
            severity: 'warning'
          });
        }
      }
    });
  }

  private static async validateMercancias(data: CartaPorteData, errors: ValidationError31[], warnings: ValidationError31[]) {
    if (!data.mercancias || data.mercancias.length === 0) {
      errors.push({
        field: 'mercancias',
        code: 'MISSING_MERCANCIAS',
        message: 'Se requiere al menos una mercancía',
        severity: 'error'
      });
      return;
    }

    data.mercancias.forEach((mercancia, index) => {
      // Clave de producto SAT
      if (!mercancia.bienes_transp) {
        errors.push({
          field: `mercancias[${index}].bienesTransp`,
          code: 'MISSING_CLAVE_SAT',
          message: `Clave SAT obligatoria en mercancía ${index + 1}`,
          severity: 'error'
        });
      }

      // Descripción
      if (!mercancia.descripcion || mercancia.descripcion.trim().length < 5) {
        errors.push({
          field: `mercancias[${index}].descripcion`,
          code: 'MISSING_DESCRIPCION',
          message: `Descripción insuficiente en mercancía ${index + 1}`,
          severity: 'error'
        });
      }

      // Cantidad y peso
      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        errors.push({
          field: `mercancias[${index}].cantidad`,
          code: 'INVALID_CANTIDAD',
          message: `Cantidad inválida en mercancía ${index + 1}`,
          severity: 'error'
        });
      }

      if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
        warnings.push({
          field: `mercancias[${index}].peso`,
          code: 'MISSING_PESO',
          message: `Peso recomendado en mercancía ${index + 1}`,
          severity: 'warning'
        });
      }

      // Clave de unidad
      if (!mercancia.clave_unidad) {
        errors.push({
          field: `mercancias[${index}].claveUnidad`,
          code: 'MISSING_UNIDAD',
          message: `Clave de unidad obligatoria en mercancía ${index + 1}`,
          severity: 'error'
        });
      }
    });
  }

  private static async validateAutotransporte(data: CartaPorteData, errors: ValidationError31[], warnings: ValidationError31[]) {
    if (!data.autotransporte) {
      errors.push({
        field: 'autotransporte',
        code: 'MISSING_AUTOTRANSPORTE',
        message: 'Información de autotransporte obligatoria',
        severity: 'error'
      });
      return;
    }

    const auto = data.autotransporte;

    // Placa obligatoria
    if (!auto.placa_vm) {
      errors.push({
        field: 'autotransporte.placa',
        code: 'MISSING_PLACA',
        message: 'Placa del vehículo obligatoria',
        severity: 'error'
      });
    }

    // Año modelo
    if (!auto.anio_modelo_vm || auto.anio_modelo_vm < 1990 || auto.anio_modelo_vm > new Date().getFullYear() + 1) {
      errors.push({
        field: 'autotransporte.anioModelo',
        code: 'INVALID_ANIO',
        message: 'Año del modelo inválido',
        severity: 'error'
      });
    }

    // Configuración vehicular
    if (!auto.config_vehicular) {
      errors.push({
        field: 'autotransporte.configVehicular',
        code: 'MISSING_CONFIG',
        message: 'Configuración vehicular obligatoria',
        severity: 'error'
      });
    }

    // Seguros
    if (!auto.asegura_resp_civil) {
      warnings.push({
        field: 'autotransporte.seguro',
        code: 'MISSING_SEGURO',
        message: 'Información de seguro recomendada',
        severity: 'warning'
      });
    }
  }

  private static async validateFiguras(data: CartaPorteData, errors: ValidationError31[], warnings: ValidationError31[]) {
    if (!data.figuras || data.figuras.length === 0) {
      errors.push({
        field: 'figuras',
        code: 'MISSING_FIGURAS',
        message: 'Se requiere al menos una figura de transporte',
        severity: 'error'
      });
      return;
    }

    data.figuras.forEach((figura, index) => {
      if (!figura.rfc_figura) {
        errors.push({
          field: `figuras[${index}].rfc`,
          code: 'MISSING_RFC_FIGURA',
          message: `RFC obligatorio en figura ${index + 1}`,
          severity: 'error'
        });
      }

      if (!figura.nombre_figura) {
        errors.push({
          field: `figuras[${index}].nombre`,
          code: 'MISSING_NOMBRE_FIGURA',
          message: `Nombre obligatorio en figura ${index + 1}`,
          severity: 'error'
        });
      }

      // Si es operador, debe tener licencia
      if (figura.tipo_figura === '01' && !figura.num_licencia) {
        errors.push({
          field: `figuras[${index}].licencia`,
          code: 'MISSING_LICENCIA',
          message: `Licencia obligatoria para operador ${index + 1}`,
          severity: 'error'
        });
      }
    });
  }

  private static async validateVersion31Requirements(data: CartaPorteData, errors: ValidationError31[], warnings: ValidationError31[]) {
    // Validaciones específicas de v3.1
    
    // ✅ FASE 5: IdCCP debe ser 32 caracteres (UUID sin guiones) según SAT v3.1
    const idCCP = data.idCCP || data.cartaPorteId;
    if (!idCCP || idCCP.length !== 32) {
      errors.push({
        field: 'idCCP',
        code: 'INVALID_ID_CCP',
        message: 'ID CCP debe tener 32 caracteres (UUID sin guiones)',
        severity: 'error'
      });
    }

    // Verificar peso vs capacidad
    if (data.mercancias && data.autotransporte) {
      const pesoTotal = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
      const capacidad = data.autotransporte.peso_bruto_vehicular || 0;
      
      if (pesoTotal > capacidad && capacidad > 0) {
        warnings.push({
          field: 'mercancias.peso',
          code: 'EXCESO_PESO',
          message: 'Peso total excede capacidad del vehículo',
          severity: 'warning'
        });
      }
    }
  }

  private static validateRFC(rfc: string): boolean {
    // ✅ FASE 5: Validación más permisiva (acepta 1-3 caracteres finales)
    const rfcRegexPermisivo = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{1,3}$/;
    return rfcRegexPermisivo.test(rfc.toUpperCase());
  }

  private static validateCodigoPostal(cp: string): boolean {
    const cpRegex = /^[0-9]{5}$/;
    return cpRegex.test(cp);
  }
}
