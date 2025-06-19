
import { supabase } from '@/integrations/supabase/client';

export interface AIContextData {
  userId?: string;
  sessionId?: string;
  previousInputs?: string[];
  userPreferences?: Record<string, any>;
  businessContext?: {
    industry?: string;
    region?: string;
    vehicleTypes?: string[];
    commonRoutes?: string[];
  };
  vehicleInfo?: any;
  category?: string;
  addressComponent?: string;
  postalCode?: string;
  state?: string;
  description?: string;
  productCode?: string;
  unitCode?: string;
}

export interface AISuggestion {
  id: string;
  text: string;
  confidence: number;
  type: 'address' | 'mercancia' | 'vehicle' | 'driver' | 'route';
  metadata?: Record<string, any>;
  reasoning?: string;
}

export interface AIValidationResult {
  isValid: boolean;
  confidence: number;
  issues: Array<{
    field: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestion?: string;
  }>;
  autoFixes?: Array<{
    field: string;
    currentValue: any;
    suggestedValue: any;
    confidence: number;
  }>;
}

export class GeminiCoreService {
  private static instance: GeminiCoreService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): GeminiCoreService {
    if (!GeminiCoreService.instance) {
      GeminiCoreService.instance = new GeminiCoreService();
    }
    return GeminiCoreService.instance;
  }

  private getCacheKey(operation: string, input: string, context?: any): string {
    return `${operation}-${input}-${JSON.stringify(context)}`;
  }

  private async callGeminiAPI(operation: string, data: any, context?: AIContextData): Promise<any> {
    const cacheKey = this.getCacheKey(operation, JSON.stringify(data), context);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation,
          data,
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            version: '2.0'
          }
        },
      });

      if (error) throw error;

      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error(`[GeminiCore] Error in ${operation}:`, error);
      throw error;
    }
  }

  async getSmartSuggestions(
    input: string, 
    type: 'address' | 'mercancia' | 'vehicle' | 'driver' | 'route',
    context?: AIContextData
  ): Promise<AISuggestion[]> {
    if (input.length < 2) return [];

    try {
      const result = await this.callGeminiAPI('smart_suggestions', {
        input,
        type,
        limit: 5
      }, context);

      return result?.suggestions || [];
    } catch (error) {
      console.error('[GeminiCore] Error getting suggestions:', error);
      return [];
    }
  }

  async validateData(
    data: any, 
    type: 'address' | 'mercancia' | 'vehicle' | 'driver' | 'complete_form',
    context?: AIContextData
  ): Promise<AIValidationResult> {
    try {
      const result = await this.callGeminiAPI('validate_data_advanced', {
        data,
        type,
        strictMode: true
      }, context);

      return result || { isValid: true, confidence: 0.5, issues: [] };
    } catch (error) {
      console.error('[GeminiCore] Error validating data:', error);
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  }

  async optimizeRoute(
    origin: any,
    destination: any,
    waypoints: any[] = [],
    context?: AIContextData
  ): Promise<{
    optimizedRoute: any[];
    estimatedTime: number;
    estimatedDistance: number;
    fuelEfficiency: number;
    suggestions: string[];
  }> {
    try {
      const result = await this.callGeminiAPI('optimize_route_advanced', {
        origin,
        destination,
        waypoints,
        includeTraffic: true,
        includeFuelOptimization: true
      }, context);

      return result || {
        optimizedRoute: [origin, ...waypoints, destination],
        estimatedTime: 0,
        estimatedDistance: 0,
        fuelEfficiency: 0,
        suggestions: []
      };
    } catch (error) {
      console.error('[GeminiCore] Error optimizing route:', error);
      return {
        optimizedRoute: [origin, ...waypoints, destination],
        estimatedTime: 0,
        estimatedDistance: 0,
        fuelEfficiency: 0,
        suggestions: []
      };
    }
  }

  async getBusinessInsights(
    data: any,
    timeframe: 'daily' | 'weekly' | 'monthly',
    context?: AIContextData
  ): Promise<{
    insights: string[];
    predictions: Array<{
      metric: string;
      prediction: number;
      confidence: number;
      timeframe: string;
    }>;
    recommendations: string[];
  }> {
    try {
      const result = await this.callGeminiAPI('business_insights', {
        data,
        timeframe,
        includeMarketAnalysis: true
      }, context);

      return result || { insights: [], predictions: [], recommendations: [] };
    } catch (error) {
      console.error('[GeminiCore] Error getting insights:', error);
      return { insights: [], predictions: [], recommendations: [] };
    }
  }

  async getContextualHelp(
    currentForm: string,
    currentField: string,
    userInput: string,
    context?: AIContextData
  ): Promise<{
    help: string;
    examples: string[];
    commonMistakes: string[];
    nextStepSuggestion?: string;
  }> {
    try {
      const result = await this.callGeminiAPI('contextual_help', {
        form: currentForm,
        field: currentField,
        input: userInput,
        language: 'es-MX'
      }, context);

      return result || { help: '', examples: [], commonMistakes: [] };
    } catch (error) {
      console.error('[GeminiCore] Error getting help:', error);
      return { help: '', examples: [], commonMistakes: [] };
    }
  }

  async analyzeTextForRegulatedKeywords(
    text: string,
    context?: AIContextData
  ): Promise<{ regulatedKeywords: string[]; hasRegulatedKeywords: boolean }> {
    try {
      const result = await this.callGeminiAPI(
        'analyze_regulated_keywords',
        { text },
        context
      );

      return (
        result || { regulatedKeywords: [], hasRegulatedKeywords: false }
      );
    } catch (error) {
      console.error('[GeminiCore] Error analyzing text:', error);
      return { regulatedKeywords: [], hasRegulatedKeywords: false };
    }
  }

  async generateLegalDescription(
    descripcion: string,
    numeroAutorizacion: string,
    folioAcreditacion: string,
    context?: AIContextData
  ): Promise<string> {
    try {
      const result = await this.callGeminiAPI(
        'generate_legal_description',
        {
          descripcion,
          numeroAutorizacion,
          folioAcreditacion
        },
        context
      );

      return result?.descripcion || '';
    } catch (error) {
      console.error('[GeminiCore] Error generating legal description:', error);
      return '';
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const geminiCore = GeminiCoreService.getInstance();
