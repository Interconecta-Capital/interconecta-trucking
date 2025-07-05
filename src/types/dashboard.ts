
export interface DashboardData {
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
    comparativo: 'mes_anterior' | 'año_anterior';
  };
  kpis: {
    ingresoTotal: number;
    costoTotal: number;
    margenPromedio: number;
    viajesCompletados: number;
    kmRecorridos: number;
    utilizacionFlota: number;
  };
  analisis: {
    viajesMasRentables: ViajeRentable[];
    viajesMenosRentables: ViajeRentable[];
    rutasOptimas: RutaAnalisis[];
    vehiculosPerformance: VehiculoPerformance[];
  };
  alertas: {
    viajesNegativos: number;
    clientesMorosos: number;
    vehiculosIneficientes: number;
    oportunidadesMejora: string[];
  };
}

export interface ViajeRentable {
  id: string;
  origen: string;
  destino: string;
  cliente: string;
  ingreso: number;
  costo: number;
  margen: number;
  fecha: Date;
  conductor: string;
  vehiculo: string;
}

export interface RutaAnalisis {
  id: string;
  origen: string;
  destino: string;
  viajesTotal: number;
  ingresoPromedio: number;
  costoPromedio: number;
  margenPromedio: number;
  frecuencia: number;
  distanciaKm: number;
  tiempoPromedio: number;
  demanda: 'alta' | 'media' | 'baja';
  estacionalidad: boolean;
}

export interface VehiculoPerformance {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  viajesCompletados: number;
  kmRecorridos: number;
  ingresoTotal: number;
  costoTotal: number;
  margen: number;
  utilizacion: number;
  eficienciaCombustible: number;
  costoMantenimiento: number;
  roi: number;
  estado: 'excelente' | 'bueno' | 'regular' | 'deficiente';
}

export interface KPIComparativo {
  actual: number;
  anterior: number;
  cambio: number;
  porcentajeCambio: number;
  tendencia: 'subida' | 'bajada' | 'estable';
}

export interface AlertaDashboard {
  id: string;
  tipo: 'critica' | 'advertencia' | 'info';
  titulo: string;
  descripcion: string;
  categoria: 'rentabilidad' | 'operacional' | 'flota' | 'clientes';
  fecha: Date;
  accionRecomendada?: string;
}

export interface FiltrosDashboard {
  fechaInicio: Date;
  fechaFin: Date;
  comparativo: 'mes_anterior' | 'año_anterior';
  vehiculos?: string[];
  conductores?: string[];
  rutas?: string[];
  clientes?: string[];
}
