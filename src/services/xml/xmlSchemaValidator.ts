import { CartaPorteData } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';

export interface XMLValidationResult {
  esValido: boolean;
  puntajeConformidad: number; // 0-100
  errores: string[];
  advertencias: string[];
  sugerencias: string[];
  esquemaUsado?: {
    id: string;
    tipoDocumento: string;
    tipoTransporte: string;
    tipoOperacion: string;
  };
}

export interface EsquemaXMLSAT {
  id: string;
  tipo_documento: string;
  tipo_transporte: string;
  tipo_operacion: string | null;
  version_carta_porte: string;
  version_cfdi: string;
  xml_ejemplo: string;
  descripcion: string | null;
  campos_requeridos: any;
  campos_opcionales: any;
  activo: boolean;
}

export class XMLSchemaValidator {
  /**
   * Valida un XML generado contra el esquema SAT correspondiente
   */
  static async validateXMLAgainstSchema(
    xmlString: string,
    cartaPorteData: CartaPorteData
  ): Promise<XMLValidationResult> {
    try {
      // Determinar el esquema apropiado basado en los datos
      const esquema = await this.obtenerEsquemaApropiado(cartaPorteData);

      if (!esquema) {
        return {
          esValido: false,
          puntajeConformidad: 0,
          errores: ['No se encontró un esquema de referencia para este tipo de documento'],
          advertencias: [],
          sugerencias: ['Verifique que el tipo de documento y transporte sean válidos']
        };
      }

      // Parsear ambos XMLs
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const esquemaDoc = parser.parseFromString(esquema.xml_ejemplo, 'text/xml');

      // Validar estructura
      const resultado = this.compararEstructuras(xmlDoc, esquemaDoc, esquema);

      // Guardar log de validación
      await this.guardarLogValidacion(cartaPorteData, xmlString, resultado, esquema.id);

      return resultado;
    } catch (error) {
      console.error('Error validando XML:', error);
      return {
        esValido: false,
        puntajeConformidad: 0,
        errores: [`Error durante la validación: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        advertencias: [],
        sugerencias: []
      };
    }
  }

  /**
   * Obtiene el esquema apropiado basado en el tipo de documento y transporte
   */
  private static async obtenerEsquemaApropiado(
    data: CartaPorteData
  ): Promise<EsquemaXMLSAT | null> {
    try {
      const tipoDocumento = data.tipoCfdi === 'Traslado' ? 'traslado' : 'ingreso';
      const tipoTransporte = 'autotransporte'; // Por ahora solo autotransporte
      const tipoOperacion = data.transporteInternacional
        ? 'internacional_aduanero'
        : 'nacional';

      const { data: esquemas, error } = await supabase
        .from('esquemas_xml_sat')
        .select('*')
        .eq('tipo_documento', tipoDocumento)
        .eq('tipo_transporte', tipoTransporte)
        .eq('tipo_operacion', tipoOperacion)
        .eq('version_carta_porte', data.cartaPorteVersion || '3.1')
        .eq('activo', true)
        .limit(1)
        .single();

      if (error) {
        console.error('Error obteniendo esquema:', error);
        return null;
      }

      return esquemas;
    } catch (error) {
      console.error('Error en obtenerEsquemaApropiado:', error);
      return null;
    }
  }

  /**
   * Compara las estructuras de dos documentos XML
   */
  private static compararEstructuras(
    xmlDoc: Document,
    esquemaDoc: Document,
    esquema: EsquemaXMLSAT
  ): XMLValidationResult {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const sugerencias: string[] = [];
    let puntosPositivos = 0;
    let puntosTotales = 0;

    // Validar nodo raíz Comprobante
    const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
    if (!comprobante) {
      errores.push('Falta el nodo raíz cfdi:Comprobante');
      return {
        esValido: false,
        puntajeConformidad: 0,
        errores,
        advertencias,
        sugerencias,
        esquemaUsado: {
          id: esquema.id,
          tipoDocumento: esquema.tipo_documento,
          tipoTransporte: esquema.tipo_transporte,
          tipoOperacion: esquema.tipo_operacion || 'nacional'
        }
      };
    }

    // Validar atributos requeridos del Comprobante
    const atributosComprobante = [
      'Version', 'Serie', 'Folio', 'Fecha', 'FormaPago', 'SubTotal', 
      'Moneda', 'Total', 'TipoDeComprobante', 'LugarExpedicion', 'Exportacion'
    ];

    atributosComprobante.forEach(attr => {
      puntosTotales++;
      if (comprobante.getAttribute(attr)) {
        puntosPositivos++;
      } else {
        errores.push(`Falta el atributo requerido: ${attr} en cfdi:Comprobante`);
      }
    });

    // Validar Emisor
    const emisor = xmlDoc.getElementsByTagName('cfdi:Emisor')[0];
    puntosTotales++;
    if (!emisor) {
      errores.push('Falta el nodo cfdi:Emisor');
    } else {
      puntosPositivos++;
      ['Rfc', 'Nombre', 'RegimenFiscal'].forEach(attr => {
        puntosTotales++;
        if (emisor.getAttribute(attr)) {
          puntosPositivos++;
        } else {
          errores.push(`Falta el atributo ${attr} en cfdi:Emisor`);
        }
      });
    }

    // Validar Receptor
    const receptor = xmlDoc.getElementsByTagName('cfdi:Receptor')[0];
    puntosTotales++;
    if (!receptor) {
      errores.push('Falta el nodo cfdi:Receptor');
    } else {
      puntosPositivos++;
      ['Rfc', 'Nombre', 'UsoCFDI', 'DomicilioFiscalReceptor', 'RegimenFiscalReceptor'].forEach(attr => {
        puntosTotales++;
        if (receptor.getAttribute(attr)) {
          puntosPositivos++;
        } else {
          errores.push(`Falta el atributo ${attr} en cfdi:Receptor`);
        }
      });
    }

    // Validar Conceptos
    const conceptos = xmlDoc.getElementsByTagName('cfdi:Conceptos')[0];
    puntosTotales++;
    if (!conceptos) {
      errores.push('Falta el nodo cfdi:Conceptos');
    } else {
      puntosPositivos++;
      const conceptosList = conceptos.getElementsByTagName('cfdi:Concepto');
      if (conceptosList.length === 0) {
        errores.push('Debe existir al menos un cfdi:Concepto');
      } else {
        puntosTotales++;
        puntosPositivos++;
      }
    }

    // Validar CartaPorte en Complemento
    const complemento = xmlDoc.getElementsByTagName('cfdi:Complemento')[0];
    puntosTotales++;
    if (!complemento) {
      errores.push('Falta el nodo cfdi:Complemento');
    } else {
      puntosPositivos++;
      
      const cartaPorte = complemento.getElementsByTagName('cartaporte31:CartaPorte')[0];
      puntosTotales++;
      if (!cartaPorte) {
        errores.push('Falta el nodo cartaporte31:CartaPorte en el Complemento');
      } else {
        puntosPositivos++;

        // Validar atributos de CartaPorte
        ['Version', 'IdCCP', 'TranspInternac'].forEach(attr => {
          puntosTotales++;
          if (cartaPorte.getAttribute(attr)) {
            puntosPositivos++;
          } else {
            errores.push(`Falta el atributo ${attr} en cartaporte31:CartaPorte`);
          }
        });

        // Validar Ubicaciones
        const ubicaciones = cartaPorte.getElementsByTagName('cartaporte31:Ubicaciones')[0];
        puntosTotales++;
        if (!ubicaciones) {
          errores.push('Falta el nodo cartaporte31:Ubicaciones');
        } else {
          puntosPositivos++;
          const ubicacionesList = ubicaciones.getElementsByTagName('cartaporte31:Ubicacion');
          if (ubicacionesList.length < 2) {
            errores.push('Debe haber al menos 2 ubicaciones (Origen y Destino)');
          } else {
            puntosTotales++;
            puntosPositivos++;
          }
        }

        // Validar Mercancias
        const mercancias = cartaPorte.getElementsByTagName('cartaporte31:Mercancias')[0];
        puntosTotales++;
        if (!mercancias) {
          errores.push('Falta el nodo cartaporte31:Mercancias');
        } else {
          puntosPositivos++;
          const mercanciasList = mercancias.getElementsByTagName('cartaporte31:Mercancia');
          if (mercanciasList.length === 0) {
            errores.push('Debe existir al menos una Mercancia');
          } else {
            puntosTotales++;
            puntosPositivos++;
          }
        }

        // Validar Autotransporte
        if (esquema.tipo_transporte === 'autotransporte') {
          const autotransporte = mercancias?.getElementsByTagName('cartaporte31:Autotransporte')[0];
          puntosTotales++;
          if (!autotransporte) {
            errores.push('Falta el nodo cartaporte31:Autotransporte');
          } else {
            puntosPositivos++;
          }
        }

        // Validar FiguraTransporte
        const figuraTransporte = cartaPorte.getElementsByTagName('cartaporte31:FiguraTransporte')[0];
        puntosTotales++;
        if (!figuraTransporte) {
          errores.push('Falta el nodo cartaporte31:FiguraTransporte');
        } else {
          puntosPositivos++;
        }
      }
    }

    // Calcular puntaje
    const puntajeConformidad = puntosTotales > 0 
      ? Math.round((puntosPositivos / puntosTotales) * 100)
      : 0;

    // Agregar sugerencias basadas en el puntaje
    if (puntajeConformidad < 100 && puntajeConformidad > 70) {
      sugerencias.push('El XML está casi completo, revise los errores menores reportados');
    } else if (puntajeConformidad <= 70 && puntajeConformidad > 50) {
      sugerencias.push('El XML tiene varios campos faltantes, revise la estructura completa');
    } else if (puntajeConformidad <= 50) {
      sugerencias.push('El XML requiere correcciones significativas para cumplir con el esquema SAT');
    }

    return {
      esValido: errores.length === 0,
      puntajeConformidad,
      errores,
      advertencias,
      sugerencias,
      esquemaUsado: {
        id: esquema.id,
        tipoDocumento: esquema.tipo_documento,
        tipoTransporte: esquema.tipo_transporte,
        tipoOperacion: esquema.tipo_operacion || 'nacional'
      }
    };
  }

  /**
   * Guarda el log de validación en la base de datos
   */
  private static async guardarLogValidacion(
    cartaPorteData: CartaPorteData,
    xmlGenerado: string,
    resultado: XMLValidationResult,
    esquemaId: string
  ): Promise<void> {
    try {
      // Buscar el ID de la carta porte si existe
      const cartaPorteId = (cartaPorteData as any).id || null;

      await supabase.from('validaciones_xml_log').insert({
        carta_porte_id: cartaPorteId,
        esquema_id: esquemaId,
        xml_generado: xmlGenerado,
        resultado_validacion: {
          success: resultado.esValido,
          errors: resultado.errores,
          warnings: resultado.advertencias,
          suggestions: resultado.sugerencias
        },
        puntaje_conformidad: resultado.puntajeConformidad
      });
    } catch (error) {
      console.error('Error guardando log de validación:', error);
      // No lanzar error, solo logear
    }
  }

  /**
   * Valida específicamente el TipoDeComprobante
   */
  static validarTipoComprobante(xmlString: string): {
    valido: boolean;
    tipo: string;
    errores: string[];
    advertencias: string[];
  } {
    const errores: string[] = [];
    const advertencias: string[] = [];
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
    
    if (!comprobante) {
      return {
        valido: false,
        tipo: '',
        errores: ['No se encontró el nodo cfdi:Comprobante'],
        advertencias: []
      };
    }
    
    const tipoComprobante = comprobante.getAttribute('TipoDeComprobante') || '';
    const total = parseFloat(comprobante.getAttribute('Total') || '0');
    const subtotal = parseFloat(comprobante.getAttribute('SubTotal') || '0');
    
    // Validar tipo I (Factura/Ingreso)
    if (tipoComprobante === 'I') {
      if (total === 0) {
        errores.push('Factura (tipo I) debe tener Total > 0');
      }
      if (subtotal === 0) {
        errores.push('Factura (tipo I) debe tener SubTotal > 0');
      }
      
      // Verificar que tenga impuestos
      const impuestos = xmlDoc.getElementsByTagName('cfdi:Impuestos');
      if (impuestos.length === 0) {
        advertencias.push('Factura (tipo I) generalmente debe incluir nodo de Impuestos');
      }
    }
    
    // Validar tipo T (Traslado)
    if (tipoComprobante === 'T') {
      if (total !== 0) {
        errores.push('Traslado (tipo T) debe tener Total = 0');
      }
      if (subtotal !== 0) {
        errores.push('Traslado (tipo T) debe tener SubTotal = 0');
      }
      
      const moneda = comprobante.getAttribute('Moneda');
      if (moneda !== 'XXX') {
        advertencias.push('Traslado (tipo T) debe usar Moneda="XXX"');
      }
    }
    
    // Validar que exista complemento Carta Porte
    const cartaPorte = xmlDoc.getElementsByTagName('cartaporte31:CartaPorte')[0];
    if (!cartaPorte) {
      errores.push('Debe incluir complemento cartaporte31:CartaPorte');
    }
    
    return {
      valido: errores.length === 0,
      tipo: tipoComprobante,
      errores,
      advertencias
    };
  }

  /**
   * Obtiene el historial de validaciones de una carta porte
   */
  static async obtenerHistorialValidaciones(cartaPorteId: string) {
    try {
      const { data, error } = await supabase
        .from('validaciones_xml_log')
        .select(`
          *,
          esquema:esquemas_xml_sat(tipo_documento, tipo_transporte, tipo_operacion, version_carta_porte)
        `)
        .eq('carta_porte_id', cartaPorteId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }
}
