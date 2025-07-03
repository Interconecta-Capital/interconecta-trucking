
export interface RecomendacionInteligente {
  id: string;
  tipo: 'vehiculo' | 'ruta' | 'precio' | 'operacion';
  prioridad: 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  impactoEconomico: {
    ahorro?: number;
    ingresoAdicional?: number;
    costoAdicional?: number;
  };
  facilidadImplementacion: 'facil' | 'moderada' | 'dificil';
  accion: string;
  metrica: string; // para medir éxito
  fechaGenerada: string;
  aplicada?: boolean;
  viajeId?: string;
  contexto?: {
    rutaOrigen?: string;
    rutaDestino?: string;
    vehiculoActual?: string;
    precioActual?: number;
    [key: string]: any;
  };
}

export interface AnalisisEmpresarial {
  rendimientoPromedio: number;
  margenPromedio: number;
  vehiculosSubutilizados: string[];
  rutasOptimas: Array<{
    origen: string;
    destino: string;
    ahorroPotencial: number;
  }>;
  patronesPrecios: {
    aceptacionCliente: number;
    precioMercado: number;
    elasticidad: number;
  };
}

export interface ContextoRecomendacion {
  viaje?: any;
  empresa?: any;
  historico?: any;
  analisisIA?: any;
  condicionesActuales?: {
    temporada: 'alta' | 'media' | 'baja';
    combustible: number;
    demanda: 'alta' | 'media' | 'baja';
  };
}
