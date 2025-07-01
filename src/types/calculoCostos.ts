
export interface ConfiguracionCostos {
  modo_calculo: 'basico' | 'profesional';
  combustible: {
    usar_rendimiento_vehiculo: boolean;
    precio_fijo_litro: number | null;
    sobrecargo_percentage: number;
  };
  viaticos: {
    tarifa_diaria: number;
    incluir_hospedaje: boolean;
  };
  peajes: {
    usar_calculo_automatico: boolean;
    factor_adicional: number;
  };
  costos_fijos: {
    incluir_depreciacion: boolean;
    incluir_seguros: boolean;
    incluir_administracion: boolean;
  };
  margen_ganancia: {
    porcentaje_minimo: number;
    porcentaje_objetivo: number;
    alertar_bajo_minimo: boolean;
  };
}

export interface VehiculoConCostos {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  rendimiento?: number;
  tipo_combustible?: 'diesel' | 'gasolina';
  capacidad_carga?: number;
  peso_bruto_vehicular?: number;
  costo_mantenimiento_km: number;
  costo_llantas_km: number;
  valor_vehiculo?: number;
  configuracion_ejes: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
  factor_peajes: number;
}

export interface CalculoProfesional {
  combustible: {
    litros: number;
    costo: number;
    precio_litro: number;
    fuente: string;
  };
  peajes: {
    casetas_estimadas: number;
    costo: number;
    factor: number;
  };
  viaticos: {
    dias: number;
    costo: number;
    tarifa_diaria: number;
  };
  mantenimiento: {
    costo: number;
    costo_por_km: number;
  };
  costos_fijos: {
    costo: number;
    depreciacion: number;
    seguros: number;
    administracion: number;
  };
  costoTotal: number;
  margenSugerido: number;
  precioVentaSugerido: number;
  precisionMejora: string;
  alertas: AlertaCosto[];
}

export interface AlertaCosto {
  tipo: 'warning' | 'error' | 'info';
  mensaje: string;
  impacto?: string;
  solucion?: string;
}

export interface ComparacionCalculo {
  calculoBasico: number;
  calculoProfesional: number;
  diferencia: number;
  porcentajeMejora: number;
  confiabilidad: 'baja' | 'media' | 'alta';
}
