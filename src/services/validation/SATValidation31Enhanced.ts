
import { CatalogosSATService } from "@/services/catalogosSAT";

export interface CartaPorte31Data {
  version?: string;
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  transporteInternacional: boolean | string;
  registroIstmo: boolean;
  ubicaciones: any[];
  mercancias: any[];
  autotransporte: any;
  figuras: any[];
  tipoCfdi?: string;
}

export interface ValidationSAT31Result {
  isValid: boolean;
  message: string;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  complianceScore: number;
  criticalIssues: string[];
  version31Specific: string[];
}

export class SATValidation31Enhanced {
  
  // Validación completa para Carta Porte 3.1
  static async validateCompleteCartaPorte31(data: CartaPorte31Data): Promise<ValidationSAT31Result> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    const version31Specific: string[] = [];

    // Validar versión 3.1
    if (!data.version || data.version !== '3.1') {
      criticalIssues.push('Debe especificar versión 3.1 del Complemento Carta Porte (obligatorio desde 17 julio 2024)');
    }

    // Validaciones de RFC mejoradas
    const rfcEmisorValidation = this.validarRFCCompleto(data.rfcEmisor, 'Emisor');
    if (!rfcEmisorValidation.isValid) {
      errors.push(...rfcEmisorValidation.errors);
    }

    const rfcReceptorValidation = this.validarRFCCompleto(data.rfcReceptor, 'Receptor');
    if (!rfcReceptorValidation.isValid) {
      errors.push(...rfcReceptorValidation.errors);
    }

    // Validar tipo de CFDI según la guía
    if (data.tipoCfdi === 'Traslado') {
      if (data.rfcEmisor === data.rfcReceptor) {
        recommendations.push('CFDI de Traslado: Emisor y receptor son el mismo (traslado propio)');
      } else {
        warnings.push('CFDI de Traslado con RFC diferentes: Verificar que sea correcto');
      }
      version31Specific.push('Tipo Traslado: Valor unitario debe ser $0.00, Objeto Imp: 01 - No objeto de impuesto');
    }

    // Validaciones de ubicaciones mejoradas
    const ubicacionesValidation = this.validarUbicaciones31(data.ubicaciones);
    errors.push(...ubicacionesValidation.errors);
    warnings.push(...ubicacionesValidation.warnings);
    recommendations.push(...ubicacionesValidation.recommendations);

    // Validaciones de mercancías específicas para fauna silvestre
    const mercanciasValidation = this.validarMercancias31(data.mercancias);
    errors.push(...mercanciasValidation.errors);
    warnings.push(...mercanciasValidation.warnings);
    recommendations.push(...mercanciasValidation.recommendations);
    version31Specific.push(...mercanciasValidation.version31Features);

    // Validaciones de autotransporte
    const autotransporteValidation = this.validarAutotransporte31(data.autotransporte);
    errors.push(...autotransporteValidation.errors);
    warnings.push(...autotransporteValidation.warnings);

    // Validaciones de figuras
    const figurasValidation = this.validarFiguras31(data.figuras);
    errors.push(...figurasValidation.errors);
    warnings.push(...figurasValidation.warnings);

    // Validaciones específicas v3.1
    version31Specific.push(
      'IdCCP debe tener 36 caracteres según RFC 4122',
      'Código QR actualizado para versión 3.1',
      'Nodo RegimenesAduaneros permite hasta 10 regímenes'
    );

    // Calcular score de cumplimiento
    const totalChecks = 20;
    const failedChecks = errors.length + criticalIssues.length + (warnings.length * 0.5);
    const complianceScore = Math.max(0, Math.round(((totalChecks - failedChecks) / totalChecks) * 100));

    const isValid = errors.length === 0 && criticalIssues.length === 0;

