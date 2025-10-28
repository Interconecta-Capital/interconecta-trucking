import { CartaPorteData } from '@/types/cartaPorte';
import { XMLGeneratorEnhanced, XMLGenerationResultEnhanced } from './xmlGeneratorEnhanced';
import { XMLValidatorSAT31 } from './xmlValidatorSAT31';
import { UUIDService } from '@/services/uuid/UUIDService';
import { supabase } from '@/integrations/supabase/client';

// Mantener compatibilidad con la interfaz existente
export interface XMLGenerationResult {
  success: boolean;
  xml?: string;
  errors?: string[];
  warnings?: string[];
  validationDetails?: {
    totalFields: number;
    validFields: number;
    missingFields: string[];
    invalidFields: string[];
  };
}

export class XMLCartaPorteGenerator {
  static async generarXML(data: CartaPorteData): Promise<XMLGenerationResult> {
    try {
      console.log('🚀 Iniciando generación de XML...');
      
      // PASO 1: Generar IdCCP si no existe o está vacío
      if (!data.idCCP || data.idCCP === 'Sin generar' || data.idCCP.length !== 32) {
        const nuevoIdCCP = UUIDService.generateValidIdCCP();
        console.log('🆔 Generando nuevo IdCCP:', nuevoIdCCP);
        
        // Actualizar en la data
        data.idCCP = nuevoIdCCP;
        
        // Guardar en base de datos si existe el ID del documento
        if (data.id) {
          try {
            const { error } = await supabase
              .from('cartas_porte')
              .update({ id_ccp: nuevoIdCCP })
              .eq('id', data.id);
              
            if (error) {
              console.error('⚠️ Error guardando IdCCP en DB:', error);
            } else {
              console.log('✅ IdCCP guardado en DB:', nuevoIdCCP);
            }
          } catch (dbError) {
            console.error('⚠️ Error de conexión al guardar IdCCP:', dbError);
            // No fallar el proceso por este error
          }
        }
      } else {
        console.log('✅ IdCCP existente:', data.idCCP);
      }
      
      // PASO 2: Usar el generador mejorado
      console.log('🚀 Delegando a generador mejorado...');
      const enhancedResult = await XMLGeneratorEnhanced.generarXMLCompleto(data);
      
      // Convertir a formato compatible
      return {
        success: enhancedResult.success,
        xml: enhancedResult.xml,
        errors: enhancedResult.errors,
        warnings: enhancedResult.warnings,
        validationDetails: enhancedResult.validationDetails ? {
          totalFields: enhancedResult.validationDetails.totalFields,
          validFields: enhancedResult.validationDetails.validFields,
          missingFields: enhancedResult.validationDetails.missingFields,
          invalidFields: enhancedResult.validationDetails.invalidFields
        } : undefined
      };
    } catch (error) {
      console.error('💥 Error en generador de compatibilidad:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  // ... keep existing code (mantener métodos privados existentes para compatibilidad)
  private static async enrichCartaPorteData(data: CartaPorteData): Promise<CartaPorteData> {
    // Delegar al generador mejorado (método ya implementado ahí)
    return data;
  }

  private static async getCodigoPostalData(codigoPostal: string) {
    // ... keep existing code (implementación existente)
    try {
      const cpDatabase: { [key: string]: any } = {
        '01000': {
          estado: 'CIUDAD DE MEXICO',
          municipio: 'CUAUHTEMOC',
          colonia: 'CENTRO'
        },
        '44100': {
          estado: 'JALISCO',
          municipio: 'GUADALAJARA',
          colonia: 'CENTRO'
        },
        '64000': {
          estado: 'NUEVO LEON',
          municipio: 'MONTERREY',
          colonia: 'CENTRO'
        }
      };
      return cpDatabase[codigoPostal] || null;
    } catch (error) {
      console.warn('Error obteniendo datos de código postal:', error);
      return null;
    }
  }

  private static async getCoordinatesFromCP(codigoPostal: string) {
    // ... keep existing code (implementación existente)
    try {
      const coordinates: { [key: string]: { latitud: number; longitud: number } } = {
        '01000': { latitud: 19.4326, longitud: -99.1332 },
        '44100': { latitud: 20.6597, longitud: -103.3496 },
        '64000': { latitud: 25.6866, longitud: -100.3161 }
      };
      return coordinates[codigoPostal] || { latitud: 19.4326, longitud: -99.1332 };
    } catch (error) {
      console.warn('Error obteniendo coordenadas:', error);
      return { latitud: 19.4326, longitud: -99.1332 };
    }
  }

  private static construirXMLCompleto(data: CartaPorteData): string {
    // Delegar al generador mejorado
    return XMLGeneratorEnhanced.generarXMLCompleto(data).then(result => result.xml || '').toString();
  }

  private static calcularSubTotal(data: CartaPorteData): string {
    if (data.tipoCfdi === 'Traslado') return '0';
    
    let subtotal = 0;
    if (data.mercancias) {
      subtotal = data.mercancias.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0);
    }
    
    return subtotal.toFixed(2);
  }

  private static calcularTotal(data: CartaPorteData): string {
    if (data.tipoCfdi === 'Traslado') return '0';
    
    const subtotal = parseFloat(this.calcularSubTotal(data));
    const impuestos = subtotal * 0.16;
    
    return (subtotal + impuestos).toFixed(2);
  }

  private static async validateGeneratedXML(xml: string) {
    // ... keep existing code (implementación existente)
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      
      const errors = xmlDoc.getElementsByTagName('parsererror');
      if (errors.length > 0) {
        return {
          isValid: false,
          errors: ['XML mal formado']
        };
      }

      const warnings: string[] = [];
      
      const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
      if (!comprobante) {
        warnings.push('Elemento Comprobante no encontrado');
      }

      const emisor = xmlDoc.getElementsByTagName('cfdi:Emisor')[0];
      if (!emisor) {
        warnings.push('Elemento Emisor no encontrado');
      }

      const receptor = xmlDoc.getElementsByTagName('cfdi:Receptor')[0];
      if (!receptor) {
        warnings.push('Elemento Receptor no encontrado');
      }

      return {
        isValid: warnings.length === 0,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Error validando XML generado']
      };
    }
  }
}
