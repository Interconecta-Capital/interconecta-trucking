
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        toast.error('Error al cargar el catálogo de países');
        throw error;
      }
      
      console.log('Países fetched successfully:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('No países found in catalog');
        toast.warning('No se encontraron países en el catálogo SAT');
      }
      
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      onError: (error: any) => {
        console.error('Failed to load países after retries:', error);
        toast.error('No se pudo cargar el catálogo de países');
      }
    }
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
        toast.error('Error al cargar el catálogo de vías de entrada/salida');
        throw error;
      }
      
      console.log('Vías de entrada/salida fetched successfully:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('No vías de entrada/salida found in catalog');
        toast.warning('No se encontraron vías de entrada/salida en el catálogo SAT');
      }
      
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      onError: (error: any) => {
        console.error('Failed to load vías de entrada/salida after retries:', error);
        toast.error('No se pudo cargar el catálogo de vías de entrada/salida');
      }
    }
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
        toast.error('Error al cargar el catálogo de configuraciones de autotransporte');
        throw error;
      }
      
      console.log('Configuraciones autotransporte fetched successfully:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('No configuraciones autotransporte found in catalog');
        toast.warning('No se encontraron configuraciones de autotransporte en el catálogo SAT');
      }
      
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      onError: (error: any) => {
        console.error('Failed to load configuraciones autotransporte after retries:', error);
        toast.error('No se pudo cargar el catálogo de configuraciones de autotransporte');
      }
    }
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
        toast.error('Error al cargar el catálogo de tipos de permiso');
        throw error;
      }
      
      console.log('Tipos de permiso fetched successfully:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('No tipos de permiso found in catalog');
        toast.warning('No se encontraron tipos de permiso en el catálogo SAT');
      }
      
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      onError: (error: any) => {
        console.error('Failed to load tipos de permiso after retries:', error);
        toast.error('No se pudo cargar el catálogo de tipos de permiso');
      }
    }
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
        toast.error('Error al cargar el catálogo de registros istmo');
        throw error;
      }
      
      console.log('Registros istmo fetched successfully:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('No registros istmo found in catalog');
        toast.warning('No se encontraron registros istmo en el catálogo SAT');
      }
      
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      onError: (error: any) => {
        console.error('Failed to load registros istmo after retries:', error);
        toast.error('No se pudo cargar el catálogo de registros istmo');
      }
    }
  });
};
