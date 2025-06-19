
export interface ClasificacionMercanciaResult {
  descripcion: string;
  confidence: number;
  sugerencias: string[];
  keywords: string[];
  bienes_transp: string;
  clave_unidad: string;
  material_peligroso: boolean;
  cve_material_peligroso?: string;
  fraccion_arancelaria?: string;
  peso_estimado?: number;
  valor_estimado?: number;
  regulaciones_especiales?: string[];
  categoria_transporte?: 'general' | 'peligroso' | 'refrigerado' | 'especializado';
  regulaciones: string[];
  tipo_embalaje?: string;
  requiere_semarnat?: boolean;
}

export class MercanciaClassifierService {
  private static instance: MercanciaClassifierService;
  
  static getInstance(): MercanciaClassifierService {
    if (!this.instance) {
      this.instance = new MercanciaClassifierService();
    }
    return this.instance;
  }

  async clasificarMercancia(descripcion: string): Promise<ClasificacionMercanciaResult> {
    try {
      // Mock implementation for now
      const result: ClasificacionMercanciaResult = {
        descripcion: descripcion,
        confidence: 0.85,
        sugerencias: ['Verificar peso específico', 'Confirmar clasificación arancelaria'],
        keywords: descripcion.split(' ').slice(0, 3),
        bienes_transp: '78101800',
        clave_unidad: 'KGM',
        material_peligroso: false,
        regulaciones_especiales: [],
        categoria_transporte: 'general',
        regulaciones: [],
        tipo_embalaje: undefined,
        requiere_semarnat: false
      };

      return result;
    } catch (error) {
      console.error('Error en clasificación:', error);
      throw new Error('Error al clasificar mercancía');
    }
  }

  async validarClasificacion(datos: any): Promise<boolean> {
    // Basic validation
    return !!(datos.bienes_transp && datos.clave_unidad && datos.descripcion);
  }
}

// Export instance for compatibility
export const mercanciaClassifier = MercanciaClassifierService.getInstance();
