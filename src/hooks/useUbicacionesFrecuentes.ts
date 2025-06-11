
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UbicacionFrecuente } from '@/types/ubicaciones';

export const useUbicacionesFrecuentes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener ubicaciones frecuentes
  const { data: ubicacionesFrecuentes = [], isLoading: loadingFrecuentes } = useQuery({
    queryKey: ['ubicaciones-frecuentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .select('*')
        .order('uso_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        nombreUbicacion: item.nombre_ubicacion,
        rfcAsociado: item.rfc_asociado,
        domicilio: item.domicilio,
        coordenadas: (item as any).coordenadas || undefined,
        usoCount: item.uso_count
      })) as UbicacionFrecuente[];
    },
  });

  // Mutation para guardar ubicación frecuente
  const guardarUbicacionFrecuente = useMutation({
    mutationFn: async (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .upsert({
          nombre_ubicacion: ubicacion.nombreUbicacion,
          rfc_asociado: ubicacion.rfcAsociado,
          domicilio: ubicacion.domicilio,
          coordenadas: ubicacion.coordenadas,
          uso_count: 1
        }, {
          onConflict: 'rfc_asociado,domicilio'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ubicaciones-frecuentes'] });
      toast({
        title: "Ubicación guardada",
        description: "La ubicación se ha guardado en favoritos.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la ubicación.",
        variant: "destructive",
      });
    },
  });

  return {
    ubicacionesFrecuentes,
    loadingFrecuentes,
    guardarUbicacionFrecuente: guardarUbicacionFrecuente.mutate,
    isGuardando: guardarUbicacionFrecuente.isPending,
  };
};
