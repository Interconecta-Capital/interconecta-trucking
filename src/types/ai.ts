
export interface AIContextData {
  tipo: 'mercancia' | 'autotransporte' | 'ubicacion' | 'figura';
  datos?: any;
  sugerencias?: string[];
  confidence?: number;
}

export interface AIAnalysisResult {
  confidence: number;
  sugerencias: string[];
  datos_detectados: any;
  warnings: string[];
}

export interface AIFormEnhancement {
  campos_recomendados: string[];
  validaciones_adicionales: string[];
  sugerencias_ux: string[];
}
