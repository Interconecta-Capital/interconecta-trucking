
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export interface AIContext {
  usuario: {
    historial: any[];
    preferencias: any;
    ubicacionesFrec: any[];
    mercanciasFrec: any[];
  };
  sesion: {
    cartasPorteRecientes: any[];
    patronesUso: any;
    erroresComunes: any[];
  };
  geografico: {
    region: string;
    estado: string;
    rutas_frecuentes: any[];
  };
  temporal: {
    hora: number;
    dia_semana: number;
    temporada: string;
  };
}

export class AIContextManager {
  private static instance: AIContextManager;
  private context: Partial<AIContext> = {};

  static getInstance(): AIContextManager {
    if (!AIContextManager.instance) {
      AIContextManager.instance = new AIContextManager();
    }
    return AIContextManager.instance;
  }

  async inicializarContexto(userId?: string): Promise<void> {
    try {
      // Cargar datos del usuario desde localStorage y base de datos
      const localContext = this.cargarContextoLocal();
      const userContext = userId ? await this.cargarContextoUsuario(userId) : null;
      
      this.context = {
        ...localContext,
        ...userContext,
        temporal: this.obtenerContextoTemporal(),
        geografico: await this.obtenerContextoGeografico()
      };

      console.log('[AIContext] Contexto inicializado:', this.context);
    } catch (error) {
      console.error('[AIContext] Error inicializando contexto:', error);
    }
  }

  obtenerContexto(): Partial<AIContext> {
    return { ...this.context };
  }

  obtenerContextoParaAutocompletado(tipo: string, input: string): any {
    const baseContext = {
      usuario_id: this.context.usuario?.historial?.length || 0,
      ubicaciones_frecuentes: this.context.usuario?.ubicacionesFrec || [],
      mercancias_frecuentes: this.context.usuario?.mercanciasFrec || [],
      region: this.context.geografico?.region || 'mexico',
      hora_actual: new Date().getHours()
    };

    switch (tipo) {
      case 'direccion':
        return {
          ...baseContext,
          rutas_frecuentes: this.context.geografico?.rutas_frecuentes || [],
          estado_preferido: this.context.geografico?.estado
        };
      
      case 'mercancia':
        return {
          ...baseContext,
          patrones_uso: this.context.sesion?.patronesUso || {},
          cartas_recientes: this.context.sesion?.cartasPorteRecientes || []
        };
      
      default:
        return baseContext;
    }
  }

  actualizarContextoConAccion(accion: string, datos: any): void {
    if (!this.context.sesion) {
      this.context.sesion = { cartasPorteRecientes: [], patronesUso: {}, erroresComunes: [] };
    }

    // Registrar la acción para aprendizaje
    const timestamp = Date.now();
    
    switch (accion) {
      case 'ubicacion_agregada':
        this.agregarUbicacionFrecuente(datos);
        break;
      
      case 'mercancia_agregada':
        this.agregarMercanciaFrecuente(datos);
        break;
      
      case 'carta_porte_guardada':
        this.context.sesion.cartasPorteRecientes.unshift({
          ...datos,
          timestamp
        });
        // Mantener solo las 10 más recientes
        this.context.sesion.cartasPorteRecientes = this.context.sesion.cartasPorteRecientes.slice(0, 10);
        break;
    }

    this.guardarContextoLocal();
  }

  private cargarContextoLocal(): Partial<AIContext> {
    try {
      const saved = localStorage.getItem('ai-context');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private guardarContextoLocal(): void {
    try {
      localStorage.setItem('ai-context', JSON.stringify(this.context));
    } catch (error) {
      console.error('[AIContext] Error guardando contexto local:', error);
    }
  }

  private async cargarContextoUsuario(userId: string): Promise<Partial<AIContext>> {
    // Aquí se cargarían datos del usuario desde la base de datos
    // Por ahora retornamos un contexto básico
    return {
      usuario: {
        historial: [],
        preferencias: {},
        ubicacionesFrec: [],
        mercanciasFrec: []
      }
    };
  }

  private obtenerContextoTemporal(): AIContext['temporal'] {
    const now = new Date();
    return {
      hora: now.getHours(),
      dia_semana: now.getDay(),
      temporada: this.determinarTemporada(now)
    };
  }

  private async obtenerContextoGeografico(): Promise<AIContext['geografico']> {
    // Obtener ubicación aproximada del usuario (sin GPS específico)
    return {
      region: 'mexico',
      estado: 'general',
      rutas_frecuentes: []
    };
  }

  private determinarTemporada(fecha: Date): string {
    const mes = fecha.getMonth() + 1;
    if (mes >= 12 || mes <= 2) return 'invierno';
    if (mes >= 3 && mes <= 5) return 'primavera';
    if (mes >= 6 && mes <= 8) return 'verano';
    return 'otoño';
  }

  private agregarUbicacionFrecuente(ubicacion: any): void {
    if (!this.context.usuario) {
      this.context.usuario = { historial: [], preferencias: {}, ubicacionesFrec: [], mercanciasFrec: [] };
    }

    const existing = this.context.usuario.ubicacionesFrec.find(
      u => u.rfc === ubicacion.rfc || u.codigoPostal === ubicacion.codigoPostal
    );

    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.lastUsed = Date.now();
    } else {
      this.context.usuario.ubicacionesFrec.push({
        ...ubicacion,
        count: 1,
        lastUsed: Date.now()
      });
    }

    // Mantener solo las 20 más frecuentes
    this.context.usuario.ubicacionesFrec = this.context.usuario.ubicacionesFrec
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 20);
  }

  private agregarMercanciaFrecuente(mercancia: any): void {
    if (!this.context.usuario) {
      this.context.usuario = { historial: [], preferencias: {}, ubicacionesFrec: [], mercanciasFrec: [] };
    }

    const existing = this.context.usuario.mercanciasFrec.find(
      m => m.claveProdServ === mercancia.claveProdServ
    );

    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.lastUsed = Date.now();
    } else {
      this.context.usuario.mercanciasFrec.push({
        ...mercancia,
        count: 1,
        lastUsed: Date.now()
      });
    }

    // Mantener solo las 15 más frecuentes
    this.context.usuario.mercanciasFrec = this.context.usuario.mercanciasFrec
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 15);
  }
}

export const aiContextManager = AIContextManager.getInstance();
