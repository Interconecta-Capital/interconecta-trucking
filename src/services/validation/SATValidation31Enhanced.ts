
import { ValidationResult } from '@/utils/satValidation';
import { MercanciaCompleta, AutotransporteCompleto, FiguraCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { CatalogosSATExtendido } from '@/services/catalogosSATExtendido';

export interface ValidationSAT31Result extends ValidationResult {
  warnings: string[];
  recommendations: string[];
  complianceScore: number;
  criticalIssues: string[];
  version31Specific: string[];
}

export interface CartaPorte31Data {
  // Campos base
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  tipoCfdi: string;
  transporteInternacional: boolean;
  registroIstmo: boolean;
  
  // Datos extendidos 3.1
  ubicaciones: UbicacionCompleta[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  
  // Campos específicos 3.1
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    cargaConsolidada?: boolean;
    contenedorMaritimo?: boolean;
    regimenAduanero?: string;
  };
}

export class SATValidation31Enhanced {
  
  static async validateCompleteCartaPorte31(data: CartaPorte31Data): Promise<ValidationSAT31Result> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    const version31Specific: string[] = [];
    
    // Validaciones básicas requeridas
    this.validateBasicFields(data, errors, criticalIssues);
    
    // Validaciones específicas de ubicaciones 3.1
    await this.validateUbicaciones31(data.ubicaciones, errors, warnings, recommendations);
    
    // Validaciones específicas de mercancías 3.1
    await this.validateMercancias31(data.mercancias, errors, warnings, recommendations, version31Specific);
    
    // Validaciones específicas de autotransporte 3.1
    await this.validateAutotransporte31(data.autotransporte, errors, warnings, recommendations, version31Specific);
    
    // Validaciones específicas de figuras 3.1
    await this.validateFiguras31(data.figuras, errors, warnings, recommendations);
    
    // Validaciones de coherencia entre secciones
    this.validateCoherencia31(data, errors, warnings, recommendations);
    
    // Validaciones específicas de versión 3.1
    this.validateVersion31Features(data, warnings, recommendations, version31Specific);
    
    // Calcular score de cumplimiento
    const complianceScore = this.calculateComplianceScore(errors, warnings, recommendations);
    
    return {
      isValid: errors.length === 0 && criticalIssues.length === 0,
      message: errors.length > 0 ? `${errors.length} errores encontrados` : 'Validación exitosa',
      errors,
      warnings,
      recommendations,
      complianceScore,
      criticalIssues,
      version31Specific
    };
  }
  
  private static validateBasicFields(data: CartaPorte31Data, errors: string[], criticalIssues: string[]) {
    // RFC Emisor
    if (!data.rfcEmisor) {
      criticalIssues.push('RFC del emisor es obligatorio');
    } else if (!this.validateRFCFormat(data.rfcEmisor)) {
      errors.push('Formato de RFC emisor inválido');
    }
    
    // RFC Receptor
    if (!data.rfcReceptor) {
      criticalIssues.push('RFC del receptor es obligatorio');
    } else if (!this.validateRFCFormat(data.rfcReceptor)) {
      errors.push('Formato de RFC receptor inválido');
    }
    
    // Nombres
    if (!data.nombreEmisor || data.nombreEmisor.trim().length < 2) {
      errors.push('Nombre del emisor debe tener al menos 2 caracteres');
    }
    
    if (!data.nombreReceptor || data.nombreReceptor.trim().length < 2) {
      errors.push('Nombre del receptor debe tener al menos 2 caracteres');
    }
  }
  
  private static async validateUbicaciones31(
    ubicaciones: UbicacionCompleta[], 
    errors: string[], 
    warnings: string[], 
    recommendations: string[]
  ) {
    if (!ubicaciones || ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
      return;
    }
    
    const tieneOrigen = ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
    const tieneDestino = ubicaciones.some(u => u.tipo_ubicacion === 'Destino');
    
    if (!tieneOrigen) {
      errors.push('Debe especificar al menos una ubicación de origen');
    }
    
    if (!tieneDestino) {
      errors.push('Debe especificar al menos una ubicación de destino');
    }
    
    // Validar cada ubicación
    for (const [index, ubicacion] of ubicaciones.entries()) {
      const prefix = `Ubicación ${index + 1}`;
      
      // Validar código postal
      if (ubicacion.domicilio?.codigo_postal) {
        if (!/^\d{5}$/.test(ubicacion.domicilio.codigo_postal)) {
          errors.push(`${prefix}: Código postal debe tener exactamente 5 dígitos`);
        }
      } else {
        warnings.push(`${prefix}: Se recomienda especificar código postal`);
      }
      
      // Validar RFC si está presente
      if (ubicacion.rfc_remitente_destinatario) {
        if (!this.validateRFCFormat(ubicacion.rfc_remitente_destinatario)) {
          errors.push(`${prefix}: RFC con formato inválido`);
        }
      }
      
      // Validar coordenadas GPS (3.1 específico)
      if (ubicacion.coordenadas) {
        if (!this.validateCoordinates(ubicacion.coordenadas.latitud, ubicacion.coordenadas.longitud)) {
          warnings.push(`${prefix}: Coordenadas GPS parecen incorrectas`);
        }
      } else {
        recommendations.push(`${prefix}: Considere agregar coordenadas GPS para mayor precisión`);
      }
      
      // Validar distancia recorrida
      if (index > 0 && !ubicacion.distancia_recorrida) {
        warnings.push(`${prefix}: Se recomienda especificar distancia recorrida`);
      }
    }
  }
  
  private static async validateMercancias31(
    mercancias: MercanciaCompleta[], 
    errors: string[], 
    warnings: string[], 
    recommendations: string[],
    version31Specific: string[]
  ) {
    if (!mercancias || mercancias.length === 0) {
      errors.push('Debe especificar al menos una mercancía');
      return;
    }
    
    for (const [index, mercancia] of mercancias.entries()) {
      const prefix = `Mercancía ${index + 1}`;
      
      // Validaciones básicas
      if (!mercancia.descripcion || mercancia.descripcion.trim().length < 5) {
        errors.push(`${prefix}: Descripción debe tener al menos 5 caracteres`);
      }
      
      if (!mercancia.bienes_transp) {
        errors.push(`${prefix}: Clave de producto/servicio es obligatoria`);
      }
      
      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        errors.push(`${prefix}: Cantidad debe ser mayor a 0`);
      }
      
      if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
        errors.push(`${prefix}: Peso debe ser mayor a 0`);
      }
      
      // Validaciones específicas 3.1
      if (!mercancia.fraccion_arancelaria && mercancia.valor_mercancia > 50000) {
        version31Specific.push(`${prefix}: Fracción arancelaria recomendada para valores > $50,000`);
      }
      
      if (!mercancia.tipo_embalaje) {
        warnings.push(`${prefix}: Se recomienda especificar tipo de embalaje`);
      }
      
      // Validar dimensiones si están presentes
      if (mercancia.dimensiones) {
        if (mercancia.dimensiones.largo <= 0 || mercancia.dimensiones.ancho <= 0 || mercancia.dimensiones.alto <= 0) {
          warnings.push(`${prefix}: Dimensiones deben ser mayores a 0`);
        }
      }
      
      // Validar peso bruto vs peso neto
      if (mercancia.peso_bruto_total && mercancia.peso_bruto_total < mercancia.peso_kg) {
        warnings.push(`${prefix}: Peso bruto no puede ser menor al peso neto`);
      }
      
      // Material peligroso
      if (mercancia.material_peligroso) {
        if (!mercancia.cve_material_peligroso) {
          errors.push(`${prefix}: Clave de material peligroso es obligatoria`);
        }
        version31Specific.push(`${prefix}: Material peligroso requiere documentación especial`);
      }
      
      // Validar coherencia valor-peso
      if (mercancia.valor_mercancia && mercancia.peso_kg) {
        const valorPorKg = mercancia.valor_mercancia / mercancia.peso_kg;
        if (valorPorKg > 100000) {
          warnings.push(`${prefix}: Valor por kg muy alto (${valorPorKg.toFixed(2)}), verifique`);
        }
      }
    }
  }
  
  private static async validateAutotransporte31(
    autotransporte: AutotransporteCompleto,
    errors: string[],
    warnings: string[],
    recommendations: string[],
    version31Specific: string[]
  ) {
    if (!autotransporte) {
      errors.push('Información de autotransporte es obligatoria');
      return;
    }
    
    // Validaciones básicas
    if (!autotransporte.placa_vm) {
      errors.push('Placa del vehículo motor es obligatoria');
    } else if (!/^[A-Z0-9]{6,8}$/.test(autotransporte.placa_vm)) {
      warnings.push('Formato de placa vehicular no estándar');
    }
    
    if (!autotransporte.config_vehicular) {
      errors.push('Configuración vehicular es obligatoria');
    }
    
    // Validaciones específicas 3.1
    if (!autotransporte.numero_serie_vin) {
      version31Specific.push('Número de serie VIN recomendado para versión 3.1');
    } else {
      const vinValidation = CatalogosSATExtendido.validarVIN(autotransporte.numero_serie_vin);
      if (!vinValidation.valido) {
        warnings.push(`VIN inválido: ${vinValidation.mensaje}`);
      }
    }
    
    // Validar año del modelo
    const currentYear = new Date().getFullYear();
    if (autotransporte.anio_modelo_vm) {
      if (autotransporte.anio_modelo_vm < 1990 || autotransporte.anio_modelo_vm > currentYear + 1) {
        warnings.push('Año del modelo fuera del rango esperado');
      }
    }
    
    // Validar capacidad de carga vs peso de mercancías
    if (autotransporte.capacidad_carga) {
      version31Specific.push('Capacidad de carga especificada mejora la validación');
    }
    
    // Seguros
    if (!autotransporte.asegura_resp_civil || !autotransporte.poliza_resp_civil) {
      errors.push('Seguro de responsabilidad civil es obligatorio');
    }
    
    // Permisos SCT
    if (!autotransporte.perm_sct || !autotransporte.num_permiso_sct) {
      errors.push('Permiso SCT y número son obligatorios');
    }
    
    // Dimensiones del vehículo (3.1)
    if (autotransporte.dimensiones) {
      version31Specific.push('Dimensiones del vehículo incluidas - excelente para 3.1');
    } else {
      recommendations.push('Considere agregar dimensiones del vehículo para cumplimiento completo 3.1');
    }
  }
  
  private static async validateFiguras31(
    figuras: FiguraCompleta[],
    errors: string[],
    warnings: string[],
    recommendations: string[]
  ) {
    if (!figuras || figuras.length === 0) {
      errors.push('Debe especificar al menos una figura de transporte');
      return;
    }
    
    const hasOperador = figuras.some(f => f.tipo_figura === '01');
    if (!hasOperador) {
      warnings.push('Se recomienda incluir al menos un operador (tipo 01)');
    }
    
    for (const [index, figura] of figuras.entries()) {
      const prefix = `Figura ${index + 1}`;
      
      if (!figura.tipo_figura) {
        errors.push(`${prefix}: Tipo de figura es obligatorio`);
      }
      
      if (!figura.rfc_figura) {
        errors.push(`${prefix}: RFC es obligatorio`);
      } else if (!this.validateRFCFormat(figura.rfc_figura)) {
        errors.push(`${prefix}: RFC con formato inválido`);
      }
      
      if (!figura.nombre_figura) {
        errors.push(`${prefix}: Nombre es obligatorio`);
      }
      
      // Validaciones específicas por tipo
      if (figura.tipo_figura === '01') { // Operador
        if (!figura.num_licencia) {
          errors.push(`${prefix}: Número de licencia obligatorio para operadores`);
        }
        
        if (figura.curp) {
          const curpValidation = CatalogosSATExtendido.validarCURP(figura.curp);
          if (!curpValidation.valido) {
            warnings.push(`${prefix}: CURP inválido - ${curpValidation.mensaje}`);
          }
        } else {
          recommendations.push(`${prefix}: CURP recomendado para operadores`);
        }
      }
      
      // Domicilio completo (3.1)
      if (figura.domicilio) {
        if (!figura.domicilio.codigo_postal) {
          warnings.push(`${prefix}: Código postal recomendado en domicilio`);
        }
      } else {
        recommendations.push(`${prefix}: Domicilio completo recomendado para 3.1`);
      }
    }
  }
  
  private static validateCoherencia31(
    data: CartaPorte31Data,
    errors: string[],
    warnings: string[],
    recommendations: string[]
  ) {
    // Coherencia peso total vs capacidad vehículo
    const pesoTotalMercancias = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    
    if (data.autotransporte.capacidad_carga && pesoTotalMercancias > data.autotransporte.capacidad_carga) {
      warnings.push('Peso total de mercancías excede capacidad del vehículo');
    }
    
    // Coherencia distancias
    const distanciaTotal = data.ubicaciones.reduce((sum, u) => sum + (u.distancia_recorrida || 0), 0);
    if (distanciaTotal > 5000) {
      recommendations.push('Distancia total muy larga, verifique ruta');
    }
    
    // Coherencia internacional
    if (data.transporteInternacional) {
      const tieneUbicacionInternacional = data.ubicaciones.some(u => 
        u.domicilio?.pais && u.domicilio.pais !== 'MEX'
      );
      if (!tieneUbicacionInternacional) {
        warnings.push('Transporte internacional sin ubicaciones fuera de México');
      }
    }
  }
  
  private static validateVersion31Features(
    data: CartaPorte31Data,
    warnings: string[],
    recommendations: string[],
    version31Specific: string[]
  ) {
    if (!data.version31Fields) {
      recommendations.push('Considere usar campos específicos de versión 3.1 para mejor cumplimiento');
      return;
    }
    
    const v31 = data.version31Fields;
    
    if (v31.transporteEspecializado) {
      version31Specific.push('Transporte especializado configurado correctamente');
    }
    
    if (v31.tipoCarroceria) {
      version31Specific.push('Tipo de carrocería especificado mejora la validación');
    }
    
    if (v31.cargaConsolidada) {
      version31Specific.push('Carga consolidada requiere validaciones adicionales');
      
      // Validar que hay múltiples remitentes/destinatarios
      const rfcsUnicos = new Set([
        ...data.ubicaciones.map(u => u.rfc_remitente_destinatario).filter(Boolean)
      ]);
      
      if (rfcsUnicos.size < 2) {
        warnings.push('Carga consolidada debería tener múltiples remitentes/destinatarios');
      }
    }
  }
  
  private static validateRFCFormat(rfc: string): boolean {
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc) && (rfc.length === 12 || rfc.length === 13);
  }
  
  private static validateCoordinates(lat: number, lng: number): boolean {
    // Coordenadas válidas para México
    return lat >= 14.5 && lat <= 32.7 && lng >= -118.4 && lng <= -86.7;
  }
  
  private static calculateComplianceScore(
    errors: string[],
    warnings: string[],
    recommendations: string[]
  ): number {
    let score = 100;
    
    // Penalizar errores severamente
    score -= errors.length * 15;
    
    // Penalizar warnings moderadamente
    score -= warnings.length * 5;
    
    // Penalizar recomendaciones ligeramente
    score -= recommendations.length * 2;
    
    return Math.max(0, Math.min(100, score));
  }
}
