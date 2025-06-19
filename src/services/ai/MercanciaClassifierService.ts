import { geminiCore, AIContextData } from './GeminiCoreService';

export interface ClasificacionMercanciaResult {
  bienes_transp: string;
  descripcion: string;
  clave_unidad: string;
  material_peligroso: boolean;
  cve_material_peligroso?: string;
  fraccion_arancelaria?: string;
  tipo_embalaje?: string;
  confidence: number;
  sugerencias: string[];
  requiere_semarnat: boolean;
  regulaciones_especiales: string[];
  categoria_transporte: 'general' | 'peligroso' | 'refrigerado' | 'especializado';
}

export interface ProductoConocido {
  keywords: string[];
  bienes_transp: string;
  descripcion: string;
  clave_unidad: string;
  material_peligroso: boolean;
  cve_material_peligroso?: string;
  fraccion_arancelaria?: string;
  tipo_embalaje?: string;
  categoria: string;
  requiere_semarnat: boolean;
  regulaciones: string[];
}

export class MercanciaClassifierService {
  private static instance: MercanciaClassifierService;
  
  // Base de conocimiento expandida
  private readonly baseConocimiento: ProductoConocido[] = [
    // Combustibles y derivados del petróleo
    {
      keywords: ['gasolina', 'combustible', 'nafta', 'premium', 'magna'],
      bienes_transp: '15111503',
      descripcion: 'Gasolina para vehículos automotores',
      clave_unidad: 'LTR',
      material_peligroso: true,
      cve_material_peligroso: '1203',
      fraccion_arancelaria: '27101211',
      tipo_embalaje: 'Tanque especializado',
      categoria: 'combustible',
      requiere_semarnat: true,
      regulaciones: [
        'Permiso SEMARNAT obligatorio',
        'Vehículo especializado certificado',
        'Conductor con licencia federal',
        'Seguro de responsabilidad ambiental'
      ]
    },
    {
      keywords: ['diesel', 'diésel', 'gasóleo'],
      bienes_transp: '15111504',
      descripcion: 'Combustible diesel para autotransporte',
      clave_unidad: 'LTR',
      material_peligroso: true,
      cve_material_peligroso: '1202',
      fraccion_arancelaria: '27101241',
      tipo_embalaje: 'Tanque especializado',
      categoria: 'combustible',
      requiere_semarnat: true,
      regulaciones: [
        'Permiso SEMARNAT obligatorio',
        'Documentación de origen',
        'Certificado de calidad'
      ]
    },
    
    // Productos químicos
    {
      keywords: ['ácido', 'químico', 'corrosivo', 'solvente'],
      bienes_transp: '12161500',
      descripcion: 'Productos químicos industriales',
      clave_unidad: 'KGM',
      material_peligroso: true,
      cve_material_peligroso: '8000',
      fraccion_arancelaria: '38249099',
      tipo_embalaje: 'Contenedor especializado',
      categoria: 'quimico',
      requiere_semarnat: true,
      regulaciones: [
        'Hoja de datos de seguridad',
        'Personal capacitado',
        'Equipo de protección'
      ]
    },
    
    // Productos alimenticios
    {
      keywords: ['alimento', 'comida', 'bebida', 'refrigerado', 'congelado'],
      bienes_transp: '50000000',
      descripcion: 'Productos alimenticios procesados',
      clave_unidad: 'KGM',
      material_peligroso: false,
      fraccion_arancelaria: '21069099',
      tipo_embalaje: 'Caja refrigerada',
      categoria: 'alimenticio',
      requiere_semarnat: false,
      regulaciones: [
        'Certificado sanitario SENASICA',
        'Control de temperatura',
        'Documentación COFEPRIS'
      ]
    },
    
    // Productos farmacéuticos
    {
      keywords: ['medicamento', 'farmacéutico', 'medicina', 'fármaco'],
      bienes_transp: '51000000',
      descripcion: 'Productos farmacéuticos',
      clave_unidad: 'PZA',
      material_peligroso: false,
      fraccion_arancelaria: '30049099',
      tipo_embalaje: 'Caja con control de temperatura',
      categoria: 'farmaceutico',
      requiere_semarnat: false,
      regulaciones: [
        'Autorización COFEPRIS',
        'Cadena de frío certificada',
        'Documentación de trazabilidad'
      ]
    },
    
    // Metales y materiales de construcción
    {
      keywords: ['acero', 'metal', 'hierro', 'aluminio', 'construcción'],
      bienes_transp: '30102100',
      descripcion: 'Productos metálicos para construcción',
      clave_unidad: 'KGM',
      material_peligroso: false,
      fraccion_arancelaria: '72082500',
      tipo_embalaje: 'Palet industrial',
      categoria: 'construccion',
      requiere_semarnat: false,
      regulaciones: [
        'Certificado de calidad del material',
        'Verificar distribución de peso'
      ]
    },
    
    // Productos electrónicos
    {
      keywords: ['electrónico', 'computadora', 'televisión', 'celular', 'tecnología'],
      bienes_transp: '43000000',
      descripcion: 'Equipos electrónicos',
      clave_unidad: 'PZA',
      material_peligroso: false,
      fraccion_arancelaria: '85176290',
      tipo_embalaje: 'Caja con protección antiestática',
      categoria: 'electronico',
      requiere_semarnat: false,
      regulaciones: [
        'Comprobante de origen',
        'Protección contra impactos'
      ]
    }
  ];

