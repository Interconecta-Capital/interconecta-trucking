/**
 * FASE 4: Parser inteligente de direcciones
 * Descompone texto de dirección en componentes estructurados
 */

export interface ParsedAddress {
  calle: string;
  numExterior: string;
  numInterior?: string;
  colonia: string;
  municipio: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  confianza: 'alta' | 'media' | 'baja';
  direccionOriginal: string;
}

export class AddressParserService {
  /**
   * Estados de México con sus abreviaturas comunes
   */
  private static readonly ESTADOS_MEXICO: Record<string, string[]> = {
    'Aguascalientes': ['AGS', 'AGUASCALIENTES'],
    'Baja California': ['BC', 'BAJA CALIFORNIA', 'B.C.'],
    'Baja California Sur': ['BCS', 'BAJA CALIFORNIA SUR', 'B.C.S.'],
    'Campeche': ['CAM', 'CAMPECHE'],
    'Chiapas': ['CHIS', 'CHIAPAS'],
    'Chihuahua': ['CHIH', 'CHIHUAHUA'],
    'Ciudad de México': ['CDMX', 'CIUDAD DE MEXICO', 'DF', 'D.F.', 'MEXICO DF'],
    'Coahuila': ['COAH', 'COAHUILA'],
    'Colima': ['COL', 'COLIMA'],
    'Durango': ['DGO', 'DURANGO'],
    'Guanajuato': ['GTO', 'GUANAJUATO'],
    'Guerrero': ['GRO', 'GUERRERO'],
    'Hidalgo': ['HGO', 'HIDALGO'],
    'Jalisco': ['JAL', 'JALISCO'],
    'México': ['MEX', 'MEXICO', 'EDO. DE MEXICO', 'ESTADO DE MEXICO'],
    'Michoacán': ['MICH', 'MICHOACAN'],
    'Morelos': ['MOR', 'MORELOS'],
    'Nayarit': ['NAY', 'NAYARIT'],
    'Nuevo León': ['NL', 'NUEVO LEON', 'N.L.'],
    'Oaxaca': ['OAX', 'OAXACA'],
    'Puebla': ['PUE', 'PUEBLA'],
    'Querétaro': ['QRO', 'QUERETARO'],
    'Quintana Roo': ['QROO', 'QUINTANA ROO', 'Q.ROO'],
    'San Luis Potosí': ['SLP', 'SAN LUIS POTOSI', 'S.L.P.'],
    'Sinaloa': ['SIN', 'SINALOA'],
    'Sonora': ['SON', 'SONORA'],
    'Tabasco': ['TAB', 'TABASCO'],
    'Tamaulipas': ['TAMPS', 'TAMAULIPAS'],
    'Tlaxcala': ['TLAX', 'TLAXCALA'],
    'Veracruz': ['VER', 'VERACRUZ'],
    'Yucatán': ['YUC', 'YUCATAN'],
    'Zacatecas': ['ZAC', 'ZACATECAS']
  };

  /**
   * Palabras clave que indican partes de una dirección
   */
  private static readonly KEYWORDS = {
    calle: ['CALLE', 'AV', 'AVENIDA', 'BLVD', 'BOULEVARD', 'PRIV', 'PRIVADA', 'CALZ', 'CALZADA', 'ANDADOR', 'CERRADA'],
    numero: ['NUM', 'NO', 'N°', '#', 'NUMERO', 'INT', 'INTERIOR'],
    colonia: ['COL', 'COLONIA', 'FRACC', 'FRACCIONAMIENTO', 'UNIDAD', 'RESIDENCIAL'],
    municipio: ['MUNICIPIO', 'DELEG', 'DELEGACION', 'ALCALDIA'],
    cp: ['CP', 'C.P.', 'CODIGO POSTAL']
  };

