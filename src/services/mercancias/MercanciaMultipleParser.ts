/**
 * FASE 1: Parser Inteligente de Mercancías Múltiples
 * Detecta y separa automáticamente múltiples productos de una sola descripción
 */

export interface MercanciaParseada {
  descripcion: string;
  cantidad: number;
  unidad: string;
  categoria?: string;
  keywords: string[];
}

export class MercanciaMultipleParser {
  // Patrones para detectar separadores entre productos
  private static readonly SEPARADORES = /[,;]|\s+y\s+|\s+más\s+|\s+además\s+de\s+|\s+\+\s+/gi;
  
  // Patrones para extraer cantidades con unidades
  private static readonly PATRON_CANTIDAD = /(\d+(?:\.\d+)?)\s*(toneladas?|ton|t|kg|kilogramos?|gramos?|g|cajas?|piezas?|unidades?|litros?|l|metros?|m)/gi;
  
  // Unidades de medida SAT
  private static readonly UNIDADES_SAT: Record<string, string> = {
    'toneladas': 'TNE',
    'tonelada': 'TNE',
    'ton': 'TNE',
    't': 'TNE',
    'kilogramos': 'KGM',
    'kilogramo': 'KGM',
    'kg': 'KGM',
    'gramos': 'GRM',
    'gramo': 'GRM',
    'g': 'GRM',
    'cajas': 'XBX',
    'caja': 'XBX',
    'piezas': 'H87',
    'pieza': 'H87',
    'unidades': 'H87',
    'unidad': 'H87',
    'litros': 'LTR',
    'litro': 'LTR',
    'l': 'LTR',
    'metros': 'MTR',
    'metro': 'MTR',
    'm': 'MTR'
  };

  /**
   * Analiza una descripción y detecta si contiene múltiples productos
   */
  static analizarDescripcion(descripcion: string): MercanciaParseada[] {
    if (!descripcion || descripcion.trim().length === 0) {
      return [];
    }

    console.log('🔍 Analizando descripción para detectar múltiples productos:', descripcion);

    // Dividir por separadores comunes
    const segmentos = this.dividirPorSeparadores(descripcion);
    
    if (segmentos.length === 1) {
      // Solo hay un producto
      const mercancia = this.parsearSegmento(segmentos[0], descripcion);
      return mercancia ? [mercancia] : [];
    }

    // Múltiples productos detectados
    console.log(`✅ Detectados ${segmentos.length} productos distintos`);
    
    const mercancias: MercanciaParseada[] = [];
    segmentos.forEach((segmento, index) => {
      const mercancia = this.parsearSegmento(segmento, descripcion);
      if (mercancia) {
        mercancias.push(mercancia);
        console.log(`  📦 Producto ${index + 1}:`, mercancia);
      }
    });

    return mercancias;
  }

  /**
   * Divide la descripción por separadores
   */
  private static dividirPorSeparadores(texto: string): string[] {
    // Primero intentar dividir por separadores claros
    const segmentos = texto.split(this.SEPARADORES).filter(s => s.trim().length > 0);
    
    // Filtrar segmentos que contienen cantidades (son productos reales)
    const segmentosConCantidad = segmentos.filter(s => this.PATRON_CANTIDAD.test(s));
    
    // Si encontramos segmentos con cantidades, usarlos; si no, devolver el original
    return segmentosConCantidad.length > 0 ? segmentosConCantidad : [texto];
  }

  /**
   * Parsear un segmento individual para extraer cantidad, unidad y descripción
   */
  private static parsearSegmento(segmento: string, contextoCompleto: string): MercanciaParseada | null {
    const textoLimpio = segmento.trim();
    
    if (!textoLimpio) return null;

    // Buscar cantidad y unidad
    const matchCantidad = textoLimpio.match(this.PATRON_CANTIDAD);
    
    let cantidad = 1;
    let unidadTexto = 'pieza';
    let descripcionLimpia = textoLimpio;

    if (matchCantidad) {
      // Extraer primera coincidencia
      const match = matchCantidad[0];
      const partes = match.match(/(\d+(?:\.\d+)?)\s*(.+)/i);
      
      if (partes) {
        cantidad = parseFloat(partes[1]);
        unidadTexto = partes[2].toLowerCase().trim();
        
        // Remover la cantidad de la descripción
        descripcionLimpia = textoLimpio.replace(match, '').trim();
      }
    }

    // Convertir unidad a código SAT
    const unidadSAT = this.UNIDADES_SAT[unidadTexto] || 'H87'; // H87 = Pieza

    // Extraer keywords para categorización
    const keywords = this.extraerKeywords(descripcionLimpia);

    return {
      descripcion: descripcionLimpia || textoLimpio,
      cantidad,
      unidad: unidadSAT,
      keywords,
      categoria: this.categorizarProducto(keywords)
    };
  }

  /**
   * Extraer palabras clave de la descripción
   */
  private static extraerKeywords(texto: string): string[] {
    const palabrasComunes = ['de', 'la', 'el', 'en', 'para', 'con', 'sin', 'por'];
    return texto
      .toLowerCase()
      .split(/\s+/)
      .filter(p => p.length > 3 && !palabrasComunes.includes(p));
  }

  /**
   * Categorizar producto basado en keywords
   */
  private static categorizarProducto(keywords: string[]): string {
    const categorias: Record<string, string[]> = {
      'alimentos': ['mango', 'aguacate', 'limón', 'fruta', 'verdura', 'carne', 'pescado', 'mariscos'],
      'materiales': ['madera', 'acero', 'hierro', 'cemento', 'arena', 'grava'],
      'textiles': ['tela', 'ropa', 'textil', 'algodón', 'seda'],
      'electrónicos': ['computadora', 'teléfono', 'electrónico', 'cable', 'componente'],
      'químicos': ['químico', 'fertilizante', 'pesticida', 'solvente', 'pintura']
    };

    for (const [categoria, palabras] of Object.entries(categorias)) {
      if (keywords.some(kw => palabras.some(p => kw.includes(p) || p.includes(kw)))) {
        return categoria;
      }
    }

    return 'general';
  }

  /**
   * Validar si una descripción contiene múltiples productos
   */
  static contieneMultiplesProductos(descripcion: string): boolean {
    const mercancias = this.analizarDescripcion(descripcion);
    return mercancias.length > 1;
  }

  /**
   * Obtener resumen de productos detectados
   */
  static obtenerResumen(descripcion: string): string {
    const mercancias = this.analizarDescripcion(descripcion);
    
    if (mercancias.length === 0) return 'Sin productos detectados';
    if (mercancias.length === 1) return `1 producto: ${mercancias[0].descripcion}`;
    
    return `${mercancias.length} productos distintos detectados`;
  }
}
