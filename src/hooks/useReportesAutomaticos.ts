import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SeccionReporte {
  id: string;
  nombre: string;
  tipo: 'tabla' | 'grafico' | 'kpi' | 'texto';
  configuracion: any;
  activa: boolean;
}

export interface ConfiguracionReporte {
  id?: string;
  nombre: string;
  tipo: 'diario' | 'semanal' | 'mensual' | 'personalizado';
  destinatarios: string[];
  formato: 'pdf' | 'excel' | 'email_html';
  secciones: SeccionReporte[];
  horario: {
    frecuencia: string; // cron expression
    zona_horaria: string;
  };
  filtros: {
    vehiculos?: string[];
    rutas?: string[];
    conductores?: string[];
    periodo?: [Date, Date];
  };
  activo: boolean;
}

export interface ReporteGenerado {
  id: string;
  configuracion_id: string;
  fecha_generacion: Date;
  tipo: string;
  formato: string;
  archivo_url?: string;
  estado: 'generando' | 'completado' | 'error';
  error_mensaje?: string;
  destinatarios_enviados: string[];
}

export const useReportesAutomaticos = () => {
  const { user } = useAuth();
  const [reportes, setReportes] = useState<ConfiguracionReporte[]>([]);
  const [historialReportes, setHistorialReportes] = useState<ReporteGenerado[]>([]);
  const [loading, setLoading] = useState(false);

  // Plantillas predefinidas por tipo de reporte
  const plantillasPredefinidas: Record<string, SeccionReporte[]> = {
    diario: [
      {
        id: 'viajes-dia',
        nombre: 'Viajes del Día',
        tipo: 'tabla',
        configuracion: {
          columnas: ['origen', 'destino', 'conductor', 'estado', 'hora_inicio'],
          filtros: { fecha: 'hoy' }
        },
        activa: true
      },
      {
        id: 'alertas-activas',
        nombre: 'Alertas Activas',
        tipo: 'tabla',
        configuracion: {
          columnas: ['tipo', 'descripcion', 'urgencia', 'vehiculo'],
          filtros: { estado: 'activa' }
        },
        activa: true
      },
      {
        id: 'performance-tiempo-real',
        nombre: 'Performance en Tiempo Real',
        tipo: 'kpi',
        configuracion: {
          metricas: ['viajes_completados', 'puntualidad', 'eficiencia_combustible'],
          periodo: '24h'
        },
        activa: true
      }
    ],
    semanal: [
      {
        id: 'kpis-semana',
        nombre: 'KPIs de la Semana',
        tipo: 'grafico',
        configuracion: {
          tipo_grafico: 'tendencia',
          metricas: ['ingresos', 'costos', 'margen', 'viajes'],
          periodo: 'semana_actual'
        },
        activa: true
      },
      {
        id: 'analisis-tendencias',
        nombre: 'Análisis de Tendencias',
        tipo: 'grafico',
        configuracion: {
          tipo_grafico: 'comparativo',
          periodos: ['semana_actual', 'semana_anterior'],
          metricas: ['eficiencia', 'rentabilidad']
        },
        activa: true
      },
      {
        id: 'cumplimiento-objetivos',
        nombre: 'Cumplimiento de Objetivos',
        tipo: 'kpi',
        configuracion: {
          objetivos: ['meta_ingresos', 'meta_viajes', 'meta_eficiencia'],
          visualizacion: 'porcentaje_cumplimiento'
        },
        activa: true
      }
    ],
    mensual: [
      {
        id: 'pyl-completo',
        nombre: 'P&L Completo',
        tipo: 'tabla',
        configuracion: {
          secciones: ['ingresos', 'costos_operativos', 'gastos_admin', 'utilidad_neta'],
          comparacion_mes_anterior: true
        },
        activa: true
      },
      {
        id: 'rentabilidad-unidades',
        nombre: 'Análisis de Rentabilidad por Unidad',
        tipo: 'grafico',
        configuracion: {
          tipo_grafico: 'barras',
          agrupacion: 'vehiculo',
          metricas: ['ingresos', 'costos', 'margen']
        },
        activa: true
      },
      {
        id: 'benchmarking-mercado',
        nombre: 'Benchmarking vs Mercado',
        tipo: 'grafico',
        configuracion: {
          tipo_grafico: 'radar',
          metricas: ['costo_km', 'precio_promedio', 'eficiencia'],
          comparacion_mercado: true
        },
        activa: true
      }
    ]
  };

  const programarReporte = useCallback(async (configuracion: ConfiguracionReporte) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return false;
    }

    setLoading(true);
    try {
      // Validar configuración
      if (!configuracion.nombre || configuracion.destinatarios.length === 0) {
        throw new Error('Nombre y destinatarios son requeridos');
      }

      // Validar formato de emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailsInvalidos = configuracion.destinatarios.filter(email => !emailRegex.test(email));
      if (emailsInvalidos.length > 0) {
        throw new Error(`Emails inválidos: ${emailsInvalidos.join(', ')}`);
      }

      // Preparar datos para la base de datos, convirtiendo tipos complejos a JSON
      const filtrosParaDB = {
        ...configuracion.filtros,
        periodo: configuracion.filtros.periodo ? 
          configuracion.filtros.periodo.map(date => date.toISOString()) : 
          undefined
      };

      // Guardar configuración en la base de datos
      const { data, error } = await supabase
        .from('configuraciones_reportes')
        .insert({
          user_id: user.id,
          nombre: configuracion.nombre,
          tipo: configuracion.tipo,
          destinatarios: JSON.stringify(configuracion.destinatarios),
          formato: configuracion.formato,
          secciones: JSON.stringify(configuracion.secciones),
          horario: JSON.stringify(configuracion.horario),
          filtros: JSON.stringify(filtrosParaDB),
          activo: configuracion.activo
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setReportes(prev => [...prev, { ...configuracion, id: data.id }]);

      // Programar el cron job (esto se haría en el backend)
      await supabase.functions.invoke('programar-reporte', {
        body: { configuracion_id: data.id, configuracion }
      });

      toast.success('Reporte programado exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error programando reporte:', error);
      toast.error(error.message || 'Error al programar reporte');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generarReporteAhora = useCallback(async (configuracionId: string) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return null;
    }

    setLoading(true);
    try {
      // Llamar a la función edge para generar el reporte inmediatamente
      const { data, error } = await supabase.functions.invoke('generar-reporte', {
        body: { 
          configuracion_id: configuracionId,
          ejecucion_inmediata: true
        }
      });

      if (error) throw error;

      // Actualizar historial
      const nuevoReporte: ReporteGenerado = {
        id: data.reporte_id,
        configuracion_id: configuracionId,
        fecha_generacion: new Date(),
        tipo: data.tipo,
        formato: data.formato,
        estado: 'generando',
        destinatarios_enviados: []
      };

      setHistorialReportes(prev => [nuevoReporte, ...prev]);

      toast.success('Reporte iniciado. Recibirás una notificación cuando esté listo.');
      return nuevoReporte;
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      toast.error(error.message || 'Error al generar reporte');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const obtenerReportes = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: configuraciones, error: errorConfig } = await supabase
        .from('configuraciones_reportes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (errorConfig) throw errorConfig;

      const { data: historial, error: errorHistorial } = await supabase
        .from('reportes_generados')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_generacion', { ascending: false })
        .limit(50);

      if (errorHistorial) throw errorHistorial;

      // Convertir datos de la base de datos a los tipos TypeScript
      const reportesConvertidos: ConfiguracionReporte[] = (configuraciones || []).map(config => {
        try {
          return {
            id: config.id,
            nombre: config.nombre,
            tipo: config.tipo as ConfiguracionReporte['tipo'],
            destinatarios: typeof config.destinatarios === 'string' ? 
              JSON.parse(config.destinatarios) : 
              (Array.isArray(config.destinatarios) ? config.destinatarios : []),
            formato: config.formato as ConfiguracionReporte['formato'],
            secciones: typeof config.secciones === 'string' ? 
              JSON.parse(config.secciones) : 
              (Array.isArray(config.secciones) ? config.secciones as unknown as SeccionReporte[] : []),
            horario: typeof config.horario === 'string' ? 
              JSON.parse(config.horario) : 
              (config.horario as ConfiguracionReporte['horario']),
            filtros: (() => {
              let filtros = typeof config.filtros === 'string' ? 
                JSON.parse(config.filtros) : 
                (config.filtros || {});
              
              // Convertir periodo de strings a dates si existe
              if (filtros.periodo && Array.isArray(filtros.periodo)) {
                filtros.periodo = filtros.periodo.map((date: string) => new Date(date));
              }
              
              return filtros;
            })(),
            activo: config.activo
          };
        } catch (parseError) {
          console.error('Error parsing config:', parseError, config);
          return null;
        }
      }).filter(Boolean) as ConfiguracionReporte[];

      const historialConvertido: ReporteGenerado[] = (historial || []).map(reporte => ({
        id: reporte.id,
        configuracion_id: reporte.configuracion_id,
        fecha_generacion: new Date(reporte.fecha_generacion),
        tipo: reporte.tipo,
        formato: reporte.formato,
        archivo_url: reporte.archivo_url || undefined,
        estado: reporte.estado as ReporteGenerado['estado'],
        error_mensaje: reporte.error_mensaje || undefined,
        destinatarios_enviados: typeof reporte.destinatarios_enviados === 'string' ? 
          JSON.parse(reporte.destinatarios_enviados) : 
          (Array.isArray(reporte.destinatarios_enviados) ? reporte.destinatarios_enviados : [])
      }));

      setReportes(reportesConvertidos);
      setHistorialReportes(historialConvertido);
    } catch (error: any) {
      console.error('Error obteniendo reportes:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const actualizarReporte = useCallback(async (id: string, configuracion: Partial<ConfiguracionReporte>) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      // Preparar filtros y datos para la base de datos
      const updateData: any = {};
      
      if (configuracion.nombre) updateData.nombre = configuracion.nombre;
      if (configuracion.tipo) updateData.tipo = configuracion.tipo;
      if (configuracion.formato) updateData.formato = configuracion.formato;
      if (configuracion.activo !== undefined) updateData.activo = configuracion.activo;
      
      if (configuracion.destinatarios) {
        updateData.destinatarios = JSON.stringify(configuracion.destinatarios);
      }
      
      if (configuracion.secciones) {
        updateData.secciones = JSON.stringify(configuracion.secciones);
      }
      
      if (configuracion.horario) {
        updateData.horario = JSON.stringify(configuracion.horario);
      }
      
      if (configuracion.filtros) {
        const filtrosParaDB = {
          ...configuracion.filtros,
          periodo: configuracion.filtros.periodo ? 
            configuracion.filtros.periodo.map(date => date.toISOString()) : 
            undefined
        };
        updateData.filtros = JSON.stringify(filtrosParaDB);
      }

      const { error } = await supabase
        .from('configuraciones_reportes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setReportes(prev => prev.map(r => r.id === id ? { ...r, ...configuracion } : r));
      toast.success('Reporte actualizado');
      return true;
    } catch (error: any) {
      console.error('Error actualizando reporte:', error);
      toast.error('Error al actualizar reporte');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const eliminarReporte = useCallback(async (id: string) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('configuraciones_reportes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setReportes(prev => prev.filter(r => r.id !== id));
      toast.success('Reporte eliminado');
      return true;
    } catch (error: any) {
      console.error('Error eliminando reporte:', error);
      toast.error('Error al eliminar reporte');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const obtenerPlantilla = useCallback((tipo: string): SeccionReporte[] => {
    return plantillasPredefinidas[tipo] || [];
  }, []);

  const validarConfiguracion = useCallback((configuracion: ConfiguracionReporte): string[] => {
    const errores: string[] = [];

    if (!configuracion.nombre?.trim()) {
      errores.push('El nombre del reporte es requerido');
    }

    if (configuracion.destinatarios.length === 0) {
      errores.push('Debe especificar al menos un destinatario');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsInvalidos = configuracion.destinatarios.filter(email => !emailRegex.test(email));
    if (emailsInvalidos.length > 0) {
      errores.push(`Emails inválidos: ${emailsInvalidos.join(', ')}`);
    }

    if (!configuracion.horario.frecuencia) {
      errores.push('La frecuencia de ejecución es requerida');
    }

    if (configuracion.secciones.length === 0) {
      errores.push('Debe incluir al menos una sección en el reporte');
    }

    return errores;
  }, []);

  return {
    reportes,
    historialReportes,
    loading,
    programarReporte,
    generarReporteAhora,
    obtenerReportes,
    actualizarReporte,
    eliminarReporte,
    obtenerPlantilla,
    validarConfiguracion
  };
};
