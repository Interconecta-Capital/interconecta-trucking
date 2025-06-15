
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Optimized query hooks to reduce RLS evaluation overhead
export const useOptimizedConductores = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use stable query key and optimized select
  const { data: conductores = [], isLoading, error } = useQuery({
    queryKey: ['conductores-optimized', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Single optimized query with minimal RLS evaluation
      const { data, error } = await supabase
        .from('conductores')
        .select(`
          id, nombre, rfc, curp, telefono, email, 
          num_licencia, tipo_licencia, vigencia_licencia,
          estado, activo, created_at, updated_at
        `)
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return { conductores, isLoading, error };
};

export const useOptimizedVehiculos = () => {
  const { user } = useAuth();

  const { data: vehiculos = [], isLoading, error } = useQuery({
    queryKey: ['vehiculos-optimized', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('vehiculos')
        .select(`
          id, placa, marca, modelo, anio, num_serie,
          config_vehicular, estado, activo, created_at
        `)
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { vehiculos, isLoading, error };
};

export const useOptimizedSocios = () => {
  const { user } = useAuth();

  const { data: socios = [], isLoading, error } = useQuery({
    queryKey: ['socios-optimized', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('socios')
        .select(`
          id, nombre_razon_social, rfc, tipo_persona,
          telefono, email, estado, activo, created_at
        `)
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { socios, isLoading, error };
};

// Optimized batch operations to reduce multiple RLS evaluations
export const useBatchOperations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const batchCreateConductores = useMutation({
    mutationFn: async (conductores: any[]) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      // Single batch insert to minimize RLS evaluations
      const { data, error } = await supabase
        .from('conductores')
        .insert(
          conductores.map(conductor => ({
            ...conductor,
            user_id: user.id,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores-optimized'] });
      toast.success('Conductores creados exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return { batchCreateConductores };
};
