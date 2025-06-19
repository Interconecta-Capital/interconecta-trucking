import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { CartaPorteData } from '@/types/cartaPorte';
import { ValidationResult } from '@/types/validationTypes';

export interface CartaPorteOptimizada {
  id: string;
  folio?: string;
  usuario_id: string;
  rfc_emisor?: string;
  nombre_emisor?: string;
  rfc_receptor?: string;
  nombre_receptor?: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Campos nuevos agregados en la migración
  id_ccp?: string;
  version_carta_porte?: string;
  peso_bruto_total?: number;
  distancia_total?: number;
  numero_total_mercancias?: number;
  regimenes_aduaneros?: string[];
}

// Hook optimizado con soporte para los nuevos campos de la BD
export const useOptimizedCartaPorte = (page = 1, limit = 20) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cartas-porte-optimized', user?.id, page, limit],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('cartas_porte')
        .select(`
          id, folio, usuario_id, rfc_emisor, nombre_emisor,
          rfc_receptor, nombre_receptor, status, created_at, updated_at,
          id_ccp, version_carta_porte, peso_bruto_total, 
          distancia_total, numero_total_mercancias, regimenes_aduaneros
        `, { count: 'exact' })
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation optimizada con soporte para nuevos campos
  const createMutation = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      // Preparar datos compatibles con Supabase
      const insertData = {
        usuario_id: user.id,
        rfc_emisor: cartaPorteData.rfcEmisor,
        rfc_receptor: cartaPorteData.rfcReceptor,
        nombre_emisor: cartaPorteData.nombreEmisor,
        nombre_receptor: cartaPorteData.nombreReceptor,
        tipo_cfdi: cartaPorteData.tipoCfdi,
        transporte_internacional: cartaPorteData.transporteInternacional === true || cartaPorteData.transporteInternacional === 'Sí',
        registro_istmo: !!cartaPorteData.registroIstmo,
        id_ccp: cartaPorteData.idCCP || crypto.randomUUID(),
        version_carta_porte: cartaPorteData.cartaPorteVersion || '3.1',
        datos_formulario: cartaPorteData as any, // Type assertion para JSON
      };

      const { data, error } = await supabase
        .from('cartas_porte')
        .insert(insertData)
        .select(`
          id, folio, usuario_id, rfc_emisor, nombre_emisor,
          rfc_receptor, nombre_receptor, status, created_at, updated_at,
          id_ccp, version_carta_porte, peso_bruto_total, 
          distancia_total, numero_total_mercancias
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte-optimized'] });
      toast.success('Carta de porte creada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creando carta de porte:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Mutation para actualizar con validación de versión
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CartaPorteData> }) => {
      const updateData = {
        rfc_emisor: data.rfcEmisor,
        rfc_receptor: data.rfcReceptor,
        nombre_emisor: data.nombreEmisor,
        nombre_receptor: data.nombreReceptor,
        datos_formulario: data as any, // Type assertion para JSON
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('cartas_porte')
        .update(updateData)
        .eq('id', id)
        .select(`
          id, folio, usuario_id, rfc_emisor, nombre_emisor,
          rfc_receptor, nombre_receptor, status, created_at, updated_at,
          id_ccp, version_carta_porte, peso_bruto_total, 
          distancia_total, numero_total_mercancias
        `)
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte-optimized'] });
      toast.success('Carta de porte actualizada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error actualizando carta de porte:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    cartasPorte: data?.data || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    crearCartaPorte: createMutation.mutateAsync,
    actualizarCartaPorte: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

// Hook para obtener una carta de porte específica con nuevos campos
export const useCartaPorteCompleta = (cartaPorteId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['carta-porte-completa', cartaPorteId],
    queryFn: async () => {
      if (!cartaPorteId || !user?.id) return null;

      const { data, error } = await supabase
        .from('cartas_porte')
        .select(`
          *,
          ubicaciones!inner(*),
          mercancias!inner(*),
          figuras_transporte!inner(*),
          autotransporte!inner(
            *,
            remolques_ccp(*)
          )
        `)
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!cartaPorteId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para validar migración entre versiones
export const useCartaPorteVersionMigration = () => {
  const queryClient = useQueryClient();

  const validateAndMigrate = useMutation({
    mutationFn: async ({ cartaPorteId, targetVersion }: { 
      cartaPorteId: string; 
      targetVersion: '3.0' | '3.1' 
    }) => {
      // Usar la función de validación de la BD
      const { data, error } = await supabase.rpc('validate_carta_porte_v31', {
        carta_porte_data: { cartaPorteVersion: targetVersion }
      });

      if (error) throw error;
      
      // Fix property names to match ValidationResult interface
      const validationResult = data as unknown as ValidationResult;
      if (!validationResult.isValid) {
        throw new Error(`Errores de validación: ${validationResult.errors.join(', ')}`);
      }

      // Si la validación pasa, actualizar la versión
      const { error: updateError } = await supabase
        .from('cartas_porte')
        .update({ 
          version_carta_porte: targetVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);

      if (updateError) throw updateError;

      return { success: true, version: targetVersion };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['carta-porte-completa'] });
      toast.success('Migración de versión completada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error en migración: ${error.message}`);
    }
  });

  return {
    validateAndMigrate: validateAndMigrate.mutateAsync,
    isValidating: validateAndMigrate.isPending,
  };
};
