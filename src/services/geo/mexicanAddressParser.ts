/**
 * Parser de direcciones mexicanas
 * Detecta y extrae componentes de direcciones completas en formato libre
 */

interface ParsedAddress {
  calle?: string;
  numExterior?: string;
  numInterior?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  codigoPostal?: string;
  confidence: 'high' | 'medium' | 'low';
}

export class MexicanAddressParser {
  // Estados mexicanos para detección
  private static readonly ESTADOS_MX = [
    'aguascalientes', 'baja california', 'baja california sur', 'campeche',
    'chiapas', 'chihuahua', 'ciudad de méxico', 'cdmx', 'coahuila', 'colima',
    'durango', 'guanajuato', 'guerrero', 'hidalgo', 'jalisco', 'méxico',
    'estado de méxico', 'michoacán', 'morelos', 'nayarit', 'nuevo león', 
    'oaxaca', 'puebla', 'querétaro', 'quintana roo', 'san luis potosí', 
    'sinaloa', 'sonora', 'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz', 
    'yucatán', 'zacatecas'
  ];

  /**
   * Normaliza texto removiendo acentos y convirtiendo a minúsculas
   */
  private static normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  /**
   * Capitaliza correctamente nombres propios
   */
  private static capitalize(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Analiza una dirección completa y extrae sus componentes
   */
  static parseAddress(fullAddress: string): ParsedAddress | null {
    if (!fullAddress || fullAddress.trim().length === 0) {
      return null;
    }

    console.log('🔍 Parseando dirección mexicana:', fullAddress);
    
    const normalized = this.normalize(fullAddress);
    const result: ParsedAddress = { confidence: 'low' };
    
    // 1. Extraer código postal (patrón: 5 dígitos)
    const cpMatch = fullAddress.match(/\b(\d{5})\b/);
    if (cpMatch) {
      result.codigoPostal = cpMatch[1];
      result.confidence = 'medium';
      console.log('✅ Código postal encontrado:', result.codigoPostal);
    }
    
    // 2. Detectar estado mexicano
    for (const estado of this.ESTADOS_MX) {
      const normalizedEstado = this.normalize(estado);
      if (normalized.includes(normalizedEstado)) {
        result.estado = this.capitalize(estado);
        console.log('✅ Estado encontrado:', result.estado);
        break;
      }
    }
    
    // 3. Parsear partes separadas por comas
    const parts = fullAddress.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    if (parts.length === 0) {
      return result.confidence !== 'low' ? result : null;
    }

    // 4. Primera parte: generalmente calle y número
    if (parts.length > 0) {
      const streetPart = parts[0];
      
      // Buscar número exterior (patrón: número al final o con guión)
      const numMatch = streetPart.match(/(\d+(?:[-\d]*)?)\s*$/);
      if (numMatch) {
        result.numExterior = numMatch[1].trim();
        result.calle = streetPart.replace(numMatch[0], '').trim();
        console.log('✅ Calle y número:', result.calle, result.numExterior);
      } else {
        result.calle = streetPart;
        console.log('✅ Calle (sin número):', result.calle);
      }
    }
    
    // 5. Segunda parte: generalmente colonia
    if (parts.length >= 2) {
      const possibleColonia = parts[1];
      
      // Verificar que no sea el código postal ni un estado
      if (!cpMatch || !possibleColonia.includes(cpMatch[1])) {
        const normalizedPart = this.normalize(possibleColonia);
        const isEstado = this.ESTADOS_MX.some(e => 
          normalizedPart.includes(this.normalize(e))
        );
        
        if (!isEstado) {
          result.colonia = possibleColonia;
          console.log('✅ Colonia:', result.colonia);
        }
      }
    }
    
    // 6. Buscar municipio (generalmente después de colonia, antes de estado)
    if (parts.length >= 3 && result.estado) {
      // Buscar la parte que contiene el estado
      const stateIndex = parts.findIndex(p => 
        this.normalize(p).includes(this.normalize(result.estado!))
      );
      
      if (stateIndex > 0) {
        // El municipio suele estar justo antes del estado
        const municipioPart = parts[stateIndex - 1];
        
        // Remover código postal si está incluido
        let municipio = municipioPart;
        if (result.codigoPostal && municipio.includes(result.codigoPostal)) {
          municipio = municipio.replace(result.codigoPostal, '').trim();
        }
        
        if (municipio.length > 0 && municipio !== result.colonia) {
          result.municipio = municipio;
          console.log('✅ Municipio:', result.municipio);
        }
      }
    }
    
    // 7. Evaluar confianza final
    const camposCompletos = [
      result.calle,
      result.codigoPostal,
      result.estado,
      result.municipio
    ].filter(Boolean).length;
    
    if (camposCompletos >= 4) {
      result.confidence = 'high';
    } else if (camposCompletos >= 2) {
      result.confidence = 'medium';
    } else {
      result.confidence = 'low';
    }
    
    console.log('🎯 Parsing completado:', {
      confidence: result.confidence,
      camposCompletos,
      resultado: result
    });
    
    return result.confidence !== 'low' ? result : null;
  }

  /**
   * Verifica si un texto parece ser una dirección completa
   */
  static looksLikeFullAddress(text: string): boolean {
    const hasCommas = text.includes(',');
    const hasCP = /\d{5}/.test(text);
    const hasEstado = this.ESTADOS_MX.some(estado => 
      this.normalize(text).includes(this.normalize(estado))
    );
    
    return (hasCommas && hasCP) || (hasCommas && hasEstado);
  }

  /**
   * Obtiene un resumen del parsing
   */
  static getSummary(address: string): string {
    const parsed = this.parseAddress(address);
    
    if (!parsed) {
      return 'No se pudo parsear la dirección';
    }
    
    const parts = [
      parsed.calle,
      parsed.numExterior,
      parsed.colonia,
      parsed.municipio,
      parsed.estado,
      parsed.codigoPostal
    ].filter(Boolean);
    
    return `${parts.length} componentes detectados (confianza: ${parsed.confidence})`;
  }
}
