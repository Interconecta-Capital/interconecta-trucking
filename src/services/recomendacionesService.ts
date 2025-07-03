
import { RecomendacionInteligente, AnalisisEmpresarial, ContextoRecomendacion } from '@/types/recomendaciones';
import { iaPredictiva } from './iaPredictiva';

class RecomendacionesService {
  // Generar recomendaciones principales
  async generarRecomendaciones(contexto: ContextoRecomendacion): Promise<RecomendacionInteligente[]> {
    const recomendaciones: RecomendacionInteligente[] = [];

    try {
      // Generar recomendaciones por tipo
      const vehiculoRecs = await this.generarRecomendacionesVehiculo(contexto);
      const rutaRecs = await this.generarRecomendacionesRuta(contexto);
      const precioRecs = await this.generarRecomendacionesPrecios(contexto);
      const operacionRecs = await this.generarRecomendacionesOperacion(contexto);

      recomendaciones.push(...vehiculoRecs, ...rutaRecs, ...precioRecs, ...operacionRecs);

      // Ordenar por prioridad y puntuación
      return this.ordenarPorPrioridad(recomendaciones).slice(0, 10);
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return [];
    }
  }

  // Recomendaciones de optimización de vehículos
  private async generarRecomendacionesVehiculo(contexto: ContextoRecomendacion): Promise<RecomendacionInteligente[]> {
    const recomendaciones: RecomendacionInteligente[] = [];

    if (!contexto.viaje) return recomendaciones;

    // Análisis de subutilización
    if (contexto.viaje.capacidadUtilizada < 70) {
      recomendaciones.push({
        id: `vehiculo-subutilizado-${Date.now()}`,
        tipo: 'vehiculo',
        prioridad: 'alta',
        titulo: 'Vehículo Subutilizado',
        descripcion: `Capacidad utilizada: ${contexto.viaje.capacidadUtilizada}%. Buscar carga adicional o usar vehículo menor.`,
        impactoEconomico: {
          ahorro: this.calcularAhorroCapacidad(contexto.viaje.capacidadUtilizada),
          ingresoAdicional: this.calcularIngresoAdicional(100 - contexto.viaje.capacidadUtilizada)
        },
        facilidadImplementacion: 'moderada',
        accion: 'Optimizar carga o cambiar tipo de vehículo',
        metrica: 'Porcentaje de utilización de capacidad',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id,
        contexto: {
          capacidadActual: contexto.viaje.capacidadUtilizada,
          vehiculoActual: contexto.viaje.vehiculoTipo
        }
      });
    }

    // Análisis de eficiencia de combustible
    if (contexto.viaje.rendimientoCombustible < 3.0) {
      recomendaciones.push({
        id: `combustible-bajo-${Date.now()}`,
        tipo: 'vehiculo',
        prioridad: 'media',
        titulo: 'Rendimiento de Combustible Bajo',
        descripcion: `Rendimiento actual: ${contexto.viaje.rendimientoCombustible} km/l. Revisar mantenimiento del vehículo.`,
        impactoEconomico: {
          ahorro: this.calcularAhorroCombustible(contexto.viaje.distancia, contexto.viaje.rendimientoCombustible)
        },
        facilidadImplementacion: 'facil',
        accion: 'Programar mantenimiento preventivo',
        metrica: 'Kilómetros por litro',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id
      });
    }

    // Recomendación de cambio de configuración
    const configuracionOptima = this.analizarConfiguracionOptima(contexto.viaje);
    if (configuracionOptima && configuracionOptima !== contexto.viaje.vehiculoTipo) {
      recomendaciones.push({
        id: `config-optima-${Date.now()}`,
        tipo: 'vehiculo',
        prioridad: 'alta',
        titulo: `Usar ${configuracionOptima} en lugar de ${contexto.viaje.vehiculoTipo}`,
        descripcion: `Configuración ${configuracionOptima} más eficiente para esta ruta y carga.`,
        impactoEconomico: {
          ahorro: this.calcularAhorroConfiguracion(contexto.viaje.vehiculoTipo, configuracionOptima)
        },
        facilidadImplementacion: 'moderada',
        accion: `Cambiar a vehículo ${configuracionOptima}`,
        metrica: 'Costo por kilómetro',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id
      });
    }

    return recomendaciones;
  }

