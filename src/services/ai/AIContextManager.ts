
export interface AIContext {
  userId?: string;
  sessionId: string;
  currentForm: string;
  currentField?: string;
  recentInputs: Array<{
    field: string;
    value: any;
    timestamp: number;
  }>;
  userPreferences: {
    suggestionsEnabled: boolean;
    autoComplete: boolean;
    language: string;
  };
  businessProfile: {
    industry: string;
    region: string;
    commonProducts?: string[];
    commonRoutes?: string[];
    preferredVehicles?: string[];
  };
  formHistory: Array<{
    formType: string;
    completedFields: string[];
    timestamp: number;
  }>;
}

class AIContextManager {
  private context: AIContext;
  private readonly MAX_RECENT_INPUTS = 20;
  private readonly MAX_FORM_HISTORY = 10;

  constructor() {
    this.context = this.initializeContext();
  }

  private initializeContext(): AIContext {
    const saved = localStorage.getItem('ai_context');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('[AIContext] Error loading saved context:', error);
      }
    }

    return {
      sessionId: this.generateSessionId(),
      currentForm: 'carta_porte',
      recentInputs: [],
      userPreferences: {
        suggestionsEnabled: true,
        autoComplete: true,
        language: 'es-MX'
      },
      businessProfile: {
        industry: 'transporte',
        region: 'mexico'
      },
      formHistory: []
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveContext(): void {
    try {
      localStorage.setItem('ai_context', JSON.stringify(this.context));
    } catch (error) {
      console.warn('[AIContext] Error saving context:', error);
    }
  }

  actualizarCampoActual(form: string, field?: string): void {
    this.context.currentForm = form;
    this.context.currentField = field;
    this.saveContext();
  }

  registrarInput(field: string, value: any): void {
    const input = {
      field,
      value,
      timestamp: Date.now()
    };

    this.context.recentInputs.unshift(input);
    
    // Mantener solo los inputs más recientes
    if (this.context.recentInputs.length > this.MAX_RECENT_INPUTS) {
      this.context.recentInputs = this.context.recentInputs.slice(0, this.MAX_RECENT_INPUTS);
    }

    this.saveContext();
  }

  actualizarPerfilNegocio(updates: Partial<AIContext['businessProfile']>): void {
    this.context.businessProfile = {
      ...this.context.businessProfile,
      ...updates
    };
    this.saveContext();
  }

  registrarFormularioCompletado(formType: string, completedFields: string[]): void {
    const formRecord = {
      formType,
      completedFields,
      timestamp: Date.now()
    };

    this.context.formHistory.unshift(formRecord);
    
    if (this.context.formHistory.length > this.MAX_FORM_HISTORY) {
      this.context.formHistory = this.context.formHistory.slice(0, this.MAX_FORM_HISTORY);
    }

    this.saveContext();
  }

  obtenerContextoParaAutocompletado(tipo: string, input: string) {
    const recentInputsForType = this.context.recentInputs
      .filter(i => i.field.includes(tipo))
      .slice(0, 5);

    return {
      sessionId: this.context.sessionId,
      currentForm: this.context.currentForm,
      recentInputs: recentInputsForType,
      businessProfile: this.context.businessProfile,
      userPreferences: this.context.userPreferences,
      input,
      tipo
    };
  }

  obtenerContextoCompleto(): AIContext {
    return { ...this.context };
  }

  actualizarContextoConAccion(accion: string, datos: any): void {
    // Registrar acciones específicas para mejorar las sugerencias futuras
    this.registrarInput(`action_${accion}`, datos);
  }

  limpiarContexto(): void {
    this.context = this.initializeContext();
    this.saveContext();
  }

  configurarPreferencias(preferencias: Partial<AIContext['userPreferences']>): void {
    this.context.userPreferences = {
      ...this.context.userPreferences,
      ...preferencias
    };
    this.saveContext();
  }
}

export const aiContextManager = new AIContextManager();
