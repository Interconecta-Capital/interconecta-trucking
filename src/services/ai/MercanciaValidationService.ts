import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  corrections: Array<{
    field: string;
    currentValue: any;
    suggestedValue: any;
    reason: string;
    confidence: number;
  }>;
}

export class MercanciaValidationService {
  static async validateMercancia(mercancia: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      corrections: []
    };

    try {
      // Validación básica de campos requeridos
      if (!mercancia.descripcion?.trim()) {
        result.errors.push('La descripción es obligatoria');
        result.isValid = false;
      }

      if (!mercancia.claveProdServ || mercancia.claveProdServ.length !== 8) {
        result.errors.push('La clave de producto SAT debe tener 8 dígitos');
        result.isValid = false;
      }

      if (!mercancia.claveUnidad || mercancia.claveUnidad.length !== 3) {
        result.errors.push('La clave de unidad SAT debe tener 3 caracteres');
        result.isValid = false;
      }

      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        result.errors.push('La cantidad debe ser mayor a 0');
        result.isValid = false;
      }

      if (!mercancia.pesoKg || mercancia.pesoKg <= 0) {
        result.errors.push('El peso debe ser mayor a 0 kg');
        result.isValid = false;
      }

      if (!mercancia.valorMercancia || mercancia.valorMercancia <= 0) {
        result.errors.push('El valor debe ser mayor a 0');
        result.isValid = false;
      }

      // Validaciones de coherencia
      // Peso vs Cantidad
      const pesoUnitario = mercancia.pesoKg / mercancia.cantidad;
      if (pesoUnitario < 0.001) {
        result.warnings.push('El peso unitario parece muy bajo, verifica las unidades');
      }
      if (pesoUnitario > 50000) {
        result.warnings.push('El peso unitario parece muy alto, verifica las unidades');
      }

      // Valor vs Peso
      const valorPorKg = mercancia.valorMercancia / mercancia.pesoKg;
      if (valorPorKg < 1) {
        result.warnings.push('El valor por kilogramo parece bajo, verifica el valor comercial');
      }
      if (valorPorKg > 100000) {
        result.warnings.push('El valor por kilogramo parece muy alto, verifica el valor comercial');
      }

      // Si hay errores críticos, no continuar con validación IA
      if (!result.isValid) {
        return result;
      }

      // Validación avanzada con IA
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'validate_mercancia',
          data: {
            descripcion: mercancia.descripcion,
            claveProdServ: mercancia.claveProdServ,
            claveUnidad: mercancia.claveUnidad,
            cantidad: mercancia.cantidad,
            pesoKg: mercancia.pesoKg,
            valorMercancia: mercancia.valorMercancia
          }
        }
      });

      if (!error && data) {
        // Procesar correcciones sugeridas por IA
        if (data.corrections && Array.isArray(data.corrections)) {
          result.corrections = data.corrections;
        }

        if (data.warnings && Array.isArray(data.warnings)) {
          result.warnings.push(...data.warnings);
        }

        if (data.errors && Array.isArray(data.errors)) {
          result.errors.push(...data.errors);
          result.isValid = false;
        }
      }

    } catch (error) {
      console.error('Error en validación de mercancía:', error);
      result.warnings.push('No se pudo realizar la validación avanzada con IA');
    }

    return result;
  }

  static async validateBatch(mercancias: any[]): Promise<Map<number, ValidationResult>> {
    const results = new Map<number, ValidationResult>();

    for (let i = 0; i < mercancias.length; i++) {
      const result = await this.validateMercancia(mercancias[i]);
      results.set(i, result);
      
      // Pequeña pausa para no saturar
      if (i < mercancias.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}
