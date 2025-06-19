
import { Mercancia } from '@/hooks/useMercancias';
import * as XLSX from 'xlsx';

// Mapeo de columnas de Excel a campos de Mercancia
export interface ColumnMapping {
  [key: string]: keyof Mercancia;
}

export const defaultColumnMapping: ColumnMapping = {
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

export class ExcelParser {
  static validateFileFormat(file: File): { valid: boolean; error?: string } {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Formato de archivo no válido' };
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'El archivo es demasiado grande (máx 10MB)' };
    }
    
    return { valid: true };
  }

  static async parseFile(file: File): Promise<{ headers: string[]; data: any[][] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header option
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            throw new Error('El archivo está vacío');
          }
          
          const headers = (jsonData[0] as string[]).map(h => String(h).toLowerCase().trim());
          const rows = jsonData.slice(1) as any[][];
          
          resolve({ headers, data: rows });
        } catch (error) {
          reject(new Error(`Error al procesar el archivo: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  static mapDataToMercancias(
    headers: string[], 
    data: any[][], 
    columnMapping: ColumnMapping = defaultColumnMapping
  ): Mercancia[] {
    return data.map((row, index) => {
      const mercancia: Partial<Mercancia> = {
        material_peligroso: false,
        moneda: 'MXN'
      };

      headers.forEach((header, colIndex) => {
        const fieldName = columnMapping[header];
        if (fieldName && row[colIndex] != null) {
          const value = row[colIndex];
          
          switch (fieldName) {
            case 'cantidad':
            case 'peso_kg':
            case 'valor_mercancia': {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                (mercancia as any)[fieldName] = numValue;
              }
              break;
            }
            case 'material_peligroso':
              (mercancia as any)[fieldName] = Boolean(value);
              break;
            default:
              (mercancia as any)[fieldName] = String(value).trim();
          }
        }
      });

      return {
        id: `excel-${Date.now()}-${index}`,
        bienes_transp: mercancia.bienes_transp || '',
        descripcion: mercancia.descripcion || '',
        cantidad: mercancia.cantidad || 1,
        clave_unidad: mercancia.clave_unidad || '',
        peso_kg: mercancia.peso_kg || 0,
        valor_mercancia: mercancia.valor_mercancia || 0,
        material_peligroso: mercancia.material_peligroso || false,
        cve_material_peligroso: mercancia.cve_material_peligroso,
        moneda: mercancia.moneda || 'MXN',
        fraccion_arancelaria: mercancia.fraccion_arancelaria,
        embalaje: mercancia.embalaje,
        uuid_comercio_ext: mercancia.uuid_comercio_ext
      } as Mercancia;
    });
  }

  static generateTemplate(): string {
    // This would generate an Excel template - simplified for now
    const templateData = [
      ['descripcion', 'bienes_transp', 'cantidad', 'clave_unidad', 'peso_kg', 'valor_mercancia'],
      ['Ejemplo de mercancía', '78101800', '1', 'KGM', '100', '1000']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mercancías');
    
    return XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
  }
}

export const parseExcelToMercancias = (data: any[]): ParsedExcelRow[] => {
  // Legacy function for backward compatibility
  return data.map((row, index) => ({
    mercancia: row,
    errors: [],
    rowIndex: index + 1
  }));
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
