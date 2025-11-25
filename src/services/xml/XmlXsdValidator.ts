/**
 * XmlXsdValidator - Validador XML contra esquemas XSD del SAT
 * 
 * Valida la estructura del XML antes de enviar al PAC
 * Implementa validaciones según Anexo 20 CFDI 4.0 y Carta Porte 3.1
 * 
 * @see FASE_3.3_VALIDADOR_XML.md
 */

import { CartaPorteData } from '@/types/cartaPorte';
import logger from '@/utils/logger';

export interface XsdValidationError {
  tipo: 'estructura' | 'atributo' | 'valor' | 'secuencia' | 'patron';
  nodo: string;
  mensaje: string;
  linea?: number;
  codigo: string;
  solucion?: string;
}

export interface XsdValidationResult {
  valido: boolean;
  errores: XsdValidationError[];
  advertencias: XsdValidationError[];
  xmlAnalizado?: string;
  tiempoValidacion: number;
}

// Estructura esperada según XSD de CFDI 4.0
const ESTRUCTURA_CFDI_40 = {
  'cfdi:Comprobante': {
    atributosRequeridos: ['Version', 'Fecha', 'SubTotal', 'Moneda', 'Total', 'TipoDeComprobante', 'LugarExpedicion', 'Exportacion'],
    atributosOpcionales: ['Serie', 'Folio', 'FormaPago', 'MetodoPago', 'CondicionesDePago', 'Descuento', 'TipoCambio', 'Confirmacion'],
    hijos: ['cfdi:InformacionGlobal', 'cfdi:CfdiRelacionados', 'cfdi:Emisor', 'cfdi:Receptor', 'cfdi:Conceptos', 'cfdi:Impuestos', 'cfdi:Complemento', 'cfdi:Addenda'],
    hijosRequeridos: ['cfdi:Emisor', 'cfdi:Receptor', 'cfdi:Conceptos'],
    orden: ['cfdi:InformacionGlobal', 'cfdi:CfdiRelacionados', 'cfdi:Emisor', 'cfdi:Receptor', 'cfdi:Conceptos', 'cfdi:Impuestos', 'cfdi:Complemento', 'cfdi:Addenda']
  },
  'cfdi:Emisor': {
    atributosRequeridos: ['Rfc', 'Nombre', 'RegimenFiscal'],
    atributosOpcionales: ['FacAtrAdquirente'],
    hijos: [],
    hijosRequeridos: []
  },
  'cfdi:Receptor': {
    atributosRequeridos: ['Rfc', 'Nombre', 'DomicilioFiscalReceptor', 'RegimenFiscalReceptor', 'UsoCFDI'],
    atributosOpcionales: ['ResidenciaFiscal', 'NumRegIdTrib'],
    hijos: [],
    hijosRequeridos: []
  },
  'cfdi:Conceptos': {
    atributosRequeridos: [],
    atributosOpcionales: [],
    hijos: ['cfdi:Concepto'],
    hijosRequeridos: ['cfdi:Concepto']
  },
  'cfdi:Concepto': {
    atributosRequeridos: ['ClaveProdServ', 'Cantidad', 'ClaveUnidad', 'Descripcion', 'ValorUnitario', 'Importe', 'ObjetoImp'],
    atributosOpcionales: ['NoIdentificacion', 'Unidad', 'Descuento'],
    hijos: ['cfdi:Impuestos', 'cfdi:ACuentaTerceros', 'cfdi:InformacionAduanera', 'cfdi:CuentaPredial', 'cfdi:ComplementoConcepto', 'cfdi:Parte'],
    hijosRequeridos: []
  }
};

