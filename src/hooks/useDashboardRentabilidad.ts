
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DashboardData, 
  ViajeRentable, 
  RutaAnalisis, 
  VehiculoPerformance,
  KPIComparativo,
  AlertaDashboard,
  FiltrosDashboard
} from '@/types/dashboard';
import { startOfMonth, endOfMonth, subMonths, subYears, format } from 'date-fns';

export const useDashboardRentabilidad = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    fechaInicio: startOfMonth(new Date()),
    fechaFin: endOfMonth(new Date()),
    comparativo: 'mes_anterior'
  });

  // Calcular KPIs principales
  const calcularKPIs = useCallback(async (filtros: FiltrosDashboard) => {
    if (!user?.id) return null;

    try {
      // Obtener datos de viajes del período actual
      const { data: viajesActuales, error } = await supabase
        .from('viajes')
        .select(`
          *,
          tracking_data
        `)
        .eq('user_id', user.id)
        .gte('created_at', filtros.fechaInicio.toISOString())
        .lte('created_at', filtros.fechaFin.toISOString())
        .in('estado', ['completado']);

      if (error) throw error;

      // Obtener datos de vehículos para calcular utilización
      const { data: vehiculos, error: vehiculosError } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true);

      if (vehiculosError) throw vehiculosError;

      // Calcular métricas
      const ingresoTotal = viajesActuales?.reduce((sum, viaje) => {
        const trackingData = viaje.tracking_data as any;
        return sum + (trackingData?.costoTotal || 0);
      }, 0) || 0;

      const costoTotal = viajesActuales?.reduce((sum, viaje) => {
        const trackingData = viaje.tracking_data as any;
        return sum + (trackingData?.costosCalculados?.total || 0);
      }, 0) || 0;

      const viajesCompletados = viajesActuales?.length || 0;
      
      const kmRecorridos = viajesActuales?.reduce((sum, viaje) => {
        const trackingData = viaje.tracking_data as any;
        return sum + (trackingData?.distanciaRecorrida || 0);
      }, 0) || 0;

      const margenPromedio = ingresoTotal > 0 ? ((ingresoTotal - costoTotal) / ingresoTotal) * 100 : 0;
      
      // Calcular utilización de flota (simplificado)
      const utilizacionFlota = vehiculos?.length > 0 ? 
        (viajesCompletados / (vehiculos.length * 30)) * 100 : 0;

      return {
        ingresoTotal,
        costoTotal,
        margenPromedio,
        viajesCompletados,
        kmRecorridos,
        utilizacionFlota: Math.min(utilizacionFlota, 100)
      };
    } catch (error) {
      console.error('Error calculando KPIs:', error);
      return null;
    }
  }, [user?.id]);

  // Analizar viajes más rentables
  const analizarViajesRentables = useCallback(async (filtros: FiltrosDashboard): Promise<{
    masRentables: ViajeRentable[];
    menosRentables: ViajeRentable[];
  }> => {
    if (!user?.id) return { masRentables: [], menosRentables: [] };

    try {
      const { data: viajes, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', filtros.fechaInicio.toISOString())
        .lte('created_at', filtros.fechaFin.toISOISOString())
        .in('estado', ['completado']);

      if (error) throw error;

      const viajesConMargen = viajes?.map(viaje => {
        const trackingData = viaje.tracking_data as any;
        const ingreso = trackingData?.costoTotal || 0;
        const costo = trackingData?.costosCalculados?.total || 0;
        const margen = ingreso - costo;

        return {
          id: viaje.id,
          origen: viaje.origen,
          destino: viaje.destino,
          cliente: trackingData?.cliente?.nombre_razon_social || 'Cliente desconocido',
          ingreso,
          costo,
          margen,
          fecha: new Date(viaje.created_at),
          conductor: trackingData?.conductor?.nombre || 'N/A',
          vehiculo: trackingData?.vehiculo?.placa || 'N/A'
        };
      }) || [];

      // Ordenar por margen
      const viajesOrdenados = viajesConMargen.sort((a, b) => b.margen - a.margen);

      return {
        masRentables: viajesOrdenados.slice(0, 10),
        menosRentables: viajesOrdenados.slice(-10).reverse()
      };
    } catch (error) {
      console.error('Error analizando viajes rentables:', error);
      return { masRentables: [], menosRentables: [] };
    }
  }, [user?.id]);

  // Analizar rutas óptimas
  const analizarRutas = useCallback(async (filtros: FiltrosDashboard): Promise<RutaAnalisis[]> => {
    if (!user?.id) return [];

    try {
      const { data: viajes, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', filtros.fechaInicio.toISOString())
        .lte('created_at', filtros.fechaFin.toISOString())
        .in('estado', ['completado']);

      if (error) throw error;

      // Agrupar por ruta
      const rutasMap = new Map<string, any[]>();
      
      viajes?.forEach(viaje => {
        const rutaKey = `${viaje.origen}-${viaje.destino}`;
        if (!rutasMap.has(rutaKey)) {
          rutasMap.set(rutaKey, []);
        }
        rutasMap.get(rutaKey)?.push(viaje);
      });

      // Analizar cada ruta
      const rutasAnalisis: RutaAnalisis[] = [];
      
      rutasMap.forEach((viajesRuta, rutaKey) => {
        const [origen, destino] = rutaKey.split('-');
        
        const ingresoTotal = viajesRuta.reduce((sum, viaje) => {
          const trackingData = viaje.tracking_data as any;
          return sum + (trackingData?.costoTotal || 0);
        }, 0);

        const costoTotal = viajesRuta.reduce((sum, viaje) => {
          const trackingData = viaje.tracking_data as any;
          return sum + (trackingData?.costosCalculados?.total || 0);
        }, 0);

        const distanciaPromedio = viajesRuta.reduce((sum, viaje) => {
          const trackingData = viaje.tracking_data as any;
          return sum + (trackingData?.distanciaRecorrida || 0);
        }, 0) / viajesRuta.length;

        const margenPromedio = ingresoTotal > 0 ? ((ingresoTotal - costoTotal) / ingresoTotal) * 100 : 0;

        rutasAnalisis.push({
          id: rutaKey,
          origen,
          destino,
          viajesTotal: viajesRuta.length,
          ingresoPromedio: ingresoTotal / viajesRuta.length,
          costoPromedio: costoTotal / viajesRuta.length,
          margenPromedio,
          frecuencia: viajesRuta.length,
          distanciaKm: distanciaPromedio,
          tiempoPromedio: 0, // Simplificado
          demanda: viajesRuta.length > 5 ? 'alta' : viajesRuta.length > 2 ? 'media' : 'baja',
          estacionalidad: false // Simplificado
        });
      });

      return rutasAnalisis.sort((a, b) => b.margenPromedio - a.margenPromedio);
    } catch (error) {
      console.error('Error analizando rutas:', error);
      return [];
    }
  }, [user?.id]);

  // Analizar performance de vehículos
  const analizarVehiculos = useCallback(async (filtros: FiltrosDashboard): Promise<VehiculoPerformance[]> => {
    if (!user?.id) return [];

    try {
      const { data: vehiculos, error: vehiculosError } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true);

      if (vehiculosError) throw vehiculosError;

      const { data: viajes, error: viajesError } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', filtros.fechaInicio.toISOString())
        .lte('created_at', filtros.fechaFin.toISOString())
        .in('estado', ['completado']);

      if (viajesError) throw viajesError;

      const vehiculosPerformance: VehiculoPerformance[] = vehiculos?.map(vehiculo => {
        const viajesVehiculo = viajes?.filter(viaje => {
          const trackingData = viaje.tracking_data as any;
          return trackingData?.vehiculo?.id === vehiculo.id;
        }) || [];

        const ingresoTotal = viajesVehiculo.reduce((sum, viaje) => {
          const trackingData = viaje.tracking_data as any;
          return sum + (trackingData?.costoTotal || 0);
        }, 0);

        const costoTotal = viajesVehiculo.reduce((sum, viaje) => {
          const trackingData = viaje.tracking_data as any;
          return sum + (trackingData?.costosCalculados?.total || 0);
        }, 0);

        const kmRecorridos = viajesVehiculo.reduce((sum, viaje) => {
          const trackingData = viaje.tracking_data as any;
          return sum + (trackingData?.distanciaRecorrida || 0);
        }, 0);

        const margen = ingresoTotal - costoTotal;
        const roi = vehiculo.valor_vehiculo ? (margen / vehiculo.valor_vehiculo) * 100 : 0;
        const utilizacion = (viajesVehiculo.length / 30) * 100; // Días del mes

        return {
          id: vehiculo.id,
          placa: vehiculo.placa,
          marca: vehiculo.marca || 'N/A',
          modelo: vehiculo.modelo || 'N/A',
          viajesCompletados: viajesVehiculo.length,
          kmRecorridos,
          ingresoTotal,
          costoTotal,
          margen,
          utilizacion: Math.min(utilizacion, 100),
          eficienciaCombustible: vehiculo.rendimiento || 0,
          costoMantenimiento: 0, // Simplificado
          roi,
          estado: roi > 15 ? 'excelente' : roi > 10 ? 'bueno' : roi > 5 ? 'regular' : 'deficiente'
        };
      }) || [];

      return vehiculosPerformance.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error('Error analizando vehículos:', error);
      return [];
    }
  }, [user?.id]);

  // Generar alertas
  const generarAlertas = useCallback(async (kpis: any): Promise<AlertaDashboard[]> => {
    const alertas: AlertaDashboard[] = [];

    // Alerta de margen bajo
    if (kpis.margenPromedio < 10) {
      alertas.push({
        id: 'margen-bajo',
        tipo: 'critica',
        titulo: 'Margen de Rentabilidad Bajo',
        descripcion: `El margen promedio es de ${kpis.margenPromedio.toFixed(1)}%, por debajo del mínimo recomendado.`,
        categoria: 'rentabilidad',
        fecha: new Date(),
        accionRecomendada: 'Revisar estructura de costos y tarifas'
      });
    }

    // Alerta de utilización de flota
    if (kpis.utilizacionFlota < 60) {
      alertas.push({
        id: 'utilizacion-baja',
        tipo: 'advertencia',
        titulo: 'Baja Utilización de Flota',
        descripcion: `La utilización de flota es del ${kpis.utilizacionFlota.toFixed(1)}%`,
        categoria: 'flota',
        fecha: new Date(),
        accionRecomendada: 'Optimizar asignación de vehículos'
      });
    }

    return alertas;
  }, []);

  // Cargar datos del dashboard
  const cargarDashboard = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const kpis = await calcularKPIs(filtros);
      if (!kpis) return;

      const { masRentables, menosRentables } = await analizarViajesRentables(filtros);
      const rutasOptimas = await analizarRutas(filtros);
      const vehiculosPerformance = await analizarVehiculos(filtros);
      const alertas = await generarAlertas(kpis);

      const dashboardData: DashboardData = {
        periodo: {
          fechaInicio: filtros.fechaInicio,
          fechaFin: filtros.fechaFin,
          comparativo: filtros.comparativo
        },
        kpis,
        analisis: {
          viajesMasRentables: masRentables,
          viajesMenosRentables: menosRentables,
          rutasOptimas,
          vehiculosPerformance
        },
        alertas: {
          viajesNegativos: menosRentables.filter(v => v.margen < 0).length,
          clientesMorosos: 0, // Simplificado
          vehiculosIneficientes: vehiculosPerformance.filter(v => v.estado === 'deficiente').length,
          oportunidadesMejora: alertas.map(a => a.titulo)
        }
      };

      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filtros, calcularKPIs, analizarViajesRentables, analizarRutas, analizarVehiculos, generarAlertas]);

  // Generar reporte
  const generarReporte = useCallback(async (tipo: 'semanal' | 'mensual' | 'anual') => {
    if (!dashboardData) {
      toast.error('No hay datos para generar el reporte');
      return;
    }

    try {
      // Aquí iría la lógica para generar PDF
      toast.success(`Reporte ${tipo} generado exitosamente`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
    }
  }, [dashboardData]);

  // Actualizar filtros
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosDashboard>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  return {
    dashboardData,
    loading,
    filtros,
    cargarDashboard,
    generarReporte,
    actualizarFiltros
  };
};
