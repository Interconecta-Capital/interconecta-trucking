/**
 * FASE 3: Utilidad para normalizar formatos de domicilio
 * Asegura compatibilidad entre camelCase y snake_case
 */

interface DomicilioAny {
  codigoPostal?: string;
  codigo_postal?: string;
  numExterior?: string;
  num_exterior?: string;
  numInterior?: string;
  num_interior?: string;
  [key: string]: any;
}

/**
 * Normaliza un objeto domicilio asegurando que existan AMBOS formatos
 * (camelCase y snake_case) para compatibilidad con BD y UI
 */
export function normalizeDomicilio(domicilio: DomicilioAny | null | undefined): DomicilioAny {
  if (!domicilio) return {};
  
  const normalized = { ...domicilio };
  
  // ✅ Asegurar que existan AMBOS formatos para código postal
  if (normalized.codigoPostal && !normalized.codigo_postal) {
    normalized.codigo_postal = normalized.codigoPostal;
  }
  if (normalized.codigo_postal && !normalized.codigoPostal) {
    normalized.codigoPostal = normalized.codigo_postal;
  }
  
  // ✅ Asegurar que existan AMBOS formatos para número exterior
  if (normalized.numExterior && !normalized.num_exterior) {
    normalized.num_exterior = normalized.numExterior;
  }
  if (normalized.num_exterior && !normalized.numExterior) {
    normalized.numExterior = normalized.num_exterior;
  }
  
  // ✅ Asegurar que existan AMBOS formatos para número interior
  if (normalized.numInterior && !normalized.num_interior) {
    normalized.num_interior = normalized.numInterior;
  }
  if (normalized.num_interior && !normalized.numInterior) {
    normalized.numInterior = normalized.num_interior;
  }
  
  return normalized;
}

/**
 * Normaliza un array de domicilios
 */
export function normalizeDomicilioArray(domicilios: DomicilioAny[]): DomicilioAny[] {
  return domicilios.map(normalizeDomicilio);
}

/**
 * Obtiene un valor de campo de domicilio sin importar el formato
 */
export function getDomicilioField(domicilio: DomicilioAny | null | undefined, field: string): any {
  if (!domicilio) return undefined;
  
  // Intentar ambos formatos
  const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase();
  const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  
  return domicilio[field] || domicilio[snakeCase] || domicilio[camelCase];
}