// Estructura esperada según XSD de Carta Porte 3.1
const ESTRUCTURA_CARTA_PORTE_31 = {
  'cartaporte31:CartaPorte': {
    atributosRequeridos: ['Version', 'IdCCP', 'TranspInternac', 'TotalDistRec'],
    atributosOpcionales: ['EntradaSalidaMerc', 'PaisOrigenDestino', 'ViaEntradaSalida', 'RegistroISTMO', 'UbicacionPoloOrigen', 'UbicacionPoloDestino'],
    hijos: ['cartaporte31:RegimenesAduaneros', 'cartaporte31:Ubicaciones', 'cartaporte31:Mercancias', 'cartaporte31:FiguraTransporte'],
    hijosRequeridos: ['cartaporte31:Ubicaciones', 'cartaporte31:Mercancias', 'cartaporte31:FiguraTransporte'],
    orden: ['cartaporte31:RegimenesAduaneros', 'cartaporte31:Ubicaciones', 'cartaporte31:Mercancias', 'cartaporte31:FiguraTransporte']
  },
  'cartaporte31:Ubicacion': {
    atributosRequeridos: ['TipoUbicacion', 'IDUbicacion', 'FechaHoraSalidaLlegada'],
    atributosOpcionales: ['RFCRemitenteDestinatario', 'NombreRemitenteDestinatario', 'NumRegIdTrib', 'ResidenciaFiscal', 'NumEstacion', 'NombreEstacion', 'NavegacionTrafico', 'DistanciaRecorrida'],
    hijos: ['cartaporte31:Domicilio'],
    hijosRequeridos: ['cartaporte31:Domicilio']
  },
  'cartaporte31:Domicilio': {
    atributosRequeridos: ['Pais', 'CodigoPostal'],
    atributosOpcionales: ['Estado', 'Municipio', 'Localidad', 'Colonia', 'Calle', 'NumeroExterior', 'NumeroInterior', 'Referencia'],
    hijos: [],
    hijosRequeridos: []
  },
  'cartaporte31:Mercancias': {
    atributosRequeridos: ['PesoBrutoTotal', 'UnidadPeso', 'NumTotalMercancias'],
    atributosOpcionales: ['PesoNetoTotal', 'CargoPorTasacion', 'LogisticaInversaReworking'],
    hijos: ['cartaporte31:Mercancia', 'cartaporte31:Autotransporte', 'cartaporte31:TransporteMaritimo', 'cartaporte31:TransporteAereo', 'cartaporte31:TransporteFerroviario'],
    hijosRequeridos: ['cartaporte31:Mercancia']
  },
  'cartaporte31:Mercancia': {
    atributosRequeridos: ['BienesTransp', 'Descripcion', 'Cantidad', 'ClaveUnidad', 'PesoEnKg'],
    atributosOpcionales: ['ClaveSTCC', 'Unidad', 'Dimensiones', 'MaterialPeligroso', 'CveMaterialPeligroso', 'Embalaje', 'DescripEmbalaje', 'SectorCOFEPRIS', 'NombreIngredienteActivo', 'NomQuimico', 'DensidadMaterial', 'ValorMercancia', 'Moneda', 'FraccionArancelaria', 'UUIDComercioExt', 'TipoMateria', 'DescripcionMateria'],
    hijos: ['cartaporte31:DocumentacionAduanera', 'cartaporte31:GuiasIdentificacion', 'cartaporte31:CantidadTransporta', 'cartaporte31:DetalleMercancia'],
    hijosRequeridos: []
  },
  'cartaporte31:Autotransporte': {
    atributosRequeridos: ['PermSCT', 'NumPermisoSCT'],
    atributosOpcionales: [],
    hijos: ['cartaporte31:IdentificacionVehicular', 'cartaporte31:Seguros', 'cartaporte31:Remolques'],
    hijosRequeridos: ['cartaporte31:IdentificacionVehicular', 'cartaporte31:Seguros']
  },
  'cartaporte31:IdentificacionVehicular': {
    atributosRequeridos: ['ConfigVehicular', 'PesoBrutoVehicular', 'PlacaVM', 'AnioModeloVM'],
    atributosOpcionales: [],
    hijos: [],
    hijosRequeridos: []
  },
  'cartaporte31:Seguros': {
    atributosRequeridos: ['AseguraRespCivil', 'PolizaRespCivil'],
    atributosOpcionales: ['AseguraMedAmbiente', 'PolizaMedAmbiente', 'AseguraCarga', 'PolizaCarga', 'PrimaSeguro'],
    hijos: [],
    hijosRequeridos: []
  },
  'cartaporte31:TiposFigura': {
    atributosRequeridos: ['TipoFigura', 'RFCFigura'],
    atributosOpcionales: ['NumLicencia', 'NombreFigura', 'NumRegIdTribFigura', 'ResidenciaFiscalFigura'],
    hijos: ['cartaporte31:PartesTransporte', 'cartaporte31:Domicilio'],
    hijosRequeridos: []
  }
};

