
import { MaterialPeligrosoDetector } from './MaterialPeligrosoDetector';
import { RutaRestriccionesValidator } from './RutaRestriccionesValidator';
import { CapacidadValidator } from './CapacidadValidator';

export interface ValidationResult31 {
  isValid: boolean;
  level: 'bloqueante' | 'advertencia' | 'informacion';
  category: 'material_peligroso' | 'ruta_restringida' | 'capacidad' | 'documentacion' | 'general';
  title: string;
  message: string;
  solution?: string;
  linkTramite?: string;
  autoFix?: {
    field: string;
    value: any;
    description: string;
  };
}

export interface ValidationConfig {
  enableMaterialPeligroso: boolean;
  enableRutaRestricciones: boolean;
  enableCapacidadValidation: boolean;
  enableDocumentacionCheck: boolean;
  strictMode: boolean;
}

export class ValidationEngine31Enhanced {
  private materialDetector: MaterialPeligrosoDetector;
  private rutaValidator: RutaRestriccionesValidator;
  private capacidadValidator: CapacidadValidator;

  constructor() {
    this.materialDetector = new MaterialPeligrosoDetector();
    this.rutaValidator = new RutaRestriccionesValidator();
    this.capacidadValidator = new CapacidadValidator();
  }

  async validateCartaPorteCompleta(
    cartaPorteData: any,
    config: ValidationConfig = this.getDefaultConfig()
  ): Promise<ValidationResult31[]> {
    const resultados: ValidationResult31[] = [];

    console.log('🔍 Iniciando validaciones avanzadas SAT 3.1...');

    // 1. Validaciones de Material Peligroso
    if (config.enableMaterialPeligroso) {
      const materialResults = await this.materialDetector.validateMercancias(
        cartaPorteData.mercancias || []
      );
      resultados.push(...materialResults);
    }

    // 2. Validaciones de Ruta y Restricciones
    if (config.enableRutaRestricciones) {
      const rutaResults = await this.rutaValidator.validateRuta(
        cartaPorteData.ubicaciones || [],
        cartaPorteData.autotransporte,
        cartaPorteData.mercancias || []
      );
      resultados.push(...rutaResults);
    }

    // 3. Validaciones de Capacidad
    if (config.enableCapacidadValidation) {
      const capacidadResults = await this.capacidadValidator.validateCapacidad(
        cartaPorteData.autotransporte,
        cartaPorteData.mercancias || []
      );
      resultados.push(...capacidadResults);
    }

    // 4. Validaciones de Documentación
    if (config.enableDocumentacionCheck) {
      const docResults = await this.validateDocumentacion(cartaPorteData);
      resultados.push(...docResults);
    }

    // 5. Validaciones Generales SAT 3.1
    const generalResults = await this.validateReglasGenerales(cartaPorteData);
    resultados.push(...generalResults);

    console.log(`✅ Validaciones completadas: ${resultados.length} resultados`);
    return this.prioritizeResults(resultados);
  }

  private async validateDocumentacion(cartaPorteData: any): Promise<ValidationResult31[]> {
    const resultados: ValidationResult31[] = [];

    // Validar permisos SCT
    if (cartaPorteData.autotransporte?.perm_sct && !cartaPorteData.autotransporte?.num_permiso_sct) {
      resultados.push({
        isValid: false,
        level: 'bloqueante',
        category: 'documentacion',
        title: 'Número de Permiso SCT Faltante',
        message: 'Se especificó tipo de permiso SCT pero falta el número de permiso',
        solution: 'Agregue el número de permiso SCT correspondiente'
      });
    }

    // Validar seguros
    if (cartaPorteData.autotransporte) {
      const { asegura_resp_civil, poliza_resp_civil } = cartaPorteData.autotransporte;
      
      if (asegura_resp_civil && !poliza_resp_civil) {
        resultados.push({
          isValid: false,
          level: 'advertencia',
          category: 'documentacion',
          title: 'Número de Póliza Faltante',
          message: 'Se especificó aseguradora pero falta el número de póliza de responsabilidad civil',
          solution: 'Complete el número de póliza de responsabilidad civil'
        });
      }
    }

    return resultados;
  }

  private async validateReglasGenerales(cartaPorteData: any): Promise<ValidationResult31[]> {
    const resultados: ValidationResult31[] = [];

    // Validar peso total vs capacidad
    const pesoTotal = cartaPorteData.mercancias?.reduce((sum: number, m: any) => sum + (m.peso_kg || 0), 0) || 0;
    const capacidadVehiculo = cartaPorteData.autotransporte?.peso_bruto_vehicular || 0;

    if (pesoTotal > capacidadVehiculo) {
      resultados.push({
        isValid: false,
        level: 'bloqueante',
        category: 'general',
        title: 'Sobrepeso del Vehículo',
        message: `El peso total de las mercancías (${pesoTotal} kg) excede la capacidad del vehículo (${capacidadVehiculo} kg)`,
        solution: 'Redistribuya la carga o use un vehículo de mayor capacidad'
      });
    }

    // Validar distancia vs ubicaciones
    const ubicaciones = cartaPorteData.ubicaciones || [];
    if (ubicaciones.length < 2) {
      resultados.push({
        isValid: false,
        level: 'bloqueante',
        category: 'general',
        title: 'Ubicaciones Insuficientes',
        message: 'Se requieren al menos 2 ubicaciones (origen y destino)',
        solution: 'Agregue las ubicaciones de origen y destino'
      });
    }

    return resultados;
  }

  private prioritizeResults(resultados: ValidationResult31[]): ValidationResult31[] {
    return resultados.sort((a, b) => {
      const levelPriority = { 'bloqueante': 3, 'advertencia': 2, 'informacion': 1 };
      return levelPriority[b.level] - levelPriority[a.level];
    });
  }

  private getDefaultConfig(): ValidationConfig {
    return {
      enableMaterialPeligroso: true,
      enableRutaRestricciones: true,
      enableCapacidadValidation: true,
      enableDocumentacionCheck: true,
      strictMode: false
    };
  }
}

export const validationEngine = new ValidationEngine31Enhanced();
