
import * as XLSX from 'xlsx';
import { Mercancia } from '@/hooks/useMercancias';

export interface ColumnMapping {
  [key: string]: keyof Mercancia;
}

export const defaultColumnMapping: ColumnMapping = {
  'Clave Producto/Servicio': 'bienes_transp',
  'Descripción': 'descripcion',
  'Cantidad': 'cantidad',
  'Clave Unidad': 'clave_unidad',
  'Peso (kg)': 'peso_kg',
  'Valor': 'valor_mercancia',
  'Moneda': 'moneda',
  'Material Peligroso': 'material_peligroso',
  'Clave Material Peligroso': 'cve_material_peligroso',
  'Embalaje': 'embalaje',
  'Fracción Arancelaria': 'fraccion_arancelaria',
  'UUID Comercio Exterior': 'uuid_comercio_ext'
};

export class ExcelParser {
  static async parseFile(file: File): Promise<{ headers: string[], data: any[][] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convertir a JSON manteniendo headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('El archivo está vacío'));
            return;
          }
          
          const headers = jsonData[0] as string[];
          const data = jsonData.slice(1) as any[][];
          
          resolve({ headers, data });
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel/CSV'));
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  static mapDataToMercancias(
    headers: string[], 
    data: any[][], 
    columnMapping: ColumnMapping
  ): Mercancia[] {
    const mercancias: Mercancia[] = [];
    
    for (const row of data) {
      if (row.every(cell => !cell || cell.toString().trim() === '')) {
        continue; // Saltar filas vacías
      }
      
      const mercancia: Partial<Mercancia> = {};
      
      headers.forEach((header, index) => {
        const mappedField = columnMapping[header];
        if (mappedField && row[index] !== undefined && row[index] !== null && row[index] !== '') {
          const value = row[index];
          
          // Convertir tipos según el campo
          switch (mappedField) {
            case 'cantidad':
            case 'peso_kg':
            case 'valor_mercancia':
              mercancia[mappedField] = parseFloat(value) || 0;
              break;
            case 'material_peligroso':
              mercancia[mappedField] = this.parseBoolean(value);
              break;
            default:
              mercancia[mappedField] = value.toString().trim();
          }
        }
      });
      
      // Validar que al menos tenga los campos mínimos
      if (mercancia.bienes_transp || mercancia.descripcion) {
        mercancias.push(mercancia as Mercancia);
      }
    }
    
    return mercancias;
  }

  static parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue === 'true' || lowerValue === 'sí' || lowerValue === 'si' || 
             lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'x';
    }
    if (typeof value === 'number') return value === 1;
    return false;
  }

  static generateTemplate(): Uint8Array {
    const templateData = [
      // Headers
      Object.keys(defaultColumnMapping),
      // Ejemplo de datos
      [
        '43211508',
        'Azúcar estándar',
        '1000',
        'KGM',
        '1000',
        '25000',
        'MXN',
        'false',
        '',
        '',
        '',
        ''
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // Configurar ancho de columnas
    const columnWidths = Object.keys(defaultColumnMapping).map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;
    
    // Estilo para headers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E2E8F0' } }
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mercancías');
    
    return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  }

  static validateFileFormat(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'Formato de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV.'
      };
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB.'
      };
    }
    
    return { valid: true };
  }
}