// Patrones de validación
const PATRONES = {
  RFC_PERSONA_MORAL: /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/,
  RFC_PERSONA_FISICA: /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/,
  RFC_GENERICO: /^(XEXX010101000|XAXX010101000)$/,
  CODIGO_POSTAL: /^[0-9]{5}$/,
  FECHA_HORA: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  UUID: /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/,
  ID_CCP: /^[a-fA-F0-9]{32}$/,
  MONTO: /^\d{1,18}(\.\d{1,6})?$/,
  CANTIDAD: /^\d{1,18}(\.\d{1,6})?$/,
  PLACA: /^[A-Z0-9]{5,10}$/,
  NUM_LICENCIA: /^[A-Z0-9]{6,20}$/
};

/**
 * Validador de XML contra esquemas XSD del SAT
 */
export class XmlXsdValidator {
  
  /**
   * Validar XML completo de CFDI con Carta Porte
   */
  static async validarXmlCompleto(
    xmlString: string,
    cartaPorteData?: CartaPorteData
  ): Promise<XsdValidationResult> {
    const inicio = Date.now();
    const errores: XsdValidationError[] = [];
    const advertencias: XsdValidationError[] = [];

    logger.info('xml-validator', 'Iniciando validación XSD', {
      longitudXml: xmlString.length
    });

    try {
      // 1. Parsear XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Verificar errores de parseo
      const parseErrors = xmlDoc.getElementsByTagName('parsererror');
      if (parseErrors.length > 0) {
        errores.push({
          tipo: 'estructura',
          nodo: 'XML',
          mensaje: 'XML mal formado: ' + parseErrors[0].textContent,
          codigo: 'XML_PARSE_ERROR',
          solucion: 'Verifique que el XML tenga estructura válida'
        });
        return {
          valido: false,
          errores,
          advertencias,
          tiempoValidacion: Date.now() - inicio
        };
      }

      // 2. Validar estructura CFDI 4.0
      await this.validarEstructuraCfdi(xmlDoc, errores, advertencias);

      // 3. Validar complemento Carta Porte 3.1
      await this.validarCartaPorte31(xmlDoc, errores, advertencias);

      // 4. Validar valores y patrones
      await this.validarValoresYPatrones(xmlDoc, errores, advertencias);

      // 5. Validar coherencia de datos
      if (cartaPorteData) {
        await this.validarCoherencia(xmlDoc, cartaPorteData, errores, advertencias);
      }

      const resultado: XsdValidationResult = {
        valido: errores.length === 0,
        errores,
        advertencias,
        xmlAnalizado: xmlString.substring(0, 500) + '...',
        tiempoValidacion: Date.now() - inicio
      };

      logger.info('xml-validator', 'Validación XSD completada', {
        valido: resultado.valido,
        errores: errores.length,
        advertencias: advertencias.length,
        tiempoMs: resultado.tiempoValidacion
      });

      return resultado;

    } catch (error: any) {
      logger.error('xml-validator', 'Error en validación XSD', { error: error.message });
      
      return {
        valido: false,
        errores: [{
          tipo: 'estructura',
          nodo: 'XML',
          mensaje: `Error interno de validación: ${error.message}`,
          codigo: 'INTERNAL_ERROR'
        }],
        advertencias,
        tiempoValidacion: Date.now() - inicio
      };
    }
  }

