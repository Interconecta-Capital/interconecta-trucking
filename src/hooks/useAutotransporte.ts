
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RemolqueData {
  id?: string;
  placa: string;
  subtipo_rem: string;
}

export interface AutotransporteData {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques: RemolqueData[];
}

export interface VehiculoGuardado {
  id: string;
  nombre_perfil: string;
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  seguros: any;
  remolques: RemolqueData[];
}

// Helper function to validate and convert Json to RemolqueData[]
const parseRemolques = (remolquesJson: any): RemolqueData[] => {
  if (!remolquesJson) return [];
  
  try {
    // If it's already an array, validate each item
    if (Array.isArray(remolquesJson)) {
      return remolquesJson.filter((item: any) => 
        item && 
        typeof item === 'object' && 
        typeof item.placa === 'string' && 
        typeof item.subtipo_rem === 'string'
      ).map((item: any) => ({
        id: item.id,
        placa: item.placa,
        subtipo_rem: item.subtipo_rem
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing remolques:', error);
    return [];
  }
};

export const useAutotransporte = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vehiculosGuardados, setVehiculosGuardados] = useState<VehiculoGuardado[]>([]);

  const cargarVehiculosGuardados = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehiculos_guardados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper type conversion
      const transformedData = (data || []).map(item => ({
        id: item.id,
        nombre_perfil: item.nombre_perfil,
        placa_vm: item.placa_vm,
        anio_modelo_vm: item.anio_modelo_vm,
        config_vehicular: item.config_vehicular,
        seguros: item.seguros,
        remolques: parseRemolques(item.remolques)
      }));
      
      setVehiculosGuardados(transformedData);
    } catch (error) {
      console.error('Error cargando vehículos guardados:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos guardados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const guardarVehiculo = useCallback(async (datos: AutotransporteData, nombrePerfil: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('vehiculos_guardados')
        .insert({
          nombre_perfil: nombrePerfil,
          placa_vm: datos.placa_vm,
          anio_modelo_vm: datos.anio_modelo_vm,
          config_vehicular: datos.config_vehicular,
          seguros: {
            perm_sct: datos.perm_sct,
            num_permiso_sct: datos.num_permiso_sct,
            asegura_resp_civil: datos.asegura_resp_civil,
            poliza_resp_civil: datos.poliza_resp_civil,
            asegura_med_ambiente: datos.asegura_med_ambiente,
            poliza_med_ambiente: datos.poliza_med_ambiente,
          },
          remolques: datos.remolques,
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Vehículo guardado correctamente",
      });

      await cargarVehiculosGuardados();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el vehículo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, cargarVehiculosGuardados]);

  const eliminarVehiculo = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('vehiculos_guardados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Vehículo eliminado correctamente",
      });

      await cargarVehiculosGuardados();
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, cargarVehiculosGuardados]);

  return {
    loading,
    vehiculosGuardados,
    cargarVehiculosGuardados,
    guardarVehiculo,
    eliminarVehiculo,
  };
};
