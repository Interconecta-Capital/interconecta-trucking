
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ServicioPendiente {
  id: string;
  vehiculo_id: string;
  placa: string;
  tipo_mantenimiento: string;
  descripcion: string;
  fecha_programada: string;
  kilometraje_programado: number;
  kilometraje_actual: number;
  urgencia: 'normal' | 'pronto' | 'urgente';
  dias_restantes: number;
  kilometros_restantes: number;
}

export interface DocumentoVencido {
  tipo: string;
  vehiculo_id: string;
  placa: string;
  fecha_vencimiento: string;
  dias_restantes: number;
}

export interface Anomalia {
  tipo: string;
  descripcion: string;
  vehiculo_id: string;
  severidad: 'baja' | 'media' | 'alta';
  recomendacion: string;
}

export interface Taller {
  id: string;
  nombre: string;
  direccion: any;
  telefono?: string;
  calificacion_promedio: number;
  total_reviews: number;
  especialidades: string[];
  precios_promedio: any;
  distancia_km?: number;
}

export interface MantenimientoPredictivo {
  vehiculo: {
    id: string;
    placa: string;
    kilometrajeActual: number;
    ultimoServicio: Date | null;
    proximoServicio: {
      tipo: string;
      kilometraje: number;
      fechaEstimada: Date;
      urgencia: 'normal' | 'pronto' | 'urgente';
    };
  };
  alertas: {
    serviciosPendientes: ServicioPendiente[];
    documentosVencidos: DocumentoVencido[];
    anomaliasDetectadas: Anomalia[];
  };
  recomendaciones: {
    tallerOptimo: Taller | null;
    fechaOptima: Date;
    ahorroEstimado: number;
  };
}