  /**
   * Validar estructura CFDI 4.0
   */
  private static async validarEstructuraCfdi(
    xmlDoc: Document,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
    
    if (!comprobante) {
      errores.push({
        tipo: 'estructura',
        nodo: 'cfdi:Comprobante',
        mensaje: 'Elemento raíz cfdi:Comprobante no encontrado',
        codigo: 'MISSING_ROOT'
      });
      return;
    }

    // Validar atributos del Comprobante
    const estructuraComprobante = ESTRUCTURA_CFDI_40['cfdi:Comprobante'];
    for (const attr of estructuraComprobante.atributosRequeridos) {
      if (!comprobante.hasAttribute(attr)) {
        errores.push({
          tipo: 'atributo',
          nodo: 'cfdi:Comprobante',
          mensaje: `Atributo requerido "${attr}" no encontrado`,
          codigo: 'MISSING_ATTR_' + attr.toUpperCase()
        });
      }
    }

    // Validar versión
    const version = comprobante.getAttribute('Version');
    if (version !== '4.0') {
      errores.push({
        tipo: 'valor',
        nodo: 'cfdi:Comprobante',
        mensaje: `Versión debe ser "4.0", encontrada: "${version}"`,
        codigo: 'INVALID_VERSION'
      });
    }

    // Validar Emisor
    const emisor = xmlDoc.getElementsByTagName('cfdi:Emisor')[0];
    if (!emisor) {
      errores.push({
        tipo: 'estructura',
        nodo: 'cfdi:Emisor',
        mensaje: 'Elemento cfdi:Emisor es obligatorio',
        codigo: 'MISSING_EMISOR'
      });
    } else {
      this.validarNodo(emisor, 'cfdi:Emisor', ESTRUCTURA_CFDI_40['cfdi:Emisor'], errores);
    }

    // Validar Receptor
    const receptor = xmlDoc.getElementsByTagName('cfdi:Receptor')[0];
    if (!receptor) {
      errores.push({
        tipo: 'estructura',
        nodo: 'cfdi:Receptor',
        mensaje: 'Elemento cfdi:Receptor es obligatorio',
        codigo: 'MISSING_RECEPTOR'
      });
    } else {
      this.validarNodo(receptor, 'cfdi:Receptor', ESTRUCTURA_CFDI_40['cfdi:Receptor'], errores);
    }

    // Validar Conceptos
    const conceptos = xmlDoc.getElementsByTagName('cfdi:Conceptos')[0];
    if (!conceptos) {
      errores.push({
        tipo: 'estructura',
        nodo: 'cfdi:Conceptos',
        mensaje: 'Elemento cfdi:Conceptos es obligatorio',
        codigo: 'MISSING_CONCEPTOS'
      });
    } else {
      const conceptosList = conceptos.getElementsByTagName('cfdi:Concepto');
      if (conceptosList.length === 0) {
        errores.push({
          tipo: 'estructura',
          nodo: 'cfdi:Concepto',
          mensaje: 'Debe haber al menos un cfdi:Concepto',
          codigo: 'MISSING_CONCEPTO'
        });
      }
    }
  }

  /**
   * Validar complemento Carta Porte 3.1
   */
  private static async validarCartaPorte31(
    xmlDoc: Document,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    // Buscar el complemento con diferentes prefijos posibles
    let cartaPorte = xmlDoc.getElementsByTagName('cartaporte31:CartaPorte')[0];
    if (!cartaPorte) {
      cartaPorte = xmlDoc.getElementsByTagName('cartaporte:CartaPorte')[0];
    }
    if (!cartaPorte) {
      // Buscar sin namespace
      const complemento = xmlDoc.getElementsByTagName('cfdi:Complemento')[0];
      if (complemento) {
        cartaPorte = complemento.getElementsByTagName('CartaPorte')[0];
      }
    }

    if (!cartaPorte) {
      advertencias.push({
        tipo: 'estructura',
        nodo: 'CartaPorte',
        mensaje: 'Complemento Carta Porte no encontrado',
        codigo: 'NO_CARTA_PORTE'
      });
      return;
    }

    // Validar versión de Carta Porte
    const version = cartaPorte.getAttribute('Version');
    if (version !== '3.1') {
      errores.push({
        tipo: 'valor',
        nodo: 'CartaPorte',
        mensaje: `Versión de Carta Porte debe ser "3.1", encontrada: "${version}"`,
        codigo: 'INVALID_CP_VERSION'
      });
    }

    // Validar IdCCP
    const idCcp = cartaPorte.getAttribute('IdCCP');
    if (!idCcp) {
      errores.push({
        tipo: 'atributo',
        nodo: 'CartaPorte',
        mensaje: 'Atributo IdCCP es obligatorio',
        codigo: 'MISSING_ID_CCP'
      });
    } else if (!PATRONES.ID_CCP.test(idCcp)) {
      errores.push({
        tipo: 'patron',
        nodo: 'CartaPorte',
        mensaje: `IdCCP debe ser UUID de 32 caracteres sin guiones, encontrado: "${idCcp}"`,
        codigo: 'INVALID_ID_CCP_FORMAT'
      });
    }

    // Validar TranspInternac
    const transpInternac = cartaPorte.getAttribute('TranspInternac');
    if (!transpInternac) {
      errores.push({
        tipo: 'atributo',
        nodo: 'CartaPorte',
        mensaje: 'Atributo TranspInternac es obligatorio',
        codigo: 'MISSING_TRANSP_INTERNAC'
      });
    } else if (!['Sí', 'No'].includes(transpInternac)) {
      errores.push({
        tipo: 'valor',
        nodo: 'CartaPorte',
        mensaje: 'TranspInternac debe ser "Sí" o "No"',
        codigo: 'INVALID_TRANSP_INTERNAC'
      });
    }

    // Validar TotalDistRec
    const totalDistRec = cartaPorte.getAttribute('TotalDistRec');
    if (!totalDistRec) {
      errores.push({
        tipo: 'atributo',
        nodo: 'CartaPorte',
        mensaje: 'Atributo TotalDistRec es obligatorio',
        codigo: 'MISSING_TOTAL_DIST'
      });
    } else {
      const dist = parseFloat(totalDistRec);
      if (isNaN(dist) || dist <= 0) {
        errores.push({
          tipo: 'valor',
          nodo: 'CartaPorte',
          mensaje: 'TotalDistRec debe ser un número mayor a 0',
          codigo: 'INVALID_TOTAL_DIST'
        });
      }
    }

    // Validar Ubicaciones
    await this.validarUbicaciones(cartaPorte, errores, advertencias);

    // Validar Mercancías
    await this.validarMercancias(cartaPorte, errores, advertencias);

    // Validar FiguraTransporte
    await this.validarFiguras(cartaPorte, errores, advertencias);
  }