  static getInstance(): MercanciaClassifierService {
    if (!MercanciaClassifierService.instance) {
      MercanciaClassifierService.instance = new MercanciaClassifierService();
    }
    return MercanciaClassifierService.instance;
  }

  async clasificarMercancia(
    descripcion: string,
    context?: AIContextData
  ): Promise<ClasificacionMercanciaResult> {
    const descLower = descripcion.toLowerCase();
    
    // Primero buscar en base de conocimiento local
    const matchLocal = this.buscarEnBaseConocimiento(descLower);
    
    if (matchLocal) {
      return {
        bienes_transp: matchLocal.bienes_transp,
        descripcion: this.mejorarDescripcion(descripcion, matchLocal),
        clave_unidad: matchLocal.clave_unidad,
        material_peligroso: matchLocal.material_peligroso,
        cve_material_peligroso: matchLocal.cve_material_peligroso,
        fraccion_arancelaria: matchLocal.fraccion_arancelaria,
        tipo_embalaje: matchLocal.tipo_embalaje,
        confidence: 92,
        sugerencias: this.generarSugerenciasContextuales(matchLocal),
        requiere_semarnat: matchLocal.requiere_semarnat,
        regulaciones_especiales: matchLocal.regulaciones,
        categoria_transporte: this.mapearCategoria(matchLocal.categoria)
      };
    }

    // Si no hay match local, usar Gemini AI
    try {
      const result = await this.usarGeminiParaClasificacion(descripcion, context);
      return this.procesarResultadoGemini(result, descripcion);
    } catch (error) {
      console.error('Error en clasificación Gemini:', error);
      return this.clasificacionGenerica(descripcion);
    }
  }

  private async usarGeminiParaClasificacion(descripcion: string, context?: AIContextData) {
    // Método público alternativo para acceder a Gemini
    return await geminiCore.analyzeTextForRegulatedKeywords(descripcion);
  }

  private buscarEnBaseConocimiento(descripcion: string): ProductoConocido | null {
    for (const producto of this.baseConocimiento) {
      const match = producto.keywords.some(keyword => 
        descripcion.includes(keyword.toLowerCase())
      );
      if (match) return producto;
    }
    return null;
  }

  private mejorarDescripcion(original: string, producto: ProductoConocido): string {
    if (producto.requiere_semarnat) {
      return `${original} (Material regulado - Requiere autorización SEMARNAT)`;
    }
    return original;
  }

  private generarSugerenciasContextuales(producto: ProductoConocido): string[] {
    const sugerencias = [...producto.regulaciones];
    
    if (producto.material_peligroso) {
      sugerencias.push('Verificar licencia del conductor para materiales peligrosos');
      sugerencias.push('Asegurar equipo de emergencia en el vehículo');
    }
    
    if (producto.categoria === 'alimenticio') {
      sugerencias.push('Verificar certificaciones sanitarias vigentes');
    }
    
    return sugerencias;
  }

  private mapearCategoria(categoria: string): 'general' | 'peligroso' | 'refrigerado' | 'especializado' {
    switch (categoria) {
      case 'combustible':
      case 'quimico':
        return 'peligroso';
      case 'alimenticio':
      case 'farmaceutico':
        return 'refrigerado';
      case 'construccion':
        return 'especializado';
      default:
        return 'general';
    }
  }

  private procesarResultadoGemini(result: any, descripcionOriginal: string): ClasificacionMercanciaResult {
    return {
      bienes_transp: result.bienes_transp || '78101800',
      descripcion: result.descripcion || descripcionOriginal,
      clave_unidad: result.clave_unidad || 'PZA',
      material_peligroso: result.material_peligroso || false,
      cve_material_peligroso: result.cve_material_peligroso,
      fraccion_arancelaria: result.fraccion_arancelaria,
      tipo_embalaje: result.tipo_embalaje,
      confidence: result.confidence || 75,
      sugerencias: result.sugerencias || [],
      requiere_semarnat: result.requiere_semarnat || false,
      regulaciones_especiales: result.regulaciones_especiales || [],
      categoria_transporte: result.categoria_transporte || 'general'
    };
  }

  private clasificacionGenerica(descripcion: string): ClasificacionMercanciaResult {
    return {
      bienes_transp: '78101800',
      descripcion: descripcion,
      clave_unidad: 'PZA',
      material_peligroso: false,
      confidence: 60,
      sugerencias: [
        'Clasificación genérica aplicada',
        'Revisar manualmente la clave SAT',
        'Considerar consultar catálogo oficial'
      ],
      requiere_semarnat: false,
      regulaciones_especiales: [],
      categoria_transporte: 'general'
    };
  }

  async analizarRegulaciones(descripcion: string): Promise<{
    requiere_semarnat: boolean;
    palabras_reguladas: string[];
    regulaciones: string[];
  }> {
    try {
      const result = await geminiCore.analyzeTextForRegulatedKeywords(descripcion);
      
      const regulaciones = [];
      if (result.hasRegulatedKeywords) {
        regulaciones.push('Material regulado detectado');
        regulaciones.push('Verificar permisos SEMARNAT');
      }

      return {
        requiere_semarnat: result.hasRegulatedKeywords,
        palabras_reguladas: result.regulatedKeywords,
        regulaciones
      };
    } catch (error) {
      return {
        requiere_semarnat: false,
        palabras_reguladas: [],
        regulaciones: []
      };
    }
  }
}

export const mercanciaClassifier = MercanciaClassifierService.getInstance();
