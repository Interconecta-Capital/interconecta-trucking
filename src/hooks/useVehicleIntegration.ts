
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface VehiculoConIntegracion {
  id: string;
  placa: string;
  modelo: string;
  año: number;
  estado: 'disponible' | 'en_viaje' | 'mantenimiento' | 'fuera_servicio';
  ubicacionActual?: {
    lat: number;
    lng: number;
    direccion: string;
    timestamp: string;
  };
  telemetria?: {
    velocidad: number;
    combustible: number;
    odometro: number;
    temperatura: number;
    presion_aceite: number;
    ultimaActualizacion: string;
  };
  documentos: {
    verificacion: { vigencia: string; estado: 'vigente' | 'por_vencer' | 'vencido' };
    seguro: { vigencia: string; estado: 'vigente' | 'por_vencer' | 'vencido' };
    tarjeta_circulacion: { vigencia: string; estado: 'vigente' | 'por_vencer' | 'vencido' };
  };
  mantenimiento: {
    ultimoServicio: string;
    proximoServicio: string;
    kmUltimoServicio: number;
    alertas: string[];
  };
}

export interface ConductorConIntegracion {
  id: string;
  nombre: string;
  licencia: string;
  estado: 'disponible' | 'en_viaje' | 'descanso' | 'fuera_servicio';
  ubicacionActual?: {
    lat: number;
    lng: number;
    direccion: string;
    timestamp: string;
  };
  documentos: {
    licencia: { vigencia: string; estado: 'vigente' | 'por_vencer' | 'vencido' };
    aptitud_fisica: { vigencia: string; estado: 'vigente' | 'por_vencer' | 'vencido' };
    curso_sct: { vigencia: string; estado: 'vigente' | 'por_vencer' | 'vencido' };
  };
  estadisticas: {
    horasConducidas: number;
    kmRecorridos: number;
    viajesCompletados: number;
    calificacionPromedio: number;
  };
}

