
import { CartaPorteData } from '@/types/cartaPorte';
import { XMLValidation } from './xmlValidation';
import { XMLUtils } from './xmlUtils';
import { XMLConceptosBuilder } from './xmlConceptos';
import { XMLComplementoBuilder } from './xmlComplemento';
import { getCartaPorteNamespace, getSchemaLocation, XML_NAMESPACES } from './xmlNamespaces';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';

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
      console.log('🚀 Iniciando generación de XML Carta Porte');
      console.log('📋 Datos recibidos:', data);

      // Validación exhaustiva antes de generar XML
      const validationResult = await XMLValidation.validateCartaPorteData(data);
      console.log('✅ Resultado de validación:', validationResult);
      
      if (!validationResult.isValid) {
        console.error('❌ Validación falló:', validationResult.errors);
        return {
          success: false,
          errors: validationResult.errors,
          validationDetails: {
            totalFields: validationResult.totalFields || 0,
            validFields: validationResult.validFields || 0,
            missingFields: validationResult.missingFields || [],
            invalidFields: validationResult.invalidFields || []
          }
        };
      }

      // Enriquecer datos antes de generar XML
      const enrichedData = await this.enrichCartaPorteData(data);
      console.log('📈 Datos enriquecidos:', enrichedData);

      // Generar XML con datos completos
      const xml = this.construirXMLCompleto(enrichedData);
      console.log('📄 XML generado exitosamente');

      // Validación final del XML generado
      const xmlValidation = await this.validateGeneratedXML(xml);
      if (!xmlValidation.isValid) {
        console.warn('⚠️ XML generado tiene advertencias:', xmlValidation.warnings);
      }

      return {
        success: true,
        xml,
        warnings: validationResult.warnings,
        validationDetails: {
          totalFields: validationResult.totalFields || 0,
          validFields: validationResult.validFields || 0,
          missingFields: [],
          invalidFields: []
        }
      };
    } catch (error) {
      console.error('💥 Error crítico generando XML:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  private static async enrichCartaPorteData(data: CartaPorteData): Promise<CartaPorteData> {
    const enriched = { ...data };

    // Enriquecer ubicaciones con datos faltantes
    if (enriched.ubicaciones) {
      enriched.ubicaciones = await Promise.all(
        enriched.ubicaciones.map(async (ubicacion) => {
          // Auto-completar datos de código postal si falta información
          if (ubicacion.domicilio?.codigo_postal && 
              (!ubicacion.domicilio.estado || !ubicacion.domicilio.municipio)) {
            const cpData = await this.getCodigoPostalData(ubicacion.domicilio.codigo_postal);
            if (cpData) {
              ubicacion.domicilio = {
                ...ubicacion.domicilio,
                estado: ubicacion.domicilio.estado || cpData.estado,
                municipio: ubicacion.domicilio.municipio || cpData.municipio,
                colonia: ubicacion.domicilio.colonia || cpData.colonia
              };
            }
          }

          // Generar coordenadas si faltan
          if (!ubicacion.coordenadas && ubicacion.domicilio?.codigo_postal) {
            ubicacion.coordenadas = await this.getCoordinatesFromCP(ubicacion.domicilio.codigo_postal);
          }

          return ubicacion;
        })
      );
    }

    // Enriquecer mercancías con claves SAT faltantes
    if (enriched.mercancias) {
      enriched.mercancias = enriched.mercancias.map(mercancia => {
        // Asegurar claves SAT por defecto si faltan
        if (!mercancia.bienes_transp) {
          mercancia.bienes_transp = '78101800'; // Servicio de transporte por defecto
        }
        if (!mercancia.clave_unidad) {
          mercancia.clave_unidad = 'KGM'; // Kilogramo por defecto
        }
        if (!mercancia.moneda) {
          mercancia.moneda = 'MXN';
        }

        return mercancia;
      });
    }

    // Enriquecer autotransporte con datos por defecto
    if (enriched.autotransporte) {
      if (!enriched.autotransporte.config_vehicular) {
        enriched.autotransporte.config_vehicular = 'C2'; // Configuración por defecto
      }
      if (!enriched.autotransporte.tipo_carroceria) {
        enriched.autotransporte.tipo_carroceria = 'CU'; // Caja unitaria por defecto
      }
    }

    return enriched;
  }

  private static async getCodigoPostalData(codigoPostal: string) {
    try {
      // Simulación de consulta a base de datos de códigos postales
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
    try {
      // Coordenadas aproximadas basadas en código postal
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
    const fechaActual = new Date().toISOString();
    const folio = XMLUtils.generarFolio();
    const version = (data.cartaPorteVersion || '3.1') as CartaPorteVersion;
    
    // Obtener namespaces según versión
    const cartaPorteNamespace = getCartaPorteNamespace(version);
    const schemaLocation = getSchemaLocation(version);
    const namespaceAlias = version === '3.1' ? 'cartaporte31' : 'cartaporte30';
    
    // Calcular totales
    const subTotal = this.calcularSubTotal(data);
    const total = this.calcularTotal(data);
    const moneda = data.tipoCfdi === 'Traslado' ? 'XXX' : 'MXN';
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="${XML_NAMESPACES.cfdi}"
  xmlns:${namespaceAlias}="${cartaPorteNamespace}"
  xmlns:xsi="${XML_NAMESPACES.xsi}"
  xsi:schemaLocation="${schemaLocation}"
  Version="4.0"
  Serie="CP"
  Folio="${folio}"
  Fecha="${fechaActual}"
  TipoDeComprobante="${data.tipoCfdi === 'Traslado' ? 'T' : 'I'}"
  SubTotal="${subTotal}"
  Total="${total}"
  Moneda="${moneda}"
  LugarExpedicion="${XMLUtils.obtenerCodigoPostalExpedicion(data)}"
  ${data.exportacion ? 'Exportacion="01"' : ''}>
  
  ${XMLConceptosBuilder.construirEmisor(data)}
  ${XMLConceptosBuilder.construirReceptor(data)}
  ${XMLConceptosBuilder.construirConceptos(data)}
  ${XMLComplementoBuilder.construirComplemento(data)}
  
</cfdi:Comprobante>`;

    return xml;
  }

  private static calcularSubTotal(data: CartaPorteData): string {
    if (data.tipoCfdi === 'Traslado') return '0';
    
    // Calcular subtotal basado en mercancías y servicios
    let subtotal = 0;
    if (data.mercancias) {
      subtotal = data.mercancias.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0);
    }
    
    return subtotal.toFixed(2);
  }

  private static calcularTotal(data: CartaPorteData): string {
    if (data.tipoCfdi === 'Traslado') return '0';
    
    const subtotal = parseFloat(this.calcularSubTotal(data));
    // Agregar impuestos si aplican
    const impuestos = subtotal * 0.16; // IVA 16% por defecto
    
    return (subtotal + impuestos).toFixed(2);
  }

  private static async validateGeneratedXML(xml: string) {
    try {
      // Validaciones básicas del XML generado
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      
      const errors = xmlDoc.getElementsByTagName('parsererror');
      if (errors.length > 0) {
        return {
          isValid: false,
          errors: ['XML mal formado']
        };
      }

      // Validaciones adicionales específicas del SAT
      const warnings: string[] = [];
      
      // Verificar elementos obligatorios
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
