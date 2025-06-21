
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StorageUsage {
  bytesUtilizados: number;
  gbUtilizados: number;
  archivosCount: number;
  loading: boolean;
  error: string | null;
}

export const useStorageUsage = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<StorageUsage>({
    bytesUtilizados: 0,
    gbUtilizados: 0,
    archivosCount: 0,
    loading: true,
    error: null
  });

  const fetchStorageUsage = async () => {
    if (!user?.id) return;

    try {
      setUsage(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .rpc('get_user_storage_usage', { user_uuid: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        const storageData = data[0];
        setUsage({
          bytesUtilizados: storageData.bytes_utilizados || 0,
          gbUtilizados: storageData.gb_utilizados || 0,
          archivosCount: storageData.archivos_count || 0,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      setUsage(prev => ({
        ...prev,
        loading: false,
        error: 'Error al obtener uso de almacenamiento'
      }));
    }
  };

  const updateStorageUsage = async (bytesDelta: number, filesDelta: number = 0) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .rpc('update_user_storage_usage', {
          user_uuid: user.id,
          bytes_delta: bytesDelta,
          files_delta: filesDelta
        });

      if (error) throw error;
      
      // Refrescar datos después de la actualización
      await fetchStorageUsage();
    } catch (error) {
      console.error('Error updating storage usage:', error);
    }
  };

  useEffect(() => {
    fetchStorageUsage();
  }, [user?.id]);

  return {
    ...usage,
    refetch: fetchStorageUsage,
    updateStorageUsage
  };
};
