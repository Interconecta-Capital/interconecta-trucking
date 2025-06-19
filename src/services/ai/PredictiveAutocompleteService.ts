
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';

export interface PredictiveSuggestion {
  id: string;
  text: string;
  value: any;
  confidence: number;
  source: 'ai' | 'pattern' | 'frecuente' | 'similar';
  metadata?: {
    useCount?: number;
    lastUsed?: Date;
    contextSimilarity?: number;
    pattern?: string;
  };
}

export interface AutocompleteContext {
  currentData: Partial<CartaPorteData>;
  userHistory: any[];
  timeOfDay: string;
  dayOfWeek: string;
  location?: string;
}

export class PredictiveAutocompleteService {
  private static cache = new Map<string, { suggestions: PredictiveSuggestion[]; timestamp: number }>();
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

  static async getSmartSuggestions(
    field: string,
    input: string,
    context: AutocompleteContext,
    type: 'direccion' | 'mercancia' | 'vehiculo' | 'conductor' | 'general'
  ): Promise<PredictiveSuggestion[]> {
    console.log('🔮 [PredictiveAutocomplete] Obteniendo sugerencias inteligentes:', { field, input, type });

    const cacheKey = this.generateCacheKey(field, input, context, type);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('✅ Sugerencias obtenidas del cache');
      return cached;
    }

