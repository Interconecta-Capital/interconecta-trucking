import { XMLParser } from 'fast-xml-parser';
import { CartaPorteData } from '@/types/cartaPorte';

// Configuración para el parser XML
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  allowBooleanAttributes: true,
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
};

// Parser XML instanciado
const parser = new XMLParser(parserOptions);

/**
 * Convierte un string XML a un objeto JavaScript
 */
export const parseXML = (xmlString: string): any => {
  try {
    return parser.parse(xmlString);
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
};

/**
 * Extrae información básica del CFDI
 */
export const extractCFDIInfo = (xmlObject: any): any => {
  try {
    const cfdi = xmlObject['cfdi:Comprobante'] || xmlObject.Comprobante;
    if (!cfdi) return null;
    
    const emisor = cfdi['cfdi:Emisor'] || cfdi.Emisor;
    const receptor = cfdi['cfdi:Receptor'] || cfdi.Receptor;
    
    return {
      version: cfdi['@Version'] || cfdi['@version'],
      fecha: cfdi['@Fecha'] || cfdi['@fecha'],
      tipoComprobante: cfdi['@TipoDeComprobante'] || cfdi['@tipoDeComprobante'],
      total: cfdi['@Total'] || cfdi['@total'],
      subtotal: cfdi['@SubTotal'] || cfdi['@subTotal'],
      moneda: cfdi['@Moneda'] || cfdi['@moneda'],
      emisorRFC: emisor?.['@Rfc'] || emisor?.['@rfc'],
      emisorNombre: emisor?.['@Nombre'] || emisor?.['@nombre'],
      receptorRFC: receptor?.['@Rfc'] || receptor?.['@rfc'],
      receptorNombre: receptor?.['@Nombre'] || receptor?.['@nombre'],
    };
  } catch (error) {
    console.error('Error extracting CFDI info:', error);
    return null;
  }
};

/**
 * Extrae información específica del complemento Carta Porte
 */
export const extractCartaPorteInfo = (xmlObject: any): any => {
  try {
    const cfdi = xmlObject['cfdi:Comprobante'] || xmlObject.Comprobante;
    const complemento = cfdi['cfdi:Complemento'] || cfdi.Complemento;
    const cartaPorte = complemento?.['cartaporte31:CartaPorte'] || complemento?.CartaPorte;
    
    if (!cartaPorte) return null;
    
    return {
      // Fix property names to match CartaPorteData interface
      paisOrigenDestino: cartaPorte['@PaisOrigenDestino'] || cartaPorte.paisOrigenDestino,
      viaEntradaSalida: cartaPorte['@ViaEntradaSalida'] || cartaPorte.viaEntradaSalida,
      totalDistRec: cartaPorte['@TotalDistRec'] || cartaPorte.totalDistRec,
      transpInternac: cartaPorte['@TranspInternac'] || cartaPorte.transpInternac,
      version: cartaPorte['@Version'] || cartaPorte.version,
      ubicaciones: extractUbicaciones(cartaPorte),
      mercancias: extractMercancias(cartaPorte),
      figuras: extractFiguras(cartaPorte),
    };
  } catch (error) {
    console.error('Error extracting carta porte info:', error);
    return null;
  }
};

/**
 * Extrae las ubicaciones del complemento Carta Porte
 */
const extractUbicaciones = (cartaPorte: any): any[] => {
  try {
    const ubicaciones = cartaPorte['cartaporte31:Ubicaciones'] || cartaPorte.Ubicaciones;
    if (!ubicaciones) return [];
    
    const ubicacionesArray = ubicaciones['cartaporte31:Ubicacion'] || ubicaciones.Ubicacion;
    if (!ubicacionesArray) return [];
    
    // Asegurar que siempre sea un array
    const ubicacionesNormalized = Array.isArray(ubicacionesArray) ? ubicacionesArray : [ubicacionesArray];
    
    return ubicacionesNormalized.map((ub: any) => ({
      tipoUbicacion: ub['@TipoUbicacion'] || ub.tipoUbicacion,
      idUbicacion: ub['@IDUbicacion'] || ub.idUbicacion,
      rfcRemitente: ub['@RFCRemitente'] || ub.rfcRemitente,
      rfcDestinatario: ub['@RFCDestinatario'] || ub.rfcDestinatario,
      nombreRemitente: ub['@NombreRemitente'] || ub.nombreRemitente,
      nombreDestinatario: ub['@NombreDestinatario'] || ub.nombreDestinatario,
      fechaHoraSalida: ub['@FechaHoraSalida'] || ub.fechaHoraSalida,
      fechaHoraLlegada: ub['@FechaHoraLlegada'] || ub.fechaHoraLlegada,
      distanciaRecorrida: ub['@DistanciaRecorrida'] || ub.distanciaRecorrida,
      domicilio: extractDomicilio(ub),
    }));
  } catch (error) {
    console.error('Error extracting ubicaciones:', error);
    return [];
  }
};

/**
 * Extrae el domicilio de una ubicación
 */
const extractDomicilio = (ubicacion: any): any => {
  try {
    const domicilio = ubicacion['cartaporte31:Domicilio'] || ubicacion.Domicilio;
    if (!domicilio) return {};
    
    return {
      calle: domicilio['@Calle'] || domicilio.calle,
      numeroExterior: domicilio['@NumeroExterior'] || domicilio.numeroExterior,
      numeroInterior: domicilio['@NumeroInterior'] || domicilio.numeroInterior,
      colonia: domicilio['@Colonia'] || domicilio.colonia,
      localidad: domicilio['@Localidad'] || domicilio.localidad,
      municipio: domicilio['@Municipio'] || domicilio.municipio,
      estado: domicilio['@Estado'] || domicilio.estado,
      pais: domicilio['@Pais'] || domicilio.pais,
      codigoPostal: domicilio['@CodigoPostal'] || domicilio.codigoPostal,
    };
  } catch (error) {
    console.error('Error extracting domicilio:', error);
    return {};
  }
};

/**
 * Extrae las mercancías del complemento Carta Porte
 */
const extractMercancias = (cartaPorte: any): any[] => {
  try {
    const mercancias = cartaPorte['cartaporte31:Mercancias'] || cartaPorte.Mercancias;
    if (!mercancias) return [];
    
    const mercanciaArray = mercancias['cartaporte31:Mercancia'] || mercancias.Mercancia;
    if (!mercanciaArray) return [];
    
    // Asegurar que siempre sea un array
    const mercanciasNormalized = Array.isArray(mercanciaArray) ? mercanciaArray : [mercanciaArray];
    
    return mercanciasNormalized.map((merc: any) => ({
      bienesTransp: merc['@BienesTransp'] || merc.bienesTransp,
      descripcion: merc['@Descripcion'] || merc.descripcion,
      cantidad: merc['@Cantidad'] || merc.cantidad,
      claveUnidad: merc['@ClaveUnidad'] || merc.claveUnidad,
      unidad: merc['@Unidad'] || merc.unidad,
      pesoEnKg: merc['@PesoEnKg'] || merc.pesoEnKg,
      valorMercancia: merc['@ValorMercancia'] || merc.valorMercancia,
      moneda: merc['@Moneda'] || merc.moneda,
      fraccionArancelaria: merc['@FraccionArancelaria'] || merc.fraccionArancelaria,
      materialPeligroso: merc['@MaterialPeligroso'] || merc.materialPeligroso,
      cveMaterialPeligroso: merc['@CveMaterialPeligroso'] || merc.cveMaterialPeligroso,
    }));
  } catch (error) {
    console.error('Error extracting mercancias:', error);
    return [];
  }
};

/**
 * Extrae las figuras de transporte del complemento Carta Porte
 */
const extractFiguras = (cartaPorte: any): any[] => {
  try {
    const figuras = cartaPorte['cartaporte31:FiguraTransporte'] || cartaPorte.FiguraTransporte;
    if (!figuras) return [];
    
    const figuraArray = figuras['cartaporte31:TiposFigura'] || figuras.TiposFigura;
    if (!figuraArray) return [];
    
    // Asegurar que siempre sea un array
    const figurasNormalized = Array.isArray(figuraArray) ? figuraArray : [figuraArray];
    
    return figurasNormalized.map((fig: any) => ({
      tipoFigura: fig['@TipoFigura'] || fig.tipoFigura,
      rfcFigura: fig['@RFCFigura'] || fig.rfcFigura,
      numLicencia: fig['@NumLicencia'] || fig.numLicencia,
      nombreFigura: fig['@NombreFigura'] || fig.nombreFigura,
      domicilio: extractDomicilio(fig),
    }));
  } catch (error) {
    console.error('Error extracting figuras:', error);
    return [];
  }
};

/**
 * Convierte un objeto CartaPorteData a un formato compatible con XML
 */
export const cartaPorteDataToXML = (data: CartaPorteData): any => {
  // Implementación pendiente
  return {};
};

/**
 * Valida la estructura básica de un XML de Carta Porte
 */
export const validateCartaPorteXMLStructure = (xmlObject: any): boolean => {
  try {
    const cfdi = xmlObject['cfdi:Comprobante'] || xmlObject.Comprobante;
    if (!cfdi) return false;
    
    const complemento = cfdi['cfdi:Complemento'] || cfdi.Complemento;
    if (!complemento) return false;
    
    const cartaPorte = complemento['cartaporte31:CartaPorte'] || complemento.CartaPorte;
    if (!cartaPorte) return false;
    
    return true;
  } catch (error) {
    console.error('Error validating carta porte XML structure:', error);
    return false;
  }
};