  // Recomendaciones de optimización de rutas
  private async generarRecomendacionesRuta(contexto: ContextoRecomendacion): Promise<RecomendacionInteligente[]> {
    const recomendaciones: RecomendacionInteligente[] = [];

    if (!contexto.viaje?.origen || !contexto.viaje?.destino) return recomendaciones;

    // Análisis de rutas alternativas
    const rutaAlternativa = await this.analizarRutaAlternativa(contexto.viaje.origen, contexto.viaje.destino);
    if (rutaAlternativa && rutaAlternativa.ahorro > 0) {
      recomendaciones.push({
        id: `ruta-alternativa-${Date.now()}`,
        tipo: 'ruta',
        prioridad: rutaAlternativa.ahorro > 500 ? 'alta' : 'media',
        titulo: 'Ruta Alternativa Disponible',
        descripcion: `Ruta alternativa: ${rutaAlternativa.diferenciaTiempo}min ${rutaAlternativa.diferenciaTiempo > 0 ? 'más' : 'menos'}, ahorro de $${rutaAlternativa.ahorro}`,
        impactoEconomico: {
          ahorro: rutaAlternativa.ahorro,
          costoAdicional: rutaAlternativa.costoAdicional
        },
        facilidadImplementacion: 'facil',
        accion: 'Usar ruta alternativa sugerida',
        metrica: 'Costo total de viaje',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id,
        contexto: {
          rutaOrigen: contexto.viaje.origen,
          rutaDestino: contexto.viaje.destino
        }
      });
    }

    // Carga de retorno
    const cargaRetorno = await this.buscarCargaRetorno(contexto.viaje.destino, contexto.viaje.origen);
    if (cargaRetorno) {
      recomendaciones.push({
        id: `carga-retorno-${Date.now()}`,
        tipo: 'ruta',
        prioridad: 'alta',
        titulo: 'Carga de Retorno Disponible',
        descripcion: `Carga disponible en ${contexto.viaje.destino} con destino cerca del origen.`,
        impactoEconomico: {
          ingresoAdicional: cargaRetorno.ingreso
        },
        facilidadImplementacion: 'moderada',
        accion: 'Contactar cliente para carga de retorno',
        metrica: 'Ingresos por viaje redondo',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id
      });
    }

    // Optimización de combustible
    const gasolineraOptima = this.analizarGasolinerasRuta(contexto.viaje.origen, contexto.viaje.destino);
    if (gasolineraOptima && gasolineraOptima.ahorro > 0) {
      recomendaciones.push({
        id: `combustible-ruta-${Date.now()}`,
        tipo: 'ruta',
        prioridad: 'baja',
        titulo: `Combustible ${gasolineraOptima.porcentajeAhorro}% más barato`,
        descripcion: `Desvío de +${gasolineraOptima.kmAdicionales}km para ahorrar $${gasolineraOptima.ahorro} en combustible.`,
        impactoEconomico: {
          ahorro: gasolineraOptima.ahorro,
          costoAdicional: gasolineraOptima.costoDesvio
        },
        facilidadImplementacion: 'facil',
        accion: 'Hacer parada en gasolinera recomendada',
        metrica: 'Costo de combustible',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id
      });
    }

    return recomendaciones;
  }