  /**
   * Validar ubicaciones del Carta Porte
   */
  private static async validarUbicaciones(
    cartaPorte: Element,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    const ubicaciones = cartaPorte.getElementsByTagName('Ubicacion');
    
    if (ubicaciones.length < 2) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Ubicaciones',
        mensaje: 'Se requieren mínimo 2 ubicaciones (origen y destino)',
        codigo: 'MIN_UBICACIONES'
      });
      return;
    }

    let tieneOrigen = false;
    let tieneDestino = false;

    for (let i = 0; i < ubicaciones.length; i++) {
      const ubicacion = ubicaciones[i];
      const tipo = ubicacion.getAttribute('TipoUbicacion');

      if (tipo === 'Origen') tieneOrigen = true;
      if (tipo === 'Destino') tieneDestino = true;

      // Validar atributos requeridos
      if (!ubicacion.getAttribute('IDUbicacion')) {
        errores.push({
          tipo: 'atributo',
          nodo: `Ubicacion[${i}]`,
          mensaje: 'IDUbicacion es obligatorio',
          codigo: 'MISSING_ID_UBICACION'
        });
      }

      if (!ubicacion.getAttribute('FechaHoraSalidaLlegada')) {
        errores.push({
          tipo: 'atributo',
          nodo: `Ubicacion[${i}]`,
          mensaje: 'FechaHoraSalidaLlegada es obligatorio',
          codigo: 'MISSING_FECHA_HORA'
        });
      }

      // Validar domicilio
      const domicilio = ubicacion.getElementsByTagName('Domicilio')[0];
      if (!domicilio) {
        errores.push({
          tipo: 'estructura',
          nodo: `Ubicacion[${i}]`,
          mensaje: 'Domicilio es obligatorio',
          codigo: 'MISSING_DOMICILIO'
        });
      } else {
        const cp = domicilio.getAttribute('CodigoPostal');
        if (!cp || !PATRONES.CODIGO_POSTAL.test(cp)) {
          errores.push({
            tipo: 'patron',
            nodo: `Ubicacion[${i}].Domicilio`,
            mensaje: 'CodigoPostal debe ser de 5 dígitos',
            codigo: 'INVALID_CP_FORMAT'
          });
        }
      }

      // Distancia obligatoria en destinos
      if (tipo === 'Destino') {
        const distancia = ubicacion.getAttribute('DistanciaRecorrida');
        if (!distancia || parseFloat(distancia) <= 0) {
          errores.push({
            tipo: 'valor',
            nodo: `Ubicacion[${i}]`,
            mensaje: 'DistanciaRecorrida es obligatoria y debe ser mayor a 0 en destinos',
            codigo: 'INVALID_DISTANCIA'
          });
        }
      }
    }

    if (!tieneOrigen) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Ubicaciones',
        mensaje: 'Debe haber al menos una ubicación de tipo Origen',
        codigo: 'MISSING_ORIGEN'
      });
    }

    if (!tieneDestino) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Ubicaciones',
        mensaje: 'Debe haber al menos una ubicación de tipo Destino',
        codigo: 'MISSING_DESTINO'
      });
    }
  }

  /**
   * Validar mercancías del Carta Porte
   */
  private static async validarMercancias(
    cartaPorte: Element,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    const mercanciasContainer = cartaPorte.getElementsByTagName('Mercancias')[0];
    
    if (!mercanciasContainer) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Mercancias',
        mensaje: 'Elemento Mercancias es obligatorio',
        codigo: 'MISSING_MERCANCIAS'
      });
      return;
    }

    // Validar atributos contenedor
    const pesoBrutoTotal = mercanciasContainer.getAttribute('PesoBrutoTotal');
    if (!pesoBrutoTotal || parseFloat(pesoBrutoTotal) <= 0) {
      errores.push({
        tipo: 'valor',
        nodo: 'Mercancias',
        mensaje: 'PesoBrutoTotal es obligatorio y debe ser mayor a 0',
        codigo: 'INVALID_PESO_BRUTO'
      });
    }

    const numTotalMercancias = mercanciasContainer.getAttribute('NumTotalMercancias');
    if (!numTotalMercancias) {
      errores.push({
        tipo: 'atributo',
        nodo: 'Mercancias',
        mensaje: 'NumTotalMercancias es obligatorio',
        codigo: 'MISSING_NUM_MERCANCIAS'
      });
    }

    // Validar mercancías individuales
    const mercancias = mercanciasContainer.getElementsByTagName('Mercancia');
    if (mercancias.length === 0) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Mercancias',
        mensaje: 'Debe haber al menos una Mercancia',
        codigo: 'MIN_MERCANCIAS'
      });
    }

    for (let i = 0; i < mercancias.length; i++) {
      const mercancia = mercancias[i];

      if (!mercancia.getAttribute('BienesTransp')) {
        errores.push({
          tipo: 'atributo',
          nodo: `Mercancia[${i}]`,
          mensaje: 'BienesTransp es obligatorio',
          codigo: 'MISSING_BIENES_TRANSP'
        });
      }

      if (!mercancia.getAttribute('Descripcion')) {
        errores.push({
          tipo: 'atributo',
          nodo: `Mercancia[${i}]`,
          mensaje: 'Descripcion es obligatoria',
          codigo: 'MISSING_DESCRIPCION'
        });
      }

      const cantidad = mercancia.getAttribute('Cantidad');
      if (!cantidad || parseFloat(cantidad) <= 0) {
        errores.push({
          tipo: 'valor',
          nodo: `Mercancia[${i}]`,
          mensaje: 'Cantidad debe ser mayor a 0',
          codigo: 'INVALID_CANTIDAD'
        });
      }

      if (!mercancia.getAttribute('ClaveUnidad')) {
        errores.push({
          tipo: 'atributo',
          nodo: `Mercancia[${i}]`,
          mensaje: 'ClaveUnidad es obligatoria',
          codigo: 'MISSING_CLAVE_UNIDAD'
        });
      }

      const pesoKg = mercancia.getAttribute('PesoEnKg');
      if (!pesoKg || parseFloat(pesoKg) <= 0) {
        errores.push({
          tipo: 'valor',
          nodo: `Mercancia[${i}]`,
          mensaje: 'PesoEnKg debe ser mayor a 0',
          codigo: 'INVALID_PESO_KG'
        });
      }
    }

    // Validar Autotransporte
    const autotransporte = mercanciasContainer.getElementsByTagName('Autotransporte')[0];
    if (autotransporte) {
      await this.validarAutotransporte(autotransporte, errores, advertencias);
    }
  }

  /**
   * Validar autotransporte
   */
  private static async validarAutotransporte(
    autotransporte: Element,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    if (!autotransporte.getAttribute('PermSCT')) {
      errores.push({
        tipo: 'atributo',
        nodo: 'Autotransporte',
        mensaje: 'PermSCT es obligatorio',
        codigo: 'MISSING_PERM_SCT'
      });
    }

    if (!autotransporte.getAttribute('NumPermisoSCT')) {
      errores.push({
        tipo: 'atributo',
        nodo: 'Autotransporte',
        mensaje: 'NumPermisoSCT es obligatorio',
        codigo: 'MISSING_NUM_PERMISO'
      });
    }

    // Validar IdentificacionVehicular
    const identificacion = autotransporte.getElementsByTagName('IdentificacionVehicular')[0];
    if (!identificacion) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Autotransporte',
        mensaje: 'IdentificacionVehicular es obligatorio',
        codigo: 'MISSING_ID_VEHICULAR'
      });
    } else {
      if (!identificacion.getAttribute('ConfigVehicular')) {
        errores.push({
          tipo: 'atributo',
          nodo: 'IdentificacionVehicular',
          mensaje: 'ConfigVehicular es obligatorio',
          codigo: 'MISSING_CONFIG'
        });
      }

      if (!identificacion.getAttribute('PlacaVM')) {
        errores.push({
          tipo: 'atributo',
          nodo: 'IdentificacionVehicular',
          mensaje: 'PlacaVM es obligatoria',
          codigo: 'MISSING_PLACA'
        });
      }

      if (!identificacion.getAttribute('AnioModeloVM')) {
        errores.push({
          tipo: 'atributo',
          nodo: 'IdentificacionVehicular',
          mensaje: 'AnioModeloVM es obligatorio',
          codigo: 'MISSING_ANIO'
        });
      }
    }

    // Validar Seguros
    const seguros = autotransporte.getElementsByTagName('Seguros')[0];
    if (!seguros) {
      errores.push({
        tipo: 'estructura',
        nodo: 'Autotransporte',
        mensaje: 'Seguros es obligatorio',
        codigo: 'MISSING_SEGUROS'
      });
    } else {
      if (!seguros.getAttribute('AseguraRespCivil')) {
        advertencias.push({
          tipo: 'atributo',
          nodo: 'Seguros',
          mensaje: 'AseguraRespCivil es recomendado',
          codigo: 'MISSING_ASEGURA'
        });
      }
    }
  }

  /**
   * Validar figuras de transporte
   */
  private static async validarFiguras(
    cartaPorte: Element,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    const figuraTransporte = cartaPorte.getElementsByTagName('FiguraTransporte')[0];
    if (!figuraTransporte) {
      errores.push({
        tipo: 'estructura',
        nodo: 'FiguraTransporte',
        mensaje: 'FiguraTransporte es obligatorio',
        codigo: 'MISSING_FIGURA_TRANSPORTE'
      });
      return;
    }

    const tiposFigura = figuraTransporte.getElementsByTagName('TiposFigura');
    if (tiposFigura.length === 0) {
      errores.push({
        tipo: 'estructura',
        nodo: 'FiguraTransporte',
        mensaje: 'Debe haber al menos un TiposFigura',
        codigo: 'MIN_TIPOS_FIGURA'
      });
    }

    let tieneOperador = false;

    for (let i = 0; i < tiposFigura.length; i++) {
      const figura = tiposFigura[i];
      const tipoFigura = figura.getAttribute('TipoFigura');

      if (tipoFigura === '01') tieneOperador = true;

      if (!tipoFigura) {
        errores.push({
          tipo: 'atributo',
          nodo: `TiposFigura[${i}]`,
          mensaje: 'TipoFigura es obligatorio',
          codigo: 'MISSING_TIPO_FIGURA'
        });
      }

      const rfcFigura = figura.getAttribute('RFCFigura');
      if (!rfcFigura) {
        errores.push({
          tipo: 'atributo',
          nodo: `TiposFigura[${i}]`,
          mensaje: 'RFCFigura es obligatorio',
          codigo: 'MISSING_RFC_FIGURA'
        });
      } else if (!PATRONES.RFC_PERSONA_FISICA.test(rfcFigura) && 
                 !PATRONES.RFC_PERSONA_MORAL.test(rfcFigura) &&
                 !PATRONES.RFC_GENERICO.test(rfcFigura)) {
        errores.push({
          tipo: 'patron',
          nodo: `TiposFigura[${i}]`,
          mensaje: 'Formato de RFC inválido',
          codigo: 'INVALID_RFC_FIGURA'
        });
      }

      // Licencia obligatoria para operadores
      if (tipoFigura === '01' && !figura.getAttribute('NumLicencia')) {
        errores.push({
          tipo: 'atributo',
          nodo: `TiposFigura[${i}]`,
          mensaje: 'NumLicencia es obligatorio para operadores (TipoFigura=01)',
          codigo: 'MISSING_NUM_LICENCIA'
        });
      }
    }

    if (!tieneOperador) {
      errores.push({
        tipo: 'valor',
        nodo: 'FiguraTransporte',
        mensaje: 'Debe haber al menos un operador (TipoFigura=01)',
        codigo: 'NO_OPERADOR'
      });
    }
  }

  /**
   * Validar valores y patrones
   */
  private static async validarValoresYPatrones(
    xmlDoc: Document,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    // Validar RFCs
    const emisor = xmlDoc.getElementsByTagName('cfdi:Emisor')[0];
    if (emisor) {
      const rfcEmisor = emisor.getAttribute('Rfc');
      if (rfcEmisor && !PATRONES.RFC_PERSONA_MORAL.test(rfcEmisor) && !PATRONES.RFC_PERSONA_FISICA.test(rfcEmisor)) {
        errores.push({
          tipo: 'patron',
          nodo: 'cfdi:Emisor',
          mensaje: `RFC del emisor "${rfcEmisor}" no tiene formato válido`,
          codigo: 'INVALID_RFC_EMISOR_FORMAT'
        });
      }
    }

    const receptor = xmlDoc.getElementsByTagName('cfdi:Receptor')[0];
    if (receptor) {
      const rfcReceptor = receptor.getAttribute('Rfc');
      if (rfcReceptor && !PATRONES.RFC_PERSONA_MORAL.test(rfcReceptor) && 
          !PATRONES.RFC_PERSONA_FISICA.test(rfcReceptor) &&
          !PATRONES.RFC_GENERICO.test(rfcReceptor)) {
        errores.push({
          tipo: 'patron',
          nodo: 'cfdi:Receptor',
          mensaje: `RFC del receptor "${rfcReceptor}" no tiene formato válido`,
          codigo: 'INVALID_RFC_RECEPTOR_FORMAT'
        });
      }
    }
  }

  /**
   * Validar coherencia con datos originales
   */
  private static async validarCoherencia(
    xmlDoc: Document,
    cartaPorteData: CartaPorteData,
    errores: XsdValidationError[],
    advertencias: XsdValidationError[]
  ): Promise<void> {
    // Verificar que el número de mercancías coincida
    const mercanciasXml = xmlDoc.getElementsByTagName('Mercancia');
    const mercanciasData = cartaPorteData.mercancias?.length || 0;

    if (mercanciasXml.length !== mercanciasData) {
      advertencias.push({
        tipo: 'valor',
        nodo: 'Mercancias',
        mensaje: `Número de mercancías en XML (${mercanciasXml.length}) no coincide con datos originales (${mercanciasData})`,
        codigo: 'MERCANCIAS_MISMATCH'
      });
    }

    // Verificar ubicaciones
    const ubicacionesXml = xmlDoc.getElementsByTagName('Ubicacion');
    const ubicacionesData = cartaPorteData.ubicaciones?.length || 0;

    if (ubicacionesXml.length !== ubicacionesData) {
      advertencias.push({
        tipo: 'valor',
        nodo: 'Ubicaciones',
        mensaje: `Número de ubicaciones en XML (${ubicacionesXml.length}) no coincide con datos originales (${ubicacionesData})`,
        codigo: 'UBICACIONES_MISMATCH'
      });
    }
  }

  /**
   * Validar un nodo contra su estructura esperada
   */
  private static validarNodo(
    nodo: Element,
    nombreNodo: string,
    estructura: any,
    errores: XsdValidationError[]
  ): void {
    // Validar atributos requeridos
    for (const attr of estructura.atributosRequeridos || []) {
      if (!nodo.hasAttribute(attr)) {
        errores.push({
          tipo: 'atributo',
          nodo: nombreNodo,
          mensaje: `Atributo requerido "${attr}" no encontrado`,
          codigo: `MISSING_${attr.toUpperCase()}`
        });
      }
    }

    // Validar hijos requeridos
    for (const hijo of estructura.hijosRequeridos || []) {
      const hijoElemento = nodo.getElementsByTagName(hijo)[0];
      if (!hijoElemento) {
        errores.push({
          tipo: 'estructura',
          nodo: nombreNodo,
          mensaje: `Elemento hijo requerido "${hijo}" no encontrado`,
          codigo: `MISSING_${hijo.replace(':', '_').toUpperCase()}`
        });
      }
    }
  }
}
