
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  autoFixes?: AutoFix[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'formato' | 'contenido' | 'regulacion' | 'inconsistencia';
}

export interface ValidationSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  reason: string;
}

export interface AutoFix {
  field: string;
  currentValue: any;
  suggestedValue: any;
  description: string;
  confidence: number;
}

export class GeminiValidationService {
  async validarDireccion(direccion: any): Promise<ValidationResult> {
    try {
      console.log('[GeminiValidation] Validando dirección:', direccion);
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'validate_direccion',
          data: direccion,
          context: {
            pais: 'México',
            normas: ['carta_porte_3.1', 'sat_direcciones']
          }
        },
      });

      if (error) throw error;
      return data as ValidationResult;
    } catch (error) {
      console.error('[GeminiValidation] Error validando dirección:', error);
      return {
        isValid: false,
        confidence: 0,
        warnings: [{
          field: 'general',
          message: 'Error en la validación automática',
          severity: 'medium',
          type: 'contenido'
        }],
        suggestions: []
      };
    }
  }

  async validarMercancia(mercancia: any): Promise<ValidationResult> {
    try {
      console.log('[GeminiValidation] Validando mercancía:', mercancia);
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'validate_mercancia_advanced',
          data: mercancia,
          context: {
            catalogo_sat: true,
            version_carta_porte: '3.1',
            validar_coherencia: true
          }
        },
      });

      if (error) throw error;
      return data as ValidationResult;
    } catch (error) {
      console.error('[GeminiValidation] Error validando mercancía:', error);
      return {
        isValid: false,
        confidence: 0,
        warnings: [{
          field: 'general',
          message: 'Error en la validación automática',
          severity: 'medium',
          type: 'contenido'
        }],
        suggestions: []
      };
    }
  }

  async validarCoherenciaGeneral(cartaPorteData: any): Promise<ValidationResult> {
    try {
      console.log('[GeminiValidation] Validando coherencia general');
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'validate_coherencia_carta_porte',
          data: cartaPorteData,
          context: {
            validacion_cruzada: true,
            detectar_inconsistencias: true,
            sugerir_optimizaciones: true
          }
        },
      });

      if (error) throw error;
      return data as ValidationResult;
    } catch (error) {
      console.error('[GeminiValidation] Error validando coherencia:', error);
      return {
        isValid: true,
        confidence: 0.5,
        warnings: [],
        suggestions: []
      };
    }
  }

  async detectarAnomalias(data: any, tipo: string): Promise<ValidationResult> {
    try {
      const { data: result, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'detect_anomalies',
          data,
          context: {
            tipo,
            sensibilidad: 'alta',
            incluir_sugerencias: true
          }
        },
      });

      if (error) throw error;
      return result as ValidationResult;
    } catch (error) {
      console.error('[GeminiValidation] Error detectando anomalías:', error);
      return {
        isValid: true,
        confidence: 0.5,
        warnings: [],
        suggestions: []
      };
    }
  }
}

export const geminiValidationService = new GeminiValidationService();