  // Recomendaciones de optimización de precios
  private async generarRecomendacionesPrecios(contexto: ContextoRecomendacion): Promise<RecomendacionInteligente[]> {
    const recomendaciones: RecomendacionInteligente[] = [];

    if (!contexto.viaje?.precio || !contexto.analisisIA) return recomendaciones;

    const { analisisIA, viaje } = contexto;

    // Precio por debajo del mercado
    if (viaje.precio < analisisIA.mercado.precioPromedio * 0.9) {
      const incrementoSugerido = analisisIA.mercado.precioPromedio * 0.95 - viaje.precio;
      recomendaciones.push({
        id: `precio-bajo-mercado-${Date.now()}`,
        tipo: 'precio',
        prioridad: 'alta',
        titulo: `Precio ${Math.round(((analisisIA.mercado.precioPromedio - viaje.precio) / analisisIA.mercado.precioPromedio) * 100)}% inferior al mercado`,
        descripcion: `Precio actual: $${viaje.precio}. Promedio del mercado: $${analisisIA.mercado.precioPromedio}. Incremento sugerido: $${Math.round(incrementoSugerido)}`,
        impactoEconomico: {
          ingresoAdicional: incrementoSugerido
        },
        facilidadImplementacion: 'facil',
        accion: 'Ajustar precio al promedio del mercado',
        metrica: 'Margen de ganancia',
        fechaGenerada: new Date().toISOString(),
        viajeId: viaje.id,
        contexto: {
          precioActual: viaje.precio,
          precioMercado: analisisIA.mercado.precioPromedio
        }
      });
    }

    // Análisis de aceptación histórica del cliente
    if (contexto.historico?.clienteAceptacion > 80) {
      const incrementoPosible = viaje.precio * 0.1;
      recomendaciones.push({
        id: `cliente-acepta-mas-${Date.now()}`,
        tipo: 'precio',
        prioridad: 'media',
        titulo: `Cliente acepta hasta $${Math.round(incrementoPosible)} más históricamente`,
        descripcion: `Historial de aceptación del cliente: ${contexto.historico.clienteAceptacion}%. Incremento seguro posible.`,
        impactoEconomico: {
          ingresoAdicional: incrementoPosible
        },
        facilidadImplementacion: 'facil',
        accion: 'Incrementar precio gradualmente',
        metrica: 'Tasa de aceptación',
        fechaGenerada: new Date().toISOString(),
        viajeId: viaje.id
      });
    }

    // Análisis estacional
    if (contexto.condicionesActuales?.temporada === 'alta') {
      const incrementoEstacional = viaje.precio * 0.15;
      recomendaciones.push({
        id: `temporada-alta-${Date.now()}`,
        tipo: 'precio',
        prioridad: 'alta',
        titulo: 'Temporada alta - incrementar 15%',
        descripcion: `Temporada de alta demanda detectada. Incremento recomendado: $${Math.round(incrementoEstacional)}`,
        impactoEconomico: {
          ingresoAdicional: incrementoEstacional
        },
        facilidadImplementacion: 'facil',
        accion: 'Aplicar tarifa de temporada alta',
        metrica: 'Ingresos por temporada',
        fechaGenerada: new Date().toISOString(),
        viajeId: viaje.id
      });
    }

    return recomendaciones;
  }

  // Recomendaciones operacionales
  private async generarRecomendacionesOperacion(contexto: ContextoRecomendacion): Promise<RecomendacionInteligente[]> {
    const recomendaciones: RecomendacionInteligente[] = [];

    // Consolidación de cargas
    if (contexto.viaje && contexto.empresa?.cargasPendientes > 0) {
      recomendaciones.push({
        id: `consolidar-cargas-${Date.now()}`,
        tipo: 'operacion',
        prioridad: 'media',
        titulo: 'Consolidar Cargas Similares',
        descripcion: `${contexto.empresa.cargasPendientes} cargas pendientes en rutas similares. Consolidar para optimizar costos.`,
        impactoEconomico: {
          ahorro: contexto.empresa.cargasPendientes * 200
        },
        facilidadImplementacion: 'moderada',
        accion: 'Reagrupar cargas por zona geográfica',
        metrica: 'Número de viajes consolidados',
        fechaGenerada: new Date().toISOString()
      });
    }

    // Programación optimizada
    if (contexto.viaje?.horaInicio && this.esHoraPico(contexto.viaje.horaInicio)) {
      recomendaciones.push({
        id: `evitar-hora-pico-${Date.now()}`,
        tipo: 'operacion',
        prioridad: 'baja',
        titulo: 'Evitar Hora Pico',
        descripcion: `Viaje programado en hora pico. Reprogramar puede reducir tiempo y combustible.`,
        impactoEconomico: {
          ahorro: 150
        },
        facilidadImplementacion: 'facil',
        accion: 'Reprogramar fuera de hora pico',
        metrica: 'Tiempo de viaje',
        fechaGenerada: new Date().toISOString(),
        viajeId: contexto.viaje.id
      });
    }

    return recomendaciones;
  }

  // Métodos auxiliares para cálculos
  private calcularAhorroCapacidad(capacidadUtilizada: number): number {
    const capacidadDesaprovechada = 100 - capacidadUtilizada;
    return capacidadDesaprovechada * 10; // $10 por punto de capacidad no utilizada
  }