    return {
      isValid,
      message: isValid ? 'Carta Porte 3.1 válida' : 'Se encontraron errores de validación',
      errors,
      warnings,
      recommendations,
      complianceScore,
      criticalIssues,
      version31Specific
    };
  }

  private static validarRFCCompleto(rfc: string, tipo: string) {
    const errors: string[] = [];
    
    if (!rfc) {
      errors.push(`RFC ${tipo} es requerido`);
      return { isValid: false, errors };
    }

    // RFC genérico no permitido para Carta Porte
    if (rfc === 'XAXX010101000') {
      errors.push(`RFC genérico XAXX010101000 no es válido para Carta Porte. Debe ser RFC específico del ${tipo.toLowerCase()}`);
    }

    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(rfc)) {
      errors.push(`Formato de RFC ${tipo} inválido: ${rfc}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  private static validarUbicaciones31(ubicaciones: any[]) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (!ubicaciones || ubicaciones.length < 2) {
      errors.push('Debe incluir al menos ubicación de Origen y Destino');
      return { errors, warnings, recommendations };
    }

    const tieneOrigen = ubicaciones.some(u => u.tipoUbicacion === 'Origen');
    const tieneDestino = ubicaciones.some(u => u.tipoUbicacion === 'Destino');

    if (!tieneOrigen) {
      errors.push('Falta ubicación de Origen');
    }

    if (!tieneDestino) {
      errors.push('Falta ubicación de Destino');
    }

    ubicaciones.forEach((ubicacion, index) => {
      // Validar ID de ubicación según v3.1
      if (ubicacion.tipoUbicacion === 'Origen' && ubicacion.idUbicacion) {
        if (!ubicacion.idUbicacion.match(/^OR\d{6}$/)) {
          warnings.push(`ID Ubicación Origen debe formato OR######: ${ubicacion.idUbicacion}`);
        }
      }

      if (ubicacion.tipoUbicacion === 'Destino' && ubicacion.idUbicacion) {
        if (!ubicacion.idUbicacion.match(/^DE\d{6}$/)) {
          warnings.push(`ID Ubicación Destino debe formato DE######: ${ubicacion.idUbicacion}`);
        }
      }

      // Validar domicilio completo
      const domicilio = ubicacion.domicilio;
      if (!domicilio) {
        errors.push(`Ubicación ${index + 1}: Falta domicilio completo`);
      } else {
        if (!domicilio.calle || domicilio.calle.includes('undefined')) {
          errors.push(`Ubicación ${index + 1}: Calle es requerida y no puede contener 'undefined'`);
        }
        if (!domicilio.codigoPostal || domicilio.codigoPostal.includes('undefined')) {
          errors.push(`Ubicación ${index + 1}: Código postal válido es requerido`);
        }
        if (!domicilio.municipio) {
          errors.push(`Ubicación ${index + 1}: Municipio es requerido`);
        }
        if (!domicilio.estado) {
          errors.push(`Ubicación ${index + 1}: Estado es requerido`);
        }
      }

      // Validar distancia para destino
      if (ubicacion.tipoUbicacion === 'Destino' && !ubicacion.distanciaRecorrida) {
        errors.push('Ubicación Destino: Campo DistanciaRecorrida es obligatorio');
      }

      // Validar fechas y horas
      if (ubicacion.tipoUbicacion === 'Origen' && !ubicacion.fechaHoraSalidaLlegada) {
        errors.push('Ubicación Origen: FechaHoraSalida es obligatoria (formato AAAA-MM-DDTHH:MM:SS)');
      }

      if (ubicacion.tipoUbicacion === 'Destino' && !ubicacion.fechaHoraSalidaLlegada) {
        warnings.push('Ubicación Destino: Recomendable incluir FechaHoraProgLlegada');
      }
    });

    return { errors, warnings, recommendations };
  }

  private static validarMercancias31(mercancias: any[]) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const version31Features: string[] = [];

    if (!mercancias || mercancias.length === 0) {
      errors.push('Debe incluir al menos una mercancía');
      return { errors, warnings, recommendations, version31Features };
    }

    mercancias.forEach((mercancia, index) => {
      // Validar BienesTransp para animales vivos
      if (!mercancia.bienesTransp) {
        errors.push(`Mercancía ${index + 1}: Campo BienesTransp es obligatorio`);
      } else if (mercancia.bienesTransp === '10101500') {
        errors.push(`Mercancía ${index + 1}: Clave 10101500 es incorrecta. Use 01010101 para animales vivos`);
      }

      // Validación específica para fauna silvestre
      if (mercancia.descripcion) {
        const descripcion = mercancia.descripcion.toLowerCase();
        
        if (descripcion.includes('jaguar') || descripcion.includes('fauna') || descripcion.includes('animal')) {
          if (!descripcion.includes('semarnat') && !descripcion.includes('autorización')) {
            errors.push(`Mercancía ${index + 1}: Fauna silvestre debe incluir número de Autorización SEMARNAT en descripción`);
          }
          
          if (!descripcion.includes('panthera onca') && descripcion.includes('jaguar')) {
            recommendations.push(`Mercancía ${index + 1}: Incluir nombre científico "Panthera onca" para mayor precisión`);
          }

          if (!descripcion.includes('microchip') && !descripcion.includes('identificador')) {
            warnings.push(`Mercancía ${index + 1}: Recomendable incluir número de microchip o identificador único`);
          }

          version31Features.push('Mercancía de fauna silvestre requiere documentación SEMARNAT completa');
        }

        if (descripcion === 'jaguares' || descripcion.length < 10) {
          errors.push(`Mercancía ${index + 1}: Descripción demasiado genérica. Debe ser detallada según normativa SAT y SEMARNAT`);
        }
      } else {
        errors.push(`Mercancía ${index + 1}: Descripción es obligatoria`);
      }

      // Validar peso obligatorio
      if (!mercancia.pesoEnKg || mercancia.pesoEnKg <= 0) {
        errors.push(`Mercancía ${index + 1}: PesoEnKg es obligatorio y debe ser mayor a 0`);
      }

      // Validar cantidad y unidad
      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        errors.push(`Mercancía ${index + 1}: Cantidad es obligatoria y debe ser mayor a 0`);
      }

      if (!mercancia.claveUnidad) {
        errors.push(`Mercancía ${index + 1}: ClaveUnidad es obligatoria`);
      }

      // Recomendaciones para material peligroso
      if (mercancia.materialPeligroso === undefined) {
        warnings.push(`Mercancía ${index + 1}: Especificar si es MaterialPeligroso (Sí/No)`);
      }
    });

    return { errors, warnings, recommendations, version31Features };
  }

  private static validarAutotransporte31(autotransporte: any) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!autotransporte) {
      errors.push('Información de Autotransporte es obligatoria');
      return { errors, warnings };
    }

    // Validar permiso SCT
    if (!autotransporte.perm_sct) {
      errors.push('PermSCT: Clave de tipo de permiso es obligatoria');
    }

    if (!autotransporte.num_permiso_sct) {
      errors.push('NumPermisoSCT: Número de permiso es obligatorio');
    }

    // Validar identificación vehicular
    if (!autotransporte.placa_vm) {
      errors.push('PlacaVM: Placa del vehículo motor es obligatoria');
    } else {
      const placaRegex = /^[A-Z0-9-]{5,10}$/;
      if (!placaRegex.test(autotransporte.placa_vm)) {
        warnings.push('PlacaVM: Formato recomendado sin espacios ni caracteres especiales');
      }
    }

    if (!autotransporte.anio_modelo_vm) {
      errors.push('AnioModeloVM: Año del modelo es obligatorio');
    } else {
      const currentYear = new Date().getFullYear();
      if (autotransporte.anio_modelo_vm < 1990 || autotransporte.anio_modelo_vm > currentYear + 1) {
        warnings.push(`AnioModeloVM: Año ${autotransporte.anio_modelo_vm} fuera del rango esperado (1990-${currentYear + 1})`);
      }
    }

    if (!autotransporte.config_vehicular) {
      errors.push('ConfigVehicular: Configuración del vehículo es obligatoria');
    }

    // Validar seguros obligatorios
    if (!autotransporte.asegura_resp_civil) {
      errors.push('AseguraRespCivil: Aseguradora de responsabilidad civil es obligatoria');
    }

    if (!autotransporte.poliza_resp_civil) {
      errors.push('PolizaRespCivil: Número de póliza de responsabilidad civil es obligatorio');
    }

    // Recomendaciones para seguro de carga
    if (!autotransporte.asegura_carga && !autotransporte.poliza_carga) {
      warnings.push('Recomendable incluir seguro de carga para mercancías de alto valor');
    }

    return { errors, warnings };
  }

  private static validarFiguras31(figuras: any[]) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!figuras || figuras.length === 0) {
      errors.push('Debe incluir al menos una figura de transporte (Operador)');
      return { errors, warnings };
    }

    const tieneOperador = figuras.some(f => f.tipoFigura === '01');
    if (!tieneOperador) {
      errors.push('Debe incluir al menos un Operador (TipoFigura: 01)');
    }

    figuras.forEach((figura, index) => {
      if (!figura.rfcFigura) {
        errors.push(`Figura ${index + 1}: RFC es obligatorio`);
      } else {
        const rfcValidation = this.validarRFCCompleto(figura.rfcFigura, `Figura ${index + 1}`);
        if (!rfcValidation.isValid) {
          errors.push(...rfcValidation.errors);
        }
      }

      if (!figura.nombreFigura || figura.nombreFigura.length < 2) {
        errors.push(`Figura ${index + 1}: Nombre completo es obligatorio`);
      }

      if (figura.tipoFigura === '01' && !figura.numLicencia) {
        errors.push(`Figura ${index + 1}: Número de licencia federal es obligatorio para Operadores`);
      }

      // Validar domicilio de la figura
      if (!figura.domicilio) {
        errors.push(`Figura ${index + 1}: Domicilio completo es obligatorio`);
      }
    });

    return { errors, warnings };
  }
}