export const useVehicleIntegration = () => {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState<VehiculoConIntegracion[]>([]);
  const [conductores, setConductores] = useState<ConductorConIntegracion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadVehiculosConIntegracion();
      loadConductoresConIntegracion();
      
      // Configurar actualizaciones en tiempo real
      setupRealtimeUpdates();
    }
  }, [user?.id]);

  const loadVehiculosConIntegracion = async () => {
    setLoading(true);
    try {
      const { data: vehiculosData, error: vehiculosError } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user?.id);

      if (vehiculosError) throw vehiculosError;

      // Enriquecer datos con información integrada
      const vehiculosEnriquecidos: VehiculoConIntegracion[] = await Promise.all(
        (vehiculosData || []).map(async (vehiculo) => {
          // Simular datos de telemetría e integración
          const vehiculoEnriquecido: VehiculoConIntegracion = {
            id: vehiculo.id,
            placa: vehiculo.placa,
            modelo: vehiculo.modelo,
            año: vehiculo.anio, // Use 'anio' from database
            estado: (vehiculo.estado || 'disponible') as 'disponible' | 'en_viaje' | 'mantenimiento' | 'fuera_servicio',
            ubicacionActual: {
              lat: 19.4326 + (Math.random() - 0.5) * 0.1,
              lng: -99.1332 + (Math.random() - 0.5) * 0.1,
              direccion: 'Av. Insurgentes Sur 123, CDMX',
              timestamp: new Date().toISOString()
            },
            telemetria: {
              velocidad: Math.floor(Math.random() * 80),
              combustible: Math.floor(Math.random() * 100),
              odometro: Math.floor(Math.random() * 100000) + 50000,
              temperatura: Math.floor(Math.random() * 40) + 80,
              presion_aceite: Math.floor(Math.random() * 20) + 40,
              ultimaActualizacion: new Date().toISOString()
            },
            documentos: {
              verificacion: {
                vigencia: '2024-12-31',
                estado: 'vigente'
              },
              seguro: {
                vigencia: '2024-12-31',
                estado: 'vigente'
              },
              tarjeta_circulacion: {
                vigencia: '2024-12-31',
                estado: 'por_vencer'
              }
            },
            mantenimiento: {
              ultimoServicio: '2024-01-15',
              proximoServicio: '2024-07-15',
              kmUltimoServicio: 45000,
              alertas: vehiculo.estado === 'mantenimiento' ? ['Cambio de aceite pendiente'] : []
            }
          };

          return vehiculoEnriquecido;
        })
      );

      setVehiculos(vehiculosEnriquecidos);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
      toast.error('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const loadConductoresConIntegracion = async () => {
    try {
      const { data: conductoresData, error: conductoresError } = await supabase
        .from('conductores')
        .select('*')
        .eq('user_id', user?.id);

      if (conductoresError) throw conductoresError;

      // Enriquecer datos con información integrada
      const conductoresEnriquecidos: ConductorConIntegracion[] = (conductoresData || []).map((conductor) => ({
        id: conductor.id,
        nombre: conductor.nombre,
        licencia: conductor.num_licencia || 'N/A',
        estado: (conductor.estado || 'disponible') as 'disponible' | 'en_viaje' | 'descanso' | 'fuera_servicio',
        ubicacionActual: {
          lat: 19.4326 + (Math.random() - 0.5) * 0.1,
          lng: -99.1332 + (Math.random() - 0.5) * 0.1,
          direccion: 'Ubicación actual del conductor',
          timestamp: new Date().toISOString()
        },
        documentos: {
          licencia: {
            vigencia: conductor.vigencia_licencia || '2024-12-31',
            estado: 'vigente'
          },
          aptitud_fisica: {
            vigencia: '2024-12-31',
            estado: 'vigente'
          },
          curso_sct: {
            vigencia: '2025-12-31',
            estado: 'vigente'
          }
        },
        estadisticas: {
          horasConducidas: Math.floor(Math.random() * 1000) + 500,
          kmRecorridos: Math.floor(Math.random() * 50000) + 25000,
          viajesCompletados: Math.floor(Math.random() * 100) + 50,
          calificacionPromedio: Math.floor(Math.random() * 2) + 4 // 4-5 estrellas
        }
      }));

      setConductores(conductoresEnriquecidos);
    } catch (error) {
      console.error('Error cargando conductores:', error);
      toast.error('Error al cargar conductores');
    }
  };

  const setupRealtimeUpdates = () => {
    // Configurar canales de tiempo real para vehículos
    const vehiculosChannel = supabase
      .channel('vehiculos-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehiculos',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          loadVehiculosConIntegracion();
        }
      )
      .subscribe();

    // Configurar canales de tiempo real para conductores
    const conductoresChannel = supabase
      .channel('conductores-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conductores',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          loadConductoresConIntegracion();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vehiculosChannel);
      supabase.removeChannel(conductoresChannel);
    };
  };

  const actualizarEstadoVehiculo = async (vehiculoId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('vehiculos')
        .update({ estado: nuevoEstado })
        .eq('id', vehiculoId);

      if (error) throw error;

      // Actualizar estado local
      setVehiculos(prev => 
        prev.map(v => 
          v.id === vehiculoId 
            ? { ...v, estado: nuevoEstado as any }
            : v
        )
      );

      toast.success('Estado del vehículo actualizado');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar estado del vehículo');
    }
  };

  const actualizarEstadoConductor = async (conductorId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('conductores')
        .update({ estado: nuevoEstado })
        .eq('id', conductorId);

      if (error) throw error;

      // Actualizar estado local
      setConductores(prev => 
        prev.map(c => 
          c.id === conductorId 
            ? { ...c, estado: nuevoEstado as any }
            : c
        )
      );

      toast.success('Estado del conductor actualizado');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar estado del conductor');
    }
  };

  const obtenerVehiculosDisponibles = () => {
    return vehiculos.filter(v => v.estado === 'disponible');
  };

  const obtenerConductoresDisponibles = () => {
    return conductores.filter(c => c.estado === 'disponible');
  };

  const obtenerAlertasMantenimiento = () => {
    const alertas: Array<{ vehiculoId: string; placa: string; alertas: string[] }> = [];
    
    vehiculos.forEach(vehiculo => {
      if (vehiculo.mantenimiento.alertas.length > 0) {
        alertas.push({
          vehiculoId: vehiculo.id,
          placa: vehiculo.placa,
          alertas: vehiculo.mantenimiento.alertas
        });
      }
    });

    return alertas;
  };

  const obtenerDocumentosVencidos = () => {
    const documentosVencidos: Array<{ 
      tipo: 'vehiculo' | 'conductor';
      id: string;
      nombre: string;
      documento: string;
      vigencia: string;
    }> = [];

    vehiculos.forEach(vehiculo => {
      Object.entries(vehiculo.documentos).forEach(([doc, info]) => {
        if (info.estado === 'vencido' || info.estado === 'por_vencer') {
          documentosVencidos.push({
            tipo: 'vehiculo',
            id: vehiculo.id,
            nombre: vehiculo.placa,
            documento: doc,
            vigencia: info.vigencia
          });
        }
      });
    });

    conductores.forEach(conductor => {
      Object.entries(conductor.documentos).forEach(([doc, info]) => {
        if (info.estado === 'vencido' || info.estado === 'por_vencer') {
          documentosVencidos.push({
            tipo: 'conductor',
            id: conductor.id,
            nombre: conductor.nombre,
            documento: doc,
            vigencia: info.vigencia
          });
        }
      });
    });

    return documentosVencidos;
  };

  return {
    vehiculos,
    conductores,
    loading,
    actualizarEstadoVehiculo,
    actualizarEstadoConductor,
    obtenerVehiculosDisponibles,
    obtenerConductoresDisponibles,
    obtenerAlertasMantenimiento,
    obtenerDocumentosVencidos,
    loadVehiculosConIntegracion,
    loadConductoresConIntegracion
  };
};
