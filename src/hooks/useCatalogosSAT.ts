
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para obtener países
export const usePaises = () => {
  return useQuery({
    queryKey: ['cat-paises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_pais')
        .select('clave_pais, descripcion')
        .order('descripcion');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener vías de entrada/salida
export const useViasEntradaSalida = () => {
  return useQuery({
    queryKey: ['cat-vias-entrada-salida'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_via_entrada_salida')
        .select('clave_via, descripcion')
        .order('descripcion');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener configuraciones de autotransporte (para vía de transporte)
export const useConfiguracionesAutotransporte = () => {
  return useQuery({
    queryKey: ['cat-config-autotransporte'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_config_autotransporte')
        .select('clave_config, descripcion')
        .order('descripcion');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener tipos de permiso
export const useTiposPermiso = () => {
  return useQuery({
    queryKey: ['cat-tipos-permiso'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_tipo_permiso')
        .select('clave_permiso, descripcion')
        .order('descripcion');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener registros istmo
export const useRegistrosIstmo = () => {
  return useQuery({
    queryKey: ['cat-registros-istmo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_registro_istmo')
        .select('clave_registro, descripcion')
        .order('descripcion');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};
