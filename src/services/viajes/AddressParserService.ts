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
   * Parsea una dirección de texto libre a componentes estructurados (MEJORADO)
   */
  static parseAddress(addressText: string): ParsedAddress {
    const upperText = addressText.toUpperCase().trim();
    const parts = upperText.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0);

    console.group('🔍 [AddressParser] Parseando dirección');
    console.log('Texto original:', addressText);
    console.log('Partes detectadas:', parts);

    // Extraer código postal (5 dígitos) - MEJORADO
    const cpMatch = addressText.match(/\b(\d{5})\b/);
    const codigoPostal = cpMatch ? cpMatch[1] : '';
    console.log('Código Postal detectado:', codigoPostal || 'NO ENCONTRADO');

    // Extraer estado - MEJORADO
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
    console.log('Estado detectado:', estadoDetectado || 'NO ENCONTRADO');

    // Extraer número exterior (buscar patrones de números) - MEJORADO
    const numExteriorMatch = 
      addressText.match(/(?:NUM|NO\.?|N°|#)\s*(\d+[A-Z]?)/i) ||
      addressText.match(/\b(\d+[A-Z]?)\s*(?:,|$)/i) ||
      addressText.match(/\b(\d{1,5}[A-Z]?)\b/);
    const numExterior = numExteriorMatch ? numExteriorMatch[1] : 'S/N';
    console.log('Número exterior:', numExterior);

    // Extraer número interior - MEJORADO
    const numInteriorMatch = addressText.match(/(?:INT|INTERIOR)\s*(\d+[A-Z]?)/i);
    const numInterior = numInteriorMatch ? numInteriorMatch[1] : undefined;
    if (numInterior) console.log('Número interior:', numInterior);

    // Extraer colonia - MEJORADO con múltiples patrones
    let colonia = '';
    const coloniaPatterns = [
      /(?:COL\.?|COLONIA)\s+([^,;]+)/i,
      /(?:FRACC\.?|FRACCIONAMIENTO)\s+([^,;]+)/i,
      /(?:RESIDENCIAL|UNIDAD)\s+([^,;]+)/i
    ];
    
    for (const pattern of coloniaPatterns) {
      const match = addressText.match(pattern);
      if (match) {
        colonia = match[1].trim();
        break;
      }
    }

    // Fallback: segunda parte suele ser colonia si tiene CP
    if (!colonia && parts.length >= 2 && codigoPostal) {
      const segundaParte = parts[1];
      // Verificar que no sea un número o estado
      if (!/^\d+$/.test(segundaParte) && !Object.values(this.ESTADOS_MEXICO).flat().some(e => segundaParte.includes(e))) {
        colonia = segundaParte;
      }
    }
    console.log('Colonia detectada:', colonia || 'NO ENCONTRADO');

    // Extraer calle - MEJORADO separando correctamente
    let calle = '';
    const primeraParteCompleta = parts[0] || '';
    
    // Remover prefijos de tipo de vía
    const calleLimpia = primeraParteCompleta
      .replace(/^(CALLE|AV\.?|AVENIDA|BLVD\.?|BOULEVARD|PRIV\.?|PRIVADA|CALZ\.?|CALZADA|ANDADOR|CERRADA)\s*/i, '')
      .trim();
    
    // Separar calle del número
    const calleMatch = calleLimpia.match(/^([^0-9#]+)/);
    if (calleMatch) {
      calle = calleMatch[1].trim();
    } else {
      calle = calleLimpia;
    }
    console.log('Calle detectada:', calle || 'NO ENCONTRADO');

    // Extraer municipio - MEJORADO
    let municipio = '';
    
    // Buscar palabra clave "MUNICIPIO"
    const municipioMatch = addressText.match(/(?:MUNICIPIO|DELEG\.?|DELEGACION|ALCALDIA)\s+([^,;]+)/i);
    if (municipioMatch) {
      municipio = municipioMatch[1].trim();
    } else {
      // Buscar en las partes intermedias
      if (parts.length >= 3) {
        // Penúltima parte antes del estado
        const penultimaParte = parts[parts.length - 2];
        // Verificar que no sea el estado mismo
        if (!Object.values(this.ESTADOS_MEXICO).flat().some(e => penultimaParte.includes(e))) {
          municipio = penultimaParte;
        }
      }
    }
    
    // Fallback: usar estado como municipio si no se encontró
    if (!municipio && estadoDetectado) {
      municipio = estadoDetectado;
    }
    console.log('Municipio detectado:', municipio || 'NO ENCONTRADO');

    // Calcular nivel de confianza - MEJORADO
    const componentesEsenciales = {
      codigoPostal: codigoPostal !== '',
      estado: estadoDetectado !== '',
      calle: calle !== '',
      colonia: colonia !== '',
      municipio: municipio !== ''
    };
    
    const componentesDetectados = Object.values(componentesEsenciales).filter(Boolean).length;
    console.log('Componentes detectados:', componentesDetectados, '/', Object.keys(componentesEsenciales).length);

    let confianza: 'alta' | 'media' | 'baja' = 'baja';
    if (componentesDetectados >= 4 && codigoPostal) {
      confianza = 'alta';
    } else if (componentesDetectados >= 3 || (codigoPostal && calle)) {
      confianza = 'media';
    }
    console.log('Nivel de confianza:', confianza);
    console.groupEnd();

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