  private calcularIngresoAdicional(capacidadDisponible: number): number {
    return capacidadDisponible * 25; // Ingreso potencial por capacidad adicional
  }

  private calcularAhorroCombustible(distancia: number, rendimientoActual: number): number {
    const rendimientoOptimo = 3.5;
    const combustibleActual = distancia / rendimientoActual;
    const combustibleOptimo = distancia / rendimientoOptimo;
    return (combustibleActual - combustibleOptimo) * 25; // Precio promedio del combustible
  }

  private calcularAhorroConfiguracion(actual: string, optima: string): number {
    const ahorros: Record<string, number> = {
      'C2->C3': 500,
      'T3S2->C2': 800,
      'T3S3->T3S2': 300
    };
    const key = `${actual}->${optima}`;
    return ahorros[key] || 400;
  }

  private analizarConfiguracionOptima(viaje: any): string | null {
    if (!viaje.peso || !viaje.distancia) return null;
    
    if (viaje.peso <= 8000 && viaje.distancia < 300) return 'C2';
    if (viaje.peso <= 15000 && viaje.distancia < 500) return 'C3';
    if (viaje.peso <= 30000) return 'T2S1';
    return 'T3S2';
  }

  private async analizarRutaAlternativa(origen: string, destino: string) {
    // Simulación de análisis de ruta alternativa
    const tieneAlternativa = Math.random() > 0.7;
    if (!tieneAlternativa) return null;

    return {
      diferenciaTiempo: Math.floor(Math.random() * 30) - 15,
      ahorro: Math.floor(Math.random() * 800) + 100,
      costoAdicional: Math.floor(Math.random() * 200)
    };
  }

  private async buscarCargaRetorno(origen: string, destino: string) {
    // Simulación de búsqueda de carga de retorno
    const tieneCarga = Math.random() > 0.8;
    if (!tieneCarga) return null;

    return {
      ingreso: Math.floor(Math.random() * 2000) + 1000
    };
  }

  private analizarGasolinerasRuta(origen: string, destino: string) {
    // Simulación de análisis de gasolineras
    const tieneOpcion = Math.random() > 0.6;
    if (!tieneOpcion) return null;

    const ahorro = Math.floor(Math.random() * 300) + 50;
    return {
      porcentajeAhorro: Math.round((ahorro / 1000) * 100),
      ahorro,
      kmAdicionales: Math.floor(Math.random() * 30) + 5,
      costoDesvio: Math.floor(Math.random() * 100) + 20
    };
  }

  private esHoraPico(hora: string): boolean {
    const horaNum = parseInt(hora.split(':')[0]);
    return (horaNum >= 7 && horaNum <= 9) || (horaNum >= 17 && horaNum <= 19);
  }

  private ordenarPorPrioridad(recomendaciones: RecomendacionInteligente[]): RecomendacionInteligente[] {
    const prioridadPeso = { alta: 3, media: 2, baja: 1 };
    
    return recomendaciones.sort((a, b) => {
      // Primero por prioridad
      const prioridadDiff = prioridadPeso[b.prioridad] - prioridadPeso[a.prioridad];
      if (prioridadDiff !== 0) return prioridadDiff;
      
      // Luego por impacto económico
      const impactoA = (a.impactoEconomico.ahorro || 0) + (a.impactoEconomico.ingresoAdicional || 0);
      const impactoB = (b.impactoEconomico.ahorro || 0) + (b.impactoEconomico.ingresoAdicional || 0);
      return impactoB - impactoA;
    });
  }

  // Obtener top recomendaciones para dashboard
  async obtenerTopRecomendaciones(contexto: ContextoRecomendacion, limite: number = 3): Promise<RecomendacionInteligente[]> {
    const recomendaciones = await this.generarRecomendaciones(contexto);
    return recomendaciones.slice(0, limite);
  }

  // Marcar recomendación como aplicada
  marcarComoAplicada(recomendacionId: string): void {
    // En una implementación real, esto se guardaría en la base de datos
    console.log(`Recomendación ${recomendacionId} marcada como aplicada`);
  }
}

export const recomendacionesService = new RecomendacionesService();