  /**
   * Parsea una dirección de texto libre a componentes estructurados
   */
  static parseAddress(addressText: string): ParsedAddress {
    const upperText = addressText.toUpperCase().trim();
    const parts = upperText.split(',').map(p => p.trim());

    // Extraer código postal (5 dígitos)
    const cpMatch = addressText.match(/\b(\d{5})\b/);
    const codigoPostal = cpMatch ? cpMatch[1] : '';

    // Extraer estado
    let estadoDetectado = '';
    let confianzaEstado = false;
    for (const [estado, variantes] of Object.entries(this.ESTADOS_MEXICO)) {
      for (const variante of variantes) {
        if (upperText.includes(variante)) {
          estadoDetectado = estado;
          confianzaEstado = true;
          break;
        }
      }
      if (confianzaEstado) break;
    }

    // Si no se detectó estado, intentar por el último elemento
    if (!estadoDetectado && parts.length > 0) {
      const ultimaParte = parts[parts.length - 1];
      for (const [estado, variantes] of Object.entries(this.ESTADOS_MEXICO)) {
        if (variantes.some(v => ultimaParte.includes(v))) {
          estadoDetectado = estado;
          break;
        }
      }
    }

    // Extraer número exterior (buscar números después de palabras clave de calle)
    const numExteriorMatch = addressText.match(/(?:NUM|NO|N°|#)\s*(\d+[A-Z]?)/i) ||
                             addressText.match(/\b(\d+[A-Z]?)\b/);
    const numExterior = numExteriorMatch ? numExteriorMatch[1] : 'S/N';

    // Extraer número interior
    const numInteriorMatch = addressText.match(/(?:INT|INTERIOR)\s*(\d+[A-Z]?)/i);
    const numInterior = numInteriorMatch ? numInteriorMatch[1] : undefined;

    // Extraer colonia
    let colonia = '';
    const coloniaMatch = addressText.match(/(?:COL|COLONIA|FRACC)\s+([^,]+)/i);
    if (coloniaMatch) {
      colonia = coloniaMatch[1].trim();
    } else if (parts.length >= 2) {
      colonia = parts[1]; // Segunda parte suele ser colonia
    }

    // Extraer calle (primera parte antes de números)
    let calle = '';
    const primeraParteCompleta = parts[0] || '';
    const calleMatch = primeraParteCompleta.match(/^([^0-9#]+)/);
    if (calleMatch) {
      calle = calleMatch[1]
        .replace(/^(CALLE|AV|AVENIDA|BLVD|PRIV|CALZ)\s*/i, '')
        .trim();
    }

    // Extraer municipio (penúltima o antepenúltima parte)
    let municipio = '';
    if (parts.length >= 3) {
      municipio = parts[parts.length - 2];
    } else if (parts.length === 2) {
      municipio = estadoDetectado; // Usar el estado como municipio si no hay más info
    }

    // Calcular nivel de confianza
    let confianza: 'alta' | 'media' | 'baja' = 'baja';
    const componentesDetectados = [
      codigoPostal,
      estadoDetectado,
      calle,
      colonia,
      municipio
    ].filter(c => c && c.length > 0).length;

    if (componentesDetectados >= 4 && codigoPostal) {
      confianza = 'alta';
    } else if (componentesDetectados >= 3) {
      confianza = 'media';
    }

    return {
      calle: calle || 'Sin especificar',
      numExterior,
      numInterior,
      colonia: colonia || 'Sin especificar',
      municipio: municipio || estadoDetectado || 'Sin especificar',
      estado: estadoDetectado || 'Sin especificar',
      codigoPostal: codigoPostal || '00000',
      pais: 'MEX',
      confianza,
      direccionOriginal: addressText
    };
  }

  /**
   * Valida si una dirección parseada tiene los datos mínimos
   */
  static isValidParsedAddress(parsed: ParsedAddress): boolean {
    return (
      parsed.codigoPostal !== '00000' &&
      parsed.estado !== 'Sin especificar' &&
      parsed.calle !== 'Sin especificar' &&
      parsed.confianza !== 'baja'
    );
  }

  /**
   * Convierte ParsedAddress a formato de domicilio de Carta Porte
   */
  static toDomicilio(parsed: ParsedAddress) {
    return {
      pais: 'MEX',
      codigo_postal: parsed.codigoPostal,
      estado: parsed.estado,
      municipio: parsed.municipio,
      colonia: parsed.colonia,
      calle: parsed.calle,
      numero_exterior: parsed.numExterior,
      numero_interior: parsed.numInterior,
      referencia: `Parseado de: ${parsed.direccionOriginal.substring(0, 50)}`
    };
  }
}
