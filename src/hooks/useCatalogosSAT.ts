
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para obtener países
export const usePaises = () => {
  return useQuery({
    queryKey: ['cat-paises'],
    queryFn: async () => {
      console.log('Fetching países from SAT catalog...');
      const { data, error } = await supabase
        .from('cat_pais')
        .select('clave_pais, descripcion')
        .order('descripcion');
      
      if (error) {
        console.error('Error fetching países:', error);
        throw error;
      }
      
      console.log('Países fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook para obtener vías de entrada/salida
export const useViasEntradaSalida = () => {
  return useQuery({
    queryKey: ['cat-vias-entrada-salida'],
    queryFn: async () => {
      console.log('Fetching vías de entrada/salida from SAT catalog...');
      const { data, error } = await supabase
        .from('cat_via_entrada_salida')
        .select('clave_via, descripcion')
        .order('descripcion');
      
      if (error) {
        console.error('Error fetching vías de entrada/salida:', error);
        throw error;
      }
      
      console.log('Vías de entrada/salida fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook para obtener configuraciones de autotransporte (para vía de transporte)
export const useConfiguracionesAutotransporte = () => {
  return useQuery({
    queryKey: ['cat-config-autotransporte'],
    queryFn: async () => {
      console.log('Fetching configuraciones de autotransporte from SAT catalog...');
      const { data, error } = await supabase
        .from('cat_config_autotransporte')
        .select('clave_config, descripcion')
        .order('descripcion');
      
      if (error) {
        console.error('Error fetching configuraciones autotransporte:', error);
        throw error;
      }
      
      console.log('Configuraciones autotransporte fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook para obtener tipos de permiso
export const useTiposPermiso = () => {
  return useQuery({
    queryKey: ['cat-tipos-permiso'],
    queryFn: async () => {
      console.log('Fetching tipos de permiso from SAT catalog...');
      const { data, error } = await supabase
        .from('cat_tipo_permiso')
        .select('clave_permiso, descripcion')
        .order('descripcion');
      
      if (error) {
        console.error('Error fetching tipos de permiso:', error);
        throw error;
      }
      
      console.log('Tipos de permiso fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook para obtener registros istmo
export const useRegistrosIstmo = () => {
  return useQuery({
    queryKey: ['cat-registros-istmo'],
    queryFn: async () => {
      console.log('Fetching registros istmo from SAT catalog...');
      const { data, error } = await supabase
        .from('cat_registro_istmo')
        .select('clave_registro, descripcion')
        .order('descripcion');
      
      if (error) {
        console.error('Error fetching registros istmo:', error);
        throw error;
      }
      
      console.log('Registros istmo fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};
