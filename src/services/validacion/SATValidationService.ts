import { supabase } from '@/integrations/supabase/client';

export interface ValidacionRFCResult {
  valido: boolean;
  mensaje: string;
  detalles?: {
    razonSocial?: string;
    situacion?: string;
  };
}

export class SATValidationService {
  /**
   * Valida RFC contra el padrón del SAT usando edge function
   */
  static async validarRFCEnSAT(rfc: string): Promise<ValidacionRFCResult> {
    try {
      // Normalizar RFC
      const rfcNormalizado = rfc.trim().toUpperCase();
      
      // Validación de formato básico
      if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfcNormalizado)) {
        return {
          valido: false,
          mensaje: 'Formato de RFC inválido'
        };
      }

      // Llamar a edge function para consultar SAT
      const { data, error } = await supabase.functions.invoke('consultar-rfc-sat', {
        body: { rfc: rfcNormalizado }
      });

      if (error) {
        console.error('Error consultando RFC en SAT:', error);
        return {
          valido: false,
          mensaje: 'Error al consultar el RFC en el SAT. Intenta nuevamente.'
        };
      }

      if (!data.encontrado) {
        return {
          valido: false,
          mensaje: 'RFC no encontrado en el padrón del SAT. Verifica que sea correcto.'
        };
      }

      return {
        valido: true,
        mensaje: 'RFC validado correctamente',
        detalles: {
          razonSocial: data.razonSocial,
          situacion: data.situacion
        }
      };
    } catch (error) {
      console.error('Error en validación SAT:', error);
      return {
        valido: false,
        mensaje: 'Error al validar RFC. Intenta nuevamente.'
      };
    }
  }

  /**
   * Valida múltiples RFCs en lote
   */
  static async validarRFCsEnLote(rfcs: string[]): Promise<Map<string, ValidacionRFCResult>> {
    const resultados = new Map<string, ValidacionRFCResult>();
    
    // Validar en paralelo (máximo 5 a la vez)
    const chunks = this.chunkArray(rfcs, 5);
    
    for (const chunk of chunks) {
      const promesas = chunk.map(async (rfc) => {
        const resultado = await this.validarRFCEnSAT(rfc);
        return [rfc, resultado] as [string, ValidacionRFCResult];
      });
      
      const resultadosChunk = await Promise.all(promesas);
      resultadosChunk.forEach(([rfc, resultado]) => {
        resultados.set(rfc, resultado);
      });
    }
    
    return resultados;
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
