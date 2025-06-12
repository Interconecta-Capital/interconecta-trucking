
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mercancia } from '@/hooks/useMercancias';

export const useMercanciasPersistence = (cartaPorteId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Guardar mercancía en la base de datos
  const guardarMercancia = useMutation({
    mutationFn: async (mercancia: Mercancia) => {
      if (!cartaPorteId) throw new Error('ID de carta porte requerido');

      const { data, error } = await supabase
        .from('mercancias')
        .insert({
          carta_porte_id: cartaPorteId,
          bienes_transp: mercancia.bienesTransp,
          descripcion: mercancia.descripcion,
          cantidad: mercancia.cantidad,
          clave_unidad: mercancia.claveUnidad,
          peso_kg: mercancia.pesoKg,
          valor_mercancia: mercancia.valorMercancia,
          moneda: mercancia.moneda || 'MXN',
          fraccion_arancelaria: mercancia.fraccionArancelaria,
          material_peligroso: mercancia.materialPeligroso || false,
          cve_material_peligroso: mercancia.cveMaterialPeligroso,
          embalaje: mercancia.embalaje,
          uuid_comercio_ext: mercancia.uuidComercioExt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Mercancía guardada correctamente",
      });
    },
    onError: (error) => {
      console.error('Error guardando mercancía:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la mercancía",
        variant: "destructive",
      });
    },
  });

  // Actualizar mercancía existente
  const actualizarMercancia = useMutation({
    mutationFn: async ({ id, mercancia }: { id: string; mercancia: Mercancia }) => {
      const { data, error } = await supabase
        .from('mercancias')
        .update({
          bienes_transp: mercancia.bienesTransp,
          descripcion: mercancia.descripcion,
          cantidad: mercancia.cantidad,
          clave_unidad: mercancia.claveUnidad,
          peso_kg: mercancia.pesoKg,
          valor_mercancia: mercancia.valorMercancia,
          moneda: mercancia.moneda || 'MXN',
          fraccion_arancelaria: mercancia.fraccionArancelaria,
          material_peligroso: mercancia.materialPeligroso || false,
          cve_material_peligroso: mercancia.cveMaterialPeligroso,
          embalaje: mercancia.embalaje,
          uuid_comercio_ext: mercancia.uuidComercioExt,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Mercancía actualizada correctamente",
      });
    },
  });

  // Eliminar mercancía
  const eliminarMercancia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mercancias')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Mercancía eliminada correctamente",
      });
    },
  });

  // Guardar múltiples mercancías
  const guardarMercancias = useCallback(async (mercancias: Mercancia[]) => {
    if (!cartaPorteId) throw new Error('ID de carta porte requerido');

    setLoading(true);
    try {
      // Primero eliminar mercancías existentes
      await supabase
        .from('mercancias')
        .delete()
        .eq('carta_porte_id', cartaPorteId);

      // Luego insertar las nuevas
      const mercanciasParaInsertar = mercancias.map(mercancia => ({
        carta_porte_id: cartaPorteId,
        bienes_transp: mercancia.bienesTransp,
        descripcion: mercancia.descripcion,
        cantidad: mercancia.cantidad,
        clave_unidad: mercancia.claveUnidad,
        peso_kg: mercancia.pesoKg,
        valor_mercancia: mercancia.valorMercancia,
        moneda: mercancia.moneda || 'MXN',
        fraccion_arancelaria: mercancia.fraccionArancelaria,
        material_peligroso: mercancia.materialPeligroso || false,
        cve_material_peligroso: mercancia.cveMaterialPeligroso,
        embalaje: mercancia.embalaje,
        uuid_comercio_ext: mercancia.uuidComercioExt,
      }));

      if (mercanciasParaInsertar.length > 0) {
        const { error } = await supabase
          .from('mercancias')
          .insert(mercanciasParaInsertar);

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Mercancías guardadas correctamente",
      });
    } catch (error) {
      console.error('Error guardando mercancías:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las mercancías",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [cartaPorteId, toast, queryClient]);

  return {
    loading: loading || guardarMercancia.isPending || actualizarMercancia.isPending,
    guardarMercancia: guardarMercancia.mutate,
    actualizarMercancia: actualizarMercancia.mutate,
    eliminarMercancia: eliminarMercancia.mutate,
    guardarMercancias,
  };
};
