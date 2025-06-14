
import { useState, useCallback, useEffect } from 'react';
import { useClientesProveedores, ClienteProveedor } from './useClientesProveedores';
import { useFlotaManager, VehiculoFlota, ConductorFlota, AsignacionInteligente } from './useFlotaManager';
import { routeOptimizer, RutaOptimizada, PuntoRuta, CriteriosOptimizacion } from '@/services/crm/RouteOptimizer';
import { toast } from 'sonner';

interface SugerenciaInteligente {
  tipo: 'cliente' | 'vehiculo' | 'ruta' | 'conductor';
  titulo: string;
  descripcion: string;
  datos: any;
  confidence: number;
  accion?: () => void;
}

interface ContextoCRM {
  ubicaciones?: any[];
  mercancias?: any[];
  fecha_viaje?: string;
  distancia_estimada?: number;
  peso_total?: number;
  volumen_total?: number;
}

export function useCRMIntegration() {
  const [sugerenciasActivas, setSugerenciasActivas] = useState<SugerenciaInteligente[]>([]);
  const [contexto, setContexto] = useState<ContextoCRM>({});
  const [loading, setLoading] = useState(false);

  const { 
    buscarClientes, 
    obtenerClientePorRFC, 
    crearCliente 
  } = useClientesProveedores();
  
  const { 
    sugerirAsignacion, 
    obtenerEstadisticasFlota,
    vehiculos,
    conductores 
  } = useFlotaManager();

  // Buscar cliente inteligente con sugerencias
  const buscarClienteInteligente = useCallback(async (termino: string, tipo: 'cliente' | 'proveedor' = 'cliente') => {
    try {
      setLoading(true);
      
      // Buscar en base de datos existente
      const resultados = await buscarClientes(termino);
      
      // Si no hay resultados exactos, verificar si es un RFC
      if (resultados.length === 0 && termino.length >= 10) {
        const clientePorRFC = await obtenerClientePorRFC(termino);
        if (clientePorRFC) {
          return [clientePorRFC];
        }
      }

      // Generar sugerencias inteligentes si hay pocos resultados
      if (resultados.length < 3) {
        const sugerencias = await generarSugerenciasCliente(termino, tipo);
        setSugerenciasActivas(prev => [...prev, ...sugerencias]);
      }

      return resultados;

    } catch (error) {
      console.error('Error en búsqueda inteligente:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [buscarClientes, obtenerClientePorRFC]);

  // Sugerir vehículo óptimo basado en contexto
  const sugerirVehiculoOptimo = useCallback(async (criterios: {
    peso_carga: number;
    volumen_carga?: number;
    distancia: number;
    tipo_mercancia: string;
    fecha_salida: string;
    urgencia?: 'baja' | 'media' | 'alta';
  }): Promise<AsignacionInteligente[]> => {
    try {
      setLoading(true);
      
      const asignaciones = await sugerirAsignacion({
        ...criterios,
        urgencia: criterios.urgencia || 'media'
      });

      // Generar sugerencias basadas en las asignaciones
      const sugerenciasVehiculo = asignaciones.slice(0, 3).map((asignacion, index) => ({
        tipo: 'vehiculo' as const,
        titulo: `Opción ${index + 1}: ${asignacion.vehiculo.marca} ${asignacion.vehiculo.modelo}`,
        descripcion: `Score: ${asignacion.score}/100 - ${asignacion.razones.join(', ')}`,
        datos: asignacion,
        confidence: asignacion.score / 100,
        accion: () => seleccionarAsignacion(asignacion)
      }));

      setSugerenciasActivas(prev => [...prev, ...sugerenciasVehiculo]);
      
      return asignaciones;

    } catch (error) {
      console.error('Error sugiriendo vehículo:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [sugerirAsignacion]);

  // Optimizar ruta con IA
  const optimizarRutaInteligente = useCallback(async (
    puntos: PuntoRuta[],
    criterios: CriteriosOptimizacion = { prioridad: 'equilibrado' }
  ): Promise<RutaOptimizada | null> => {
    try {
      setLoading(true);
      
      const rutaOptimizada = await routeOptimizer.optimizarRuta(puntos, criterios);
      
      // Generar sugerencias de la ruta
      const sugerenciasRuta: SugerenciaInteligente[] = [
        {
          tipo: 'ruta',
          titulo: 'Ruta Optimizada',
          descripcion: `${rutaOptimizada.distancia_total}km, ${Math.round(rutaOptimizada.tiempo_total/60)}h, Score: ${rutaOptimizada.eficiencia_score}/100`,
          datos: rutaOptimizada,
          confidence: rutaOptimizada.eficiencia_score / 100
        }
      ];

      // Agregar alertas como sugerencias
      if (rutaOptimizada.alertas && rutaOptimizada.alertas.length > 0) {
        rutaOptimizada.alertas.forEach(alerta => {
          sugerenciasRuta.push({
            tipo: 'ruta',
            titulo: 'Alerta de Ruta',
            descripcion: alerta,
            datos: { tipo: 'alerta', mensaje: alerta },
            confidence: 0.8
          });
        });
      }

      setSugerenciasActivas(prev => [...prev, ...sugerenciasRuta]);
      
      return rutaOptimizada;

    } catch (error) {
      console.error('Error optimizando ruta:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generar sugerencias contextuales
  const generarSugerenciasContextuales = useCallback(async (nuevoContexto: ContextoCRM) => {
    setContexto(prev => ({ ...prev, ...nuevoContexto }));

    // Analizar contexto y generar sugerencias
    const sugerencias: SugerenciaInteligente[] = [];

    // Sugerencias basadas en ubicaciones
    if (nuevoContexto.ubicaciones && nuevoContexto.ubicaciones.length >= 2) {
      // Calcular distancia y sugerir vehículos
      if (nuevoContexto.peso_total && nuevoContexto.peso_total > 0) {
        sugerencias.push({
          tipo: 'vehiculo',
          titulo: 'Vehículo Recomendado',
          descripcion: `Basado en ${nuevoContexto.peso_total}kg de carga`,
          datos: { peso: nuevoContexto.peso_total },
          confidence: 0.85,
          accion: () => {
            // Triggear búsqueda de vehículo
            sugerirVehiculoOptimo({
              peso_carga: nuevoContexto.peso_total!,
              volumen_carga: nuevoContexto.volumen_total,
              distancia: nuevoContexto.distancia_estimada || 100,
              tipo_mercancia: 'general',
              fecha_salida: nuevoContexto.fecha_viaje || new Date().toISOString()
            });
          }
        });
      }
    }

    // Sugerencias basadas en historial (simulado)
    if (contexto.ubicaciones && contexto.ubicaciones.length > 0) {
      sugerencias.push({
        tipo: 'cliente',
        titulo: 'Cliente Frecuente',
        descripcion: 'Este cliente ya ha usado nuestros servicios anteriormente',
        datos: { tipo: 'cliente_frecuente' },
        confidence: 0.75
      });
    }

    setSugerenciasActivas(prev => [...prev, ...sugerencias]);
  }, [contexto, sugerirVehiculoOptimo]);

  // Funciones auxiliares
  const generarSugerenciasCliente = async (termino: string, tipo: 'cliente' | 'proveedor'): Promise<SugerenciaInteligente[]> => {
    const sugerencias: SugerenciaInteligente[] = [];
    
    // Si parece un RFC, sugerir creación automática
    if (termino.length >= 10 && termino.match(/^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/)) {
      sugerencias.push({
        tipo: 'cliente',
        titulo: 'Crear Cliente con RFC',
        descripcion: `Crear nuevo ${tipo} con RFC: ${termino}`,
        datos: { rfc: termino, accion: 'crear' },
        confidence: 0.9,
        accion: () => {
          // Triggear creación rápida de cliente
          toast.info('Iniciando creación de cliente...');
        }
      });
    }

    return sugerencias;
  };

  const seleccionarAsignacion = (asignacion: AsignacionInteligente) => {
    toast.success(`Vehículo ${asignacion.vehiculo.placas} y conductor ${asignacion.conductor.nombre} seleccionados`);
    // Aquí se actualizaría el formulario principal
  };

  // Obtener métricas del CRM
  const obtenerMetricasCRM = useCallback(() => {
    const estadisticas = obtenerEstadisticasFlota();
    
    return {
      ...estadisticas,
      sugerencias_activas: sugerenciasActivas.length,
      contexto_completo: Object.keys(contexto).length,
      integracion_activa: true
    };
  }, [obtenerEstadisticasFlota, sugerenciasActivas.length, contexto]);

  // Limpiar sugerencias
  const limpiarSugerencias = useCallback((tipo?: SugerenciaInteligente['tipo']) => {
    if (tipo) {
      setSugerenciasActivas(prev => prev.filter(s => s.tipo !== tipo));
    } else {
      setSugerenciasActivas([]);
    }
  }, []);

  // Auto-limpiar sugerencias antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      setSugerenciasActivas(prev => prev.slice(-10)); // Mantener solo las últimas 10
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    // Estados
    loading,
    sugerenciasActivas,
    contexto,
    
    // Funciones principales
    buscarClienteInteligente,
    sugerirVehiculoOptimo,
    optimizarRutaInteligente,
    generarSugerenciasContextuales,
    
    // Métricas y control
    obtenerMetricasCRM,
    limpiarSugerencias,
    
    // Datos de flota
    vehiculos,
    conductores
  };
}