    try {
      // Combinar múltiples fuentes de sugerencias
      const [patternSuggestions, aiSuggestions, frequentSuggestions, similarSuggestions] = await Promise.all([
        this.getPatternBasedSuggestions(field, input, context),
        this.getAISuggestions(field, input, context, type),
        this.getFrequentSuggestions(field, input, context),
        this.getSimilarDocumentsSuggestions(field, input, context)
      ]);

      // Combinar y ordenar sugerencias
      const allSuggestions = [
        ...patternSuggestions,
        ...aiSuggestions,
        ...frequentSuggestions,
        ...similarSuggestions
      ];

      // Eliminar duplicados y ordenar por confianza
      const uniqueSuggestions = this.removeDuplicatesAndSort(allSuggestions);
      
      // Aplicar machine learning para mejorar orden
      const optimizedSuggestions = await this.applyMLOptimization(uniqueSuggestions, context);

      this.setCache(cacheKey, optimizedSuggestions);
      
      console.log(`✅ ${optimizedSuggestions.length} sugerencias generadas para ${field}`);
      return optimizedSuggestions;

    } catch (error) {
      console.error('❌ Error generando sugerencias:', error);
      return this.getFallbackSuggestions(field, input);
    }
  }

  private static async getPatternBasedSuggestions(
    field: string,
    input: string,
    context: AutocompleteContext
  ): Promise<PredictiveSuggestion[]> {
    try {
      // Detectar patrones en el historial del usuario
      const patterns = this.detectPatterns(context.userHistory, field);
      
      return patterns
        .filter(pattern => pattern.value.toLowerCase().includes(input.toLowerCase()))
        .map(pattern => ({
          id: `pattern-${pattern.pattern}`,
          text: pattern.value,
          value: pattern.data,
          confidence: pattern.confidence,
          source: 'pattern' as const,
          metadata: {
            pattern: pattern.pattern,
            useCount: pattern.count
          }
        }));
    } catch (error) {
      console.error('Error en sugerencias basadas en patrones:', error);
      return [];
    }
  }

  private static async getAISuggestions(
    field: string,
    input: string,
    context: AutocompleteContext,
    type: string
  ): Promise<PredictiveSuggestion[]> {
    try {
      const { data, error } = await supabase.functions.invoke('predictive-autocomplete-ai', {
        body: {
          operation: 'get_smart_suggestions',
          field,
          input,
          type,
          context: {
            currentData: context.currentData,
            timeContext: {
              timeOfDay: context.timeOfDay,
              dayOfWeek: context.dayOfWeek
            },
            userProfile: this.buildUserProfile(context.userHistory)
          }
        },
      });

      if (error) throw error;

      return (data?.suggestions || []).map((suggestion: any, index: number) => ({
        id: `ai-${index}`,
        text: suggestion.text,
        value: suggestion.value,
        confidence: suggestion.confidence || 0.7,
        source: 'ai' as const,
        metadata: {
          contextSimilarity: suggestion.contextSimilarity || 0
        }
      }));
    } catch (error) {
      console.error('Error en sugerencias IA:', error);
      return [];
    }
  }

  private static async getFrequentSuggestions(
    field: string,
    input: string,
    context: AutocompleteContext
  ): Promise<PredictiveSuggestion[]> {
    try {
      const frequentKey = `predictive_frequent_${field}`;
      const stored = localStorage.getItem(frequentKey);
      
      if (!stored) return [];
      
      const frequent: Array<{ text: string; value: any; count: number; lastUsed: string }> = JSON.parse(stored);
      
      return frequent
        .filter(item => item.text.toLowerCase().includes(input.toLowerCase()))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((item, index) => ({
          id: `frequent-${index}`,
          text: item.text,
          value: item.value,
          confidence: Math.min(0.95, 0.7 + (item.count * 0.05)),
          source: 'frecuente' as const,
          metadata: {
            useCount: item.count,
            lastUsed: new Date(item.lastUsed)
          }
        }));
    } catch (error) {
      console.error('Error en sugerencias frecuentes:', error);
      return [];
    }
  }

  private static async getSimilarDocumentsSuggestions(
    field: string,
    input: string,
    context: AutocompleteContext
  ): Promise<PredictiveSuggestion[]> {
    try {
      // Buscar documentos similares en el contexto actual
      const similarDocs = this.findSimilarDocuments(context);
      
      return similarDocs
        .filter(doc => doc[field] && doc[field].toLowerCase().includes(input.toLowerCase()))
        .slice(0, 2)
        .map((doc, index) => ({
          id: `similar-${index}`,
          text: doc[field],
          value: doc[field],
          confidence: 0.8,
          source: 'similar' as const,
          metadata: {
            contextSimilarity: doc.similarity || 0.8
          }
        }));
    } catch (error) {
      console.error('Error en sugerencias de documentos similares:', error);
      return [];
    }
  }

  private static detectPatterns(history: any[], field: string): Array<{
    pattern: string;
    value: string;
    data: any;
    confidence: number;
    count: number;
  }> {
    const patterns: Map<string, { count: number; data: any }> = new Map();
    
    history.forEach(item => {
      if (item[field]) {
        const key = item[field];
        const existing = patterns.get(key);
        patterns.set(key, {
          count: (existing?.count || 0) + 1,
          data: existing?.data || item
        });
      }
    });

    return Array.from(patterns.entries()).map(([value, info]) => ({
      pattern: 'frecuente',
      value,
      data: info.data,
      confidence: Math.min(0.9, 0.5 + (info.count * 0.1)),
      count: info.count
    }));
  }

  private static buildUserProfile(history: any[]): any {
    return {
      preferredRoutes: this.extractPreferredRoutes(history),
      commonMerchandise: this.extractCommonMerchandise(history),
      frequentLocations: this.extractFrequentLocations(history),
      averageDistance: this.calculateAverageDistance(history),
      timePatterns: this.extractTimePatterns(history)
    };
  }

  private static extractPreferredRoutes(history: any[]): string[] {
    const routes = new Map<string, number>();
    
    history.forEach(item => {
      if (item.ubicaciones && item.ubicaciones.length >= 2) {
        const route = `${item.ubicaciones[0].domicilio?.estado}-${item.ubicaciones[item.ubicaciones.length - 1].domicilio?.estado}`;
        routes.set(route, (routes.get(route) || 0) + 1);
      }
    });

    return Array.from(routes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route]) => route);
  }

  private static extractCommonMerchandise(history: any[]): string[] {
    const merchandise = new Map<string, number>();
    
    history.forEach(item => {
      if (item.mercancias) {
        item.mercancias.forEach((mercancia: any) => {
          if (mercancia.descripcion) {
            merchandise.set(mercancia.descripcion, (merchandise.get(mercancia.descripcion) || 0) + 1);
          }
        });
      }
    });

    return Array.from(merchandise.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([desc]) => desc);
  }

  private static extractFrequentLocations(history: any[]): string[] {
    const locations = new Map<string, number>();
    
    history.forEach(item => {
      if (item.ubicaciones) {
        item.ubicaciones.forEach((ubicacion: any) => {
          const location = `${ubicacion.domicilio?.municipio}, ${ubicacion.domicilio?.estado}`;
          locations.set(location, (locations.get(location) || 0) + 1);
        });
      }
    });

    return Array.from(locations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([location]) => location);
  }

  private static calculateAverageDistance(history: any[]): number {
    const distances = history
      .filter(item => item.total_distancia_recorrida)
      .map(item => item.total_distancia_recorrida);
    
    return distances.length > 0 
      ? distances.reduce((sum, dist) => sum + dist, 0) / distances.length 
      : 0;
  }

  private static extractTimePatterns(history: any[]): any {
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    history.forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        hourCounts[date.getHours()]++;
        dayCounts[date.getDay()]++;
      }
    });

    return {
      preferredHours: hourCounts.map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(({ hour }) => hour),
      preferredDays: dayCounts.map((count, day) => ({ day, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(({ day }) => day)
    };
  }

  private static findSimilarDocuments(context: AutocompleteContext): any[] {
    // Implementación simplificada - en producción usaríamos vector similarity
    return context.userHistory
      .filter(doc => {
        if (!context.currentData.ubicaciones || !doc.ubicaciones) return false;
        
        const currentStates = context.currentData.ubicaciones
          .map(u => u.domicilio?.estado)
          .filter(Boolean);
        
        const docStates = doc.ubicaciones
          .map((u: any) => u.domicilio?.estado)
          .filter(Boolean);
        
        return currentStates.some(state => docStates.includes(state));
      })
      .slice(0, 5)
      .map(doc => ({ ...doc, similarity: 0.8 }));
  }

  private static removeDuplicatesAndSort(suggestions: PredictiveSuggestion[]): PredictiveSuggestion[] {
    const seen = new Set<string>();
    const unique = suggestions.filter(suggestion => {
      const key = suggestion.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => {
      // Ordenar por fuente (frecuente > pattern > ai > similar) y luego por confianza
      const sourceOrder = { frecuente: 4, pattern: 3, ai: 2, similar: 1 };
      const sourceComparison = sourceOrder[b.source] - sourceOrder[a.source];
      
      if (sourceComparison !== 0) return sourceComparison;
      return b.confidence - a.confidence;
    }).slice(0, 8);
  }

  private static async applyMLOptimization(
    suggestions: PredictiveSuggestion[],
    context: AutocompleteContext
  ): Promise<PredictiveSuggestion[]> {
    try {
      // Aplicar optimización basada en contexto del usuario
      const timeBoost = this.getTimeBasedBoost(context.timeOfDay);
      const locationBoost = this.getLocationBasedBoost(context.location);
      
      return suggestions.map(suggestion => ({
        ...suggestion,
        confidence: Math.min(1.0, suggestion.confidence * timeBoost * locationBoost)
      })).sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error en optimización ML:', error);
      return suggestions;
    }
  }

  private static getTimeBasedBoost(timeOfDay: string): number {
    // Boost basado en horario (mañana = más comercial, tarde = más logística)
    const hour = parseInt(timeOfDay.split(':')[0]);
    if (hour >= 8 && hour <= 12) return 1.1; // Mañana
    if (hour >= 13 && hour <= 17) return 1.05; // Tarde
    return 1.0;
  }

  private static getLocationBasedBoost(location?: string): number {
    // Boost basado en ubicación (zonas industriales, puertos, etc.)
    if (!location) return 1.0;
    
    const industrialKeywords = ['industrial', 'puerto', 'aeropuerto', 'central', 'hub'];
    const hasIndustrialKeyword = industrialKeywords.some(keyword => 
      location.toLowerCase().includes(keyword)
    );
    
    return hasIndustrialKeyword ? 1.1 : 1.0;
  }

  private static getFallbackSuggestions(field: string, input: string): PredictiveSuggestion[] {
    // Sugerencias básicas cuando falla todo lo demás
    const fallbacks: { [key: string]: string[] } = {
      'descripcion_mercancia': ['Mercancía general', 'Productos manufacturados', 'Materiales de construcción'],
      'nombre_conductor': ['Juan Pérez', 'María González', 'Carlos López'],
      'aseguradora': ['GNP', 'Seguros Monterrey', 'AXA Seguros']
    };

    const suggestions = fallbacks[field] || [];
    
    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(input.toLowerCase()))
      .map((text, index) => ({
        id: `fallback-${index}`,
        text,
        value: text,
        confidence: 0.3,
        source: 'ai' as const
      }));
  }

  static recordSuggestionUsage(field: string, suggestion: PredictiveSuggestion): void {
    try {
      const frequentKey = `predictive_frequent_${field}`;
      const stored = localStorage.getItem(frequentKey);
      const frequent: Array<{ text: string; value: any; count: number; lastUsed: string }> = 
        stored ? JSON.parse(stored) : [];
      
      const existingIndex = frequent.findIndex(item => item.text === suggestion.text);
      
      if (existingIndex >= 0) {
        frequent[existingIndex].count++;
        frequent[existingIndex].lastUsed = new Date().toISOString();
      } else {
        frequent.push({
          text: suggestion.text,
          value: suggestion.value,
          count: 1,
          lastUsed: new Date().toISOString()
        });
      }
      
      // Mantener solo los 50 más frecuentes
      frequent.sort((a, b) => b.count - a.count);
      localStorage.setItem(frequentKey, JSON.stringify(frequent.slice(0, 50)));
    } catch (error) {
      console.error('Error guardando uso de sugerencia:', error);
    }
  }

  private static generateCacheKey(field: string, input: string, context: AutocompleteContext, type: string): string {
    const contextHash = btoa(JSON.stringify({
      field,
      input: input.toLowerCase(),
      type,
      timeOfDay: context.timeOfDay,
      dayOfWeek: context.dayOfWeek,
      hasUbicaciones: !!context.currentData.ubicaciones?.length,
      hasMercancias: !!context.currentData.mercancias?.length
    }));
    
    return contextHash;
  }

  private static getFromCache(key: string): PredictiveSuggestion[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.suggestions;
  }

  private static setCache(key: string, suggestions: PredictiveSuggestion[]): void {
    this.cache.set(key, {
      suggestions,
      timestamp: Date.now()
    });

    // Limpiar cache antiguo
    if (this.cache.size > 100) {
      const oldestEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 20);
      
      oldestEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  static clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache de autocompletado predictivo limpiado');
  }
}
