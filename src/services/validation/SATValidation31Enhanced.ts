import { ValidationResult } from '@/utils/satValidation';
import { MercanciaCompleta, AutotransporteCompleto, FiguraCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { CatalogosSATExtendido } from '@/services/catalogosSATExtendido';

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

export interface CartaPorte31Data {
  // Campos base - todos opcionales para compatibilidad
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  tipoCfdi?: string;
  transporteInternacional?: boolean;
  registroIstmo?: boolean;
  
  // Datos extendidos 3.1
  ubicaciones?: UbicacionCompleta[];
  mercancias?: MercanciaCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
  
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
  
  static async validarCompleta(data: CartaPorte31Data): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validaciones básicas requeridas
    this.validateBasicFields(data, errors, []);
    
    // Validaciones específicas de ubicaciones 3.1
    await this.validateUbicaciones31(data.ubicaciones || [], errors, warnings, []);
    
    // Validaciones específicas de mercancías 3.1
    await this.validateMercancias31(data.mercancias || [], errors, warnings, [], []);
    
    // Validaciones específicas de autotransporte 3.1
    if (data.autotransporte) {
      await this.validateAutotransporte31(data.autotransporte, errors, warnings, [], []);
    }
    
    // Validaciones específicas de figuras 3.1
    await this.validateFiguras31(data.figuras || [], errors, warnings, []);
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  static async validarTransporteInternacional(data: CartaPorte31Data): Promise<ValidationResult> {
    const errors: string[] = [];
    
    if (data.transporteInternacional) {
      // Validar que hay ubicaciones internacionales
      const tieneUbicacionInternacional = data.ubicaciones?.some(u => 
        u.domicilio?.pais && u.domicilio.pais !== 'MEX'
      );
      
      if (!tieneUbicacionInternacional) {
        errors.push('Transporte internacional requiere al menos una ubicación fuera de México');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static async validateCompleteCartaPorte31(data: CartaPorte31Data): Promise<ValidationSAT31Result> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    const version31Specific: string[] = [];
    
    // Validaciones básicas requeridas
    this.validateBasicFields(data, errors, criticalIssues);
    
    // Validaciones específicas de ubicaciones 3.1
    await this.validateUbicaciones31(data.ubicaciones || [], errors, warnings, recommendations);
    
    // Validaciones específicas de mercancías 3.1
    await this.validateMercancias31(data.mercancias || [], errors, warnings, recommendations, version31Specific);
    
    // Validaciones específicas de autotransporte 3.1
    if (data.autotransporte) {
      await this.validateAutotransporte31(data.autotransporte, errors, warnings, recommendations, version31Specific);
    }
    
    // Validaciones específicas de figuras 3.1
    await this.validateFiguras31(data.figuras || [], errors, warnings, recommendations);
    
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
    
    if (!autotransporte.placa_vm) {
      errors.push('Placa del vehículo motor es obligatoria');
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
