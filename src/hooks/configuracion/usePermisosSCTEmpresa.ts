// Hook para gestionar permisos SCT a nivel empresa
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PermisoSCTEmpresa {
  id: string;
  tipo_permiso: string;
  numero_permiso: string;
  vigencia?: string;
}

export function usePermisosSCTEmpresa() {
  const queryClient = useQueryClient();

  // Obtener permisos SCT de la empresa
  const { data: permisos = [], isLoading } = useQuery({
    queryKey: ['permisos-sct-empresa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion_empresa')
        .select('permisos_sct')
        .single();

      if (error) throw error;
      return ((data?.permisos_sct as any) as PermisoSCTEmpresa[]) || [];
    }
  });

  // Agregar permiso
  const agregarPermiso = useMutation({
    mutationFn: async (nuevoPermiso: Omit<PermisoSCTEmpresa, 'id'>) => {
      const permisoConId = {
        ...nuevoPermiso,
        id: crypto.randomUUID()
      };

      const nuevosPermisos = [...permisos, permisoConId];

      const { error } = await supabase
        .from('configuracion_empresa')
        .update({ permisos_sct: nuevosPermisos as any })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return permisoConId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos-sct-empresa'] });
      toast.success('Permiso SCT agregado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al agregar permiso: ${error.message}`);
    }
  });

  // Actualizar permiso
  const actualizarPermiso = useMutation({
    mutationFn: async ({ id, datos }: { id: string; datos: Partial<PermisoSCTEmpresa> }) => {
      const nuevosPermisos = permisos.map(p => 
        p.id === id ? { ...p, ...datos } : p
      );

      const { error } = await supabase
        .from('configuracion_empresa')
        .update({ permisos_sct: nuevosPermisos as any })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos-sct-empresa'] });
      toast.success('Permiso SCT actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar permiso: ${error.message}`);
    }
  });

  // Eliminar permiso
  const eliminarPermiso = useMutation({
    mutationFn: async (id: string) => {
      const nuevosPermisos = permisos.filter(p => p.id !== id);

      const { error } = await supabase
        .from('configuracion_empresa')
        .update({ permisos_sct: nuevosPermisos as any })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos-sct-empresa'] });
      toast.success('Permiso SCT eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar permiso: ${error.message}`);
    }
  });

  return {
    permisos,
    isLoading,
    agregarPermiso: agregarPermiso.mutate,
    actualizarPermiso: actualizarPermiso.mutate,
    eliminarPermiso: eliminarPermiso.mutate,
    isAdding: agregarPermiso.isPending,
    isUpdating: actualizarPermiso.isPending,
    isDeleting: eliminarPermiso.isPending
  };
}
