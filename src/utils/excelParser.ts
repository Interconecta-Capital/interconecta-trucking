
import { Mercancia } from '@/hooks/useMercancias';

// Mapeo de columnas de Excel a campos de Mercancia
const COLUMN_MAPPING: { [key: string]: keyof Mercancia } = {
  'descripcion': 'descripcion',
  'descripción': 'descripcion',
  'producto': 'descripcion',
  'mercancia': 'descripcion',
  'bienes_transp': 'bienes_transp',
  'clave_producto': 'bienes_transp',
  'clave_sat': 'bienes_transp',
  'cantidad': 'cantidad',
  'qty': 'cantidad',
  'clave_unidad': 'clave_unidad',
  'unidad': 'clave_unidad',
  'peso_kg': 'peso_kg',
  'peso': 'peso_kg',
  'valor_mercancia': 'valor_mercancia',
  'valor': 'valor_mercancia',
  'precio': 'valor_mercancia',
  'moneda': 'moneda',
  'currency': 'moneda',
  'embalaje': 'embalaje',
  'fraccion_arancelaria': 'fraccion_arancelaria',
  'uuid_comercio_ext': 'uuid_comercio_ext'
};

export interface ParsedExcelRow {
  mercancia: Partial<Mercancia>;
  errors: string[];
  rowIndex: number;
}

export const parseExcelToMercancias = (data: any[]): ParsedExcelRow[] => {
  const results: ParsedExcelRow[] = [];
  
  if (!data || data.length === 0) {
    return results;
  }

  // Assume first row contains headers
  const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());
  
  data.forEach((row, index) => {
    const mercancia: Partial<Mercancia> = {
      material_peligroso: false,
      moneda: 'MXN'
    };
    const errors: string[] = [];

    // Map Excel columns to mercancia fields
    headers.forEach(header => {
      const fieldName = COLUMN_MAPPING[header];
      if (fieldName && row[Object.keys(row)[headers.indexOf(header)]]) {
        const value = row[Object.keys(row)[headers.indexOf(header)]];
        
        switch (fieldName) {
          case 'cantidad':
          case 'peso_kg':
          case 'valor_mercancia':
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              (mercancia as any)[fieldName] = numValue;
            } else {
              errors.push(`Valor numérico inválido en ${header}: ${value}`);
            }
            break;
          case 'material_peligroso':
            (mercancia as any)[fieldName] = Boolean(value);
            break;
          default:
            (mercancia as any)[fieldName] = String(value).trim();
        }
      }
    });

    // Validate required fields
    if (!mercancia.descripcion) {
      errors.push('Descripción es requerida');
    }
    if (!mercancia.cantidad || mercancia.cantidad <= 0) {
      errors.push('Cantidad debe ser mayor a 0');
    }

    results.push({
      mercancia,
      errors,
      rowIndex: index + 1
    });
  });

  return results;
};

export const validateMercanciaData = (mercancia: Partial<Mercancia>): string[] => {
  const errors: string[] = [];

  if (!mercancia.descripcion?.trim()) {
    errors.push('Descripción es requerida');
  }

  if (!mercancia.cantidad || mercancia.cantidad <= 0) {
    errors.push('Cantidad debe ser mayor a 0');
  }

  if (!mercancia.clave_unidad?.trim()) {
    errors.push('Clave de unidad es requerida');
  }

  if (!mercancia.bienes_transp?.trim()) {
    errors.push('Clave de producto/servicio SAT es requerida');
  }

  return errors;
};
