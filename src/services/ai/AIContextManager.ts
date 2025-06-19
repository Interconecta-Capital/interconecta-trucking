
export interface AIContextData {
  usuario?: {
    empresaId?: string;
    tipoUsuario?: string;
    preferencias?: any;
  };
  cartaPorte?: {
    version?: string;
    tipoTransporte?: string;
    ubicacionesRecientes?: any[];
    mercanciasRecientes?: any[];
  };
  sesion?: {
    ubicacion?: string;
    timestamp: number;
    acciones: Array<{
      tipo: string;
      data: any;
      timestamp: number;
    }>;
  };
}

export class AIContextManager {
  private context: AIContextData = {
    sesion: {
      timestamp: Date.now(),
      acciones: []
    }
  };

  private readonly MAX_ACCIONES = 50;

  obtenerContextoCompleto(): AIContextData {
    return { ...this.context };
  }

  obtenerContextoParaAutocompletado(tipo: string, input: string): any {
    const baseContext = {
      timestamp: Date.now(),
      tipoInput: tipo,
      valorActual: input,
      usuario: this.context.usuario,
      cartaPorte: this.context.cartaPorte
    };

    switch (tipo) {
      case 'direccion':
        return {
          ...baseContext,
          ubicacionesRecientes: this.context.cartaPorte?.ubicacionesRecientes || [],
          preferenciasUbicacion: this.obtenerPreferenciasUbicacion()
        };
      
      case 'mercancia':
        return {
          ...baseContext,
          mercanciasRecientes: this.context.cartaPorte?.mercanciasRecientes || [],
          categoriasFrecuentes: this.obtenerCategoriasFrecuentes()
        };
      
      case 'vehiculo':
        return {
          ...baseContext,
          vehiculosUsados: this.obtenerVehiculosUsados(),
          tipoOperacion: this.context.cartaPorte?.tipoTransporte
        };

      case 'conductor':
        return {
          ...baseContext,
          conductoresFrecuentes: this.obtenerConductoresFrecuentes(),
          empresaId: this.context.usuario?.empresaId
        };
      
      default:
        return baseContext;
    }
  }

  actualizarContextoUsuario(datosUsuario: any): void {
    this.context.usuario = {
      ...this.context.usuario,
      ...datosUsuario
    };
  }

  actualizarContextoCartaPorte(datosCartaPorte: any): void {
    this.context.cartaPorte = {
      ...this.context.cartaPorte,
      ...datosCartaPorte
    };
  }

  actualizarContextoConAccion(tipoAccion: string, data: any): void {
    const accion = {
      tipo: tipoAccion,
      data,
      timestamp: Date.now()
    };

    if (!this.context.sesion) {
      this.context.sesion = {
        timestamp: Date.now(),
        acciones: []
      };
    }

    this.context.sesion.acciones.unshift(accion);

    // Mantener solo las últimas acciones
    if (this.context.sesion.acciones.length > this.MAX_ACCIONES) {
      this.context.sesion.acciones = this.context.sesion.acciones.slice(0, this.MAX_ACCIONES);
    }

    // Actualizar contextos específicos basados en la acción
    this.procesarAccionParaContexto(tipoAccion, data);
  }

  private procesarAccionParaContexto(tipoAccion: string, data: any): void {
    switch (tipoAccion) {
      case 'direccion_selected':
        this.agregarUbicacionReciente(data);
        break;
      
      case 'mercancia_selected':
        this.agregarMercanciaReciente(data);
        break;
      
      case 'vehiculo_selected':
        this.agregarVehiculoUsado(data);
        break;

      case 'conductor_selected':
        this.agregarConductorFrecuente(data);
        break;
    }
  }

  private agregarUbicacionReciente(ubicacion: any): void {
    if (!this.context.cartaPorte) {
      this.context.cartaPorte = {};
    }

    if (!this.context.cartaPorte.ubicacionesRecientes) {
      this.context.cartaPorte.ubicacionesRecientes = [];
    }

    // Evitar duplicados
    const existing = this.context.cartaPorte.ubicacionesRecientes.find(
      u => u.fullAddress === ubicacion.fullAddress
    );

    if (!existing) {
      this.context.cartaPorte.ubicacionesRecientes.unshift(ubicacion);
      // Mantener solo las últimas 10
      this.context.cartaPorte.ubicacionesRecientes = 
        this.context.cartaPorte.ubicacionesRecientes.slice(0, 10);
    }
  }

  private agregarMercanciaReciente(mercancia: any): void {
    if (!this.context.cartaPorte) {
      this.context.cartaPorte = {};
    }

    if (!this.context.cartaPorte.mercanciasRecientes) {
      this.context.cartaPorte.mercanciasRecientes = [];
    }

    // Evitar duplicados
    const existing = this.context.cartaPorte.mercanciasRecientes.find(
      m => m.descripcion === mercancia.descripcion
    );

    if (!existing) {
      this.context.cartaPorte.mercanciasRecientes.unshift(mercancia);
      this.context.cartaPorte.mercanciasRecientes = 
        this.context.cartaPorte.mercanciasRecientes.slice(0, 10);
    }
  }

  private agregarVehiculoUsado(vehiculo: any): void {
    try {
      const vehiculosKey = 'ai_context_vehiculos_usados';
      const stored = localStorage.getItem(vehiculosKey);
      const vehiculos = stored ? JSON.parse(stored) : [];
      
      const existing = vehiculos.find((v: any) => v.placa === vehiculo.placa);
      if (!existing) {
        vehiculos.unshift(vehiculo);
        localStorage.setItem(vehiculosKey, JSON.stringify(vehiculos.slice(0, 10)));
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  }

  private agregarConductorFrecuente(conductor: any): void {
    try {
      const conductoresKey = 'ai_context_conductores_frecuentes';
      const stored = localStorage.getItem(conductoresKey);
      const conductores = stored ? JSON.parse(stored) : [];
      
      const existing = conductores.find((c: any) => c.rfc === conductor.rfc);
      if (!existing) {
        conductores.unshift(conductor);
        localStorage.setItem(conductoresKey, JSON.stringify(conductores.slice(0, 10)));
      }
    } catch (error) {
      console.error('Error saving conductor:', error);
    }
  }

  private obtenerPreferenciasUbicacion(): any {
    try {
      const stored = localStorage.getItem('ai_context_preferencias_ubicacion');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private obtenerCategoriasFrecuentes(): any[] {
    try {
      const stored = localStorage.getItem('ai_context_categorias_frecuentes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private obtenerVehiculosUsados(): any[] {
    try {
      const stored = localStorage.getItem('ai_context_vehiculos_usados');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private obtenerConductoresFrecuentes(): any[] {
    try {
      const stored = localStorage.getItem('ai_context_conductores_frecuentes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  limpiarContexto(): void {
    this.context = {
      sesion: {
        timestamp: Date.now(),
        acciones: []
      }
    };
  }
}

export const aiContextManager = new AIContextManager();
