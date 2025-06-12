
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export interface CartaPorteRecord {
  id: string;
  folio: string;
  tipo_cfdi: string;
  rfc_emisor: string;
  nombre_emisor: string;
  rfc_receptor: string;
  nombre_receptor: string;
  transporte_internacional: boolean;
  registro_istmo: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  usuario_id: string;
  xml_generado?: string;
  uuid_fiscal?: string;
  fecha_timbrado?: string;
  entrada_salida_merc?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;
}

export const useCartasPorte = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Query para obtener cartas porte del usuario
  const { data: cartasPorte = [], isLoading: loadingCartasPorte } = useQuery({
    queryKey: ['cartas-porte'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CartaPorteRecord[];
    },
  });

  // Query para obtener una carta porte específica
  const getCartaPorte = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('cartas_porte')
      .select(`
        *,
        ubicaciones (*),
        mercancias (*),
        autotransporte (*, remolques (*)),
        figuras_transporte (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }, []);

  // Mutation para crear carta porte
  const crearCartaPorte = useMutation({
    mutationFn: async (data: Partial<CartaPorteData>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      // Generar folio único
      const folio = `CP-${Date.now()}`;

      const { data: nuevaCartaPorte, error } = await supabase
        .from('cartas_porte')
        .insert({
          folio,
          tipo_cfdi: data.tipoCfdi || 'Traslado',
          rfc_emisor: data.rfcEmisor || '',
          nombre_emisor: data.nombreEmisor || '',
          rfc_receptor: data.rfcReceptor || '',
          nombre_receptor: data.nombreReceptor || '',
          transporte_internacional: data.transporteInternacional || false,
          registro_istmo: data.registroIstmo || false,
          entrada_salida_merc: data.entrada_salida_merc,
          pais_origen_destino: data.pais_origen_destino,
          via_entrada_salida: data.via_entrada_salida,
          status: 'borrador',
          usuario_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return nuevaCartaPorte;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Carta Porte creada correctamente",
      });
    },
    onError: (error) => {
      console.error('Error creando carta porte:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la carta porte",
        variant: "destructive",
      });
    },
  });

  // Mutation para actualizar carta porte
  const actualizarCartaPorte = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CartaPorteData> }) => {
      const { data: cartaPorteActualizada, error } = await supabase
        .from('cartas_porte')
        .update({
          tipo_cfdi: data.tipoCfdi,
          rfc_emisor: data.rfcEmisor,
          nombre_emisor: data.nombreEmisor,
          rfc_receptor: data.rfcReceptor,
          nombre_receptor: data.nombreReceptor,
          transporte_internacional: data.transporteInternacional,
          registro_istmo: data.registroIstmo,
          entrada_salida_merc: data.entrada_salida_merc,
          pais_origen_destino: data.pais_origen_destino,
          via_entrada_salida: data.via_entrada_salida,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return cartaPorteActualizada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Carta Porte actualizada correctamente",
      });
    },
    onError: (error) => {
      console.error('Error actualizando carta porte:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la carta porte",
        variant: "destructive",
      });
    },
  });

  // Mutation para eliminar carta porte
  const eliminarCartaPorte = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Carta Porte eliminada correctamente",
      });
    },
    onError: (error) => {
      console.error('Error eliminando carta porte:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la carta porte",
        variant: "destructive",
      });
    },
  });

  // Mutation para cambiar status
  const cambiarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('cartas_porte')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
    },
  });

  return {
    cartasPorte,
    loading: loading || loadingCartasPorte,
    getCartaPorte,
    crearCartaPorte: crearCartaPorte.mutate,
    actualizarCartaPorte: actualizarCartaPorte.mutate,
    eliminarCartaPorte: eliminarCartaPorte.mutate,
    cambiarStatus: cambiarStatus.mutate,
    isCreating: crearCartaPorte.isPending,
    isUpdating: actualizarCartaPorte.isPending,
    isDeleting: eliminarCartaPorte.isPending,
  };
};