export const useMantenimientoPredictivo = () => {
  const { user } = useAuth();
  const [alertas, setAlertas] = useState<ServicioPendiente[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar alertas de mantenimiento
  const cargarAlertas = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('check_maintenance_alerts', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Transform the data to match ServicioPendiente interface
      const alertasTransformadas = (data || []).map((item: any) => ({
        id: `${item.vehiculo_id}-${Date.now()}`, // Generate a unique ID
        vehiculo_id: item.vehiculo_id,
        placa: item.placa,
        tipo_mantenimiento: item.tipo_alerta,
        descripcion: item.descripcion,
        fecha_programada: new Date(Date.now() + (item.dias_restantes * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        kilometraje_programado: item.kilometros_restantes || 0,
        kilometraje_actual: 0,
        urgencia: item.urgencia as 'normal' | 'pronto' | 'urgente',
        dias_restantes: item.dias_restantes,
        kilometros_restantes: item.kilometros_restantes
      }));
      
      setAlertas(alertasTransformadas);
    } catch (err) {
      console.error('Error loading maintenance alerts:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [user?.id]);

  // Cargar talleres disponibles
  const cargarTalleres = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('talleres')
        .select('*')
        .eq('activo', true)
        .order('calificacion_promedio', { ascending: false });

      if (error) throw error;
      setTalleres(data || []);
    } catch (err) {
      console.error('Error loading talleres:', err);
    }
  }, []);

  // Cargar vehículos del usuario
  const cargarVehiculos = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true);

      if (error) throw error;
      setVehiculos(data || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  }, [user?.id]);

  // Cargar mantenimientos programados
  const cargarMantenimientos = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('mantenimientos_programados')
        .select(`
          *,
          vehiculos!inner(placa, kilometraje_actual)
        `)
        .eq('user_id', user.id)
        .order('fecha_programada', { ascending: true });

      if (error) throw error;
      setMantenimientos(data || []);
    } catch (err) {
      console.error('Error loading maintenance records:', err);
    }
  }, [user?.id]);

  // Calcular próximos servicios basado en algoritmo predictivo
  const calcularProximosServicios = useCallback((vehiculo: any) => {
    const serviciosBase = [
      { tipo: 'Cambio de aceite', intervalos_km: 5000, intervalos_meses: 6 },
      { tipo: 'Revisión general', intervalos_km: 10000, intervalos_meses: 12 },
      { tipo: 'Cambio de filtros', intervalos_km: 15000, intervalos_meses: 12 },
      { tipo: 'Revisión de frenos', intervalos_km: 20000, intervalos_meses: 24 }
    ];

    const proximosServicios = serviciosBase.map(servicio => {
      const kilometrajeProximo = Math.ceil(vehiculo.kilometraje_actual / servicio.intervalos_km) * servicio.intervalos_km;
      const kilometrosRestantes = kilometrajeProximo - vehiculo.kilometraje_actual;
      
      // Estimar fecha basada en uso promedio (assume 2000 km/mes)
      const mesesRestantes = kilometrosRestantes / 2000;
      const fechaEstimada = new Date();
      fechaEstimada.setMonth(fechaEstimada.getMonth() + mesesRestantes);

      let urgencia: 'normal' | 'pronto' | 'urgente' = 'normal';
      if (kilometrosRestantes <= 500) urgencia = 'urgente';
      else if (kilometrosRestantes <= 1500) urgencia = 'pronto';

      return {
        tipo: servicio.tipo,
        kilometraje: kilometrajeProximo,
        fechaEstimada,
        urgencia,
        kilometrosRestantes
      };
    });

    return proximosServicios.sort((a, b) => a.kilometrosRestantes - b.kilometrosRestantes)[0];
  }, []);

  // Optimizar programación de servicios
  const optimizarProgramacion = useCallback((flota: any[]) => {
    const serviciosAgrupados = new Map();

    flota.forEach(vehiculo => {
      const proximoServicio = calcularProximosServicios(vehiculo);
      const fechaKey = proximoServicio.fechaEstimada.toISOString().split('T')[0];
      
      if (!serviciosAgrupados.has(fechaKey)) {
        serviciosAgrupados.set(fechaKey, []);
      }
      
      serviciosAgrupados.get(fechaKey).push({
        vehiculo_id: vehiculo.id,
        placa: vehiculo.placa,
        servicio: proximoServicio
      });
    });

    return Array.from(serviciosAgrupados.entries()).map(([fecha, servicios]) => ({
      fecha,
      servicios,
      vehiculos_count: servicios.length,
      ahorro_estimado: servicios.length > 1 ? servicios.length * 200 : 0 // Descuento por volumen
    }));
  }, [calcularProximosServicios]);

  // Detectar anomalías en costos y patrones
  const detectarAnomalias = useCallback((vehiculo: any, historialMantenimiento: any[]) => {
    const anomalias: Anomalia[] = [];

    // Analizar costos anómalos
    const costosRecientes = historialMantenimiento
      .filter(m => m.vehiculo_id === vehiculo.id && m.costo_real)
      .slice(-5);

    if (costosRecientes.length >= 3) {
      const costoPromedio = costosRecientes.reduce((sum, m) => sum + m.costo_real, 0) / costosRecientes.length;
      const ultimoCosto = costosRecientes[costosRecientes.length - 1].costo_real;

      if (ultimoCosto > costoPromedio * 1.5) {
        anomalias.push({
          tipo: 'costo_anomalo',
          descripcion: `Último mantenimiento costó ${((ultimoCosto / costoPromedio - 1) * 100).toFixed(0)}% más que el promedio`,
          vehiculo_id: vehiculo.id,
          severidad: 'media',
          recomendacion: 'Revisar facturación y comparar con otros talleres'
        });
      }
    }

    // Detectar frecuencia anómala de reparaciones
    const reparacionesUltimos6Meses = historialMantenimiento.filter(m => {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 6);
      return new Date(m.fecha_realizada) > fechaLimite && m.tipo_mantenimiento === 'correctivo';
    });

    if (reparacionesUltimos6Meses.length > 3) {
      anomalias.push({
        tipo: 'fallas_frecuentes',
        descripcion: `${reparacionesUltimos6Meses.length} reparaciones correctivas en 6 meses`,
        vehiculo_id: vehiculo.id,
        severidad: 'alta',
        recomendacion: 'Evaluar reemplazo del vehículo o revisión integral'
      });
    }

    return anomalias;
  }, []);

  // Recomendar taller óptimo
  const recomendarTallerOptimo = useCallback((tipoServicio: string, ubicacionVehiculo?: any) => {
    const talleresCompatibles = talleres.filter(taller => 
      taller.especialidades.some(esp => 
        esp.toLowerCase().includes(tipoServicio.toLowerCase())
      ) || taller.especialidades.length === 0
    );

    if (talleresCompatibles.length === 0) return talleres[0] || null;

    // Scoring basado en calificación, reviews y precio
    const tallerConScore = talleresCompatibles.map(taller => {
      let score = 0;
      
      // Calificación (40% del score)
      score += (taller.calificacion_promedio / 5) * 40;
      
      // Número de reviews (20% del score)
      score += Math.min(taller.total_reviews / 50, 1) * 20;
      
      // Precio competitivo (40% del score)
      const precioServicio = taller.precios_promedio?.[tipoServicio] || 1000;
      const precioPromedio = talleres.reduce((sum, t) => sum + (t.precios_promedio?.[tipoServicio] || 1000), 0) / talleres.length;
      score += (1 - Math.min(precioServicio / precioPromedio, 2)) * 40;

      return { ...taller, score };
    });

    return tallerConScore.sort((a, b) => b.score - a.score)[0];
  }, [talleres]);

  // Crear mantenimiento programado
  const crearMantenimiento = useCallback(async (data: {
    vehiculo_id: string;
    tipo_mantenimiento: string;
    descripcion: string;
    fecha_programada: string;
    kilometraje_programado?: number;
    costo_estimado?: number;
    taller_id?: string;
  }) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      const { data: result, error } = await supabase
        .from('mantenimientos_programados')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Recargar datos
      await Promise.all([cargarAlertas(), cargarMantenimientos()]);
      
      return result;
    } catch (err) {
      console.error('Error creating maintenance:', err);
      throw err;
    }
  }, [user?.id, cargarAlertas, cargarMantenimientos]);

  // Actualizar mantenimiento
  const actualizarMantenimiento = useCallback(async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('mantenimientos_programados')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      await Promise.all([cargarAlertas(), cargarMantenimientos()]);
      return data;
    } catch (err) {
      console.error('Error updating maintenance:', err);
      throw err;
    }
  }, [user?.id, cargarAlertas, cargarMantenimientos]);

  // Generar análisis predictivo completo para un vehículo
  const generarAnalisisPredictivo = useCallback((vehiculo: any): MantenimientoPredictivo => {
    const proximoServicio = calcularProximosServicios(vehiculo);
    const historialMantenimiento = mantenimientos.filter(m => m.vehiculo_id === vehiculo.id);
    const anomalias = detectarAnomalias(vehiculo, historialMantenimiento);
    const tallerOptimo = recomendarTallerOptimo(proximoServicio.tipo);

    const documentosVencidos: DocumentoVencido[] = [];
    
    // Verificar documentos próximos a vencer
    if (vehiculo.vigencia_seguro) {
      const diasRestantes = Math.floor((new Date(vehiculo.vigencia_seguro).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (diasRestantes <= 30) {
        documentosVencidos.push({
          tipo: 'Seguro',
          vehiculo_id: vehiculo.id,
          placa: vehiculo.placa,
          fecha_vencimiento: vehiculo.vigencia_seguro,
          dias_restantes: diasRestantes
        });
      }
    }

    return {
      vehiculo: {
        id: vehiculo.id,
        placa: vehiculo.placa,
        kilometrajeActual: vehiculo.kilometraje_actual || 0,
        ultimoServicio: historialMantenimiento.length > 0 
          ? new Date(historialMantenimiento[historialMantenimiento.length - 1].fecha_realizada)
          : null,
        proximoServicio
      },
      alertas: {
        serviciosPendientes: alertas.filter(a => a.vehiculo_id === vehiculo.id),
        documentosVencidos,
        anomaliasDetectadas: anomalias
      },
      recomendaciones: {
        tallerOptimo,
        fechaOptima: proximoServicio.fechaEstimada,
        ahorroEstimado: tallerOptimo ? 150 : 0 // Ahorro estimado por usar taller recomendado
      }
    };
  }, [calcularProximosServicios, mantenimientos, alertas, detectarAnomalias, recomendarTallerOptimo]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          cargarAlertas(),
          cargarTalleres(),
          cargarVehiculos(),
          cargarMantenimientos()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      cargarDatos();
    }
  }, [user?.id, cargarAlertas, cargarTalleres, cargarVehiculos, cargarMantenimientos]);

  return {
    // Estado
    alertas,
    talleres,
    vehiculos,
    mantenimientos,
    isLoading,
    error,

    // Funciones principales
    calcularProximosServicios,
    optimizarProgramacion,
    detectarAnomalias,
    recomendarTallerOptimo,
    generarAnalisisPredictivo,

    // CRUD
    crearMantenimiento,
    actualizarMantenimiento,

    // Utilidades
    cargarAlertas,
    cargarTalleres,
    cargarVehiculos,
    cargarMantenimientos
  };
};
