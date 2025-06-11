
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FiguraTransporte {
  id?: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  domicilio?: {
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    colonia: string;
    localidad?: string;
    municipio: string;
    estado: string;
    pais: string;
    codigo_postal: string;
  };
}

export interface FiguraFrecuente {
  id: string;
  nombre_figura: string;
  rfc_figura: string;
  tipo_figura: string;
  num_licencia?: string;
  domicilio?: any;
  datos_adicionales?: any;
  uso_count: number;
}

export const useFigurasTransporte = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [figurasFrecuentes, setFigurasFrecuentes] = useState<FiguraFrecuente[]>([]);

  const cargarFigurasFrecuentes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('figuras_frecuentes')
        .select('*')
        .order('uso_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFigurasFrecuentes(data || []);
    } catch (error) {
      console.error('Error cargando figuras frecuentes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las figuras frecuentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const guardarFiguraFrecuente = useCallback(async (figura: FiguraTransporte) => {
    try {
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('figuras_frecuentes')
        .select('id, uso_count')
        .eq('rfc_figura', figura.rfc_figura)
        .single();

      if (existente) {
        // Incrementar uso_count
        await supabase
          .from('figuras_frecuentes')
          .update({ uso_count: existente.uso_count + 1 })
          .eq('id', existente.id);
      } else {
        // Crear nueva
        await supabase
          .from('figuras_frecuentes')
          .insert({
            nombre_figura: figura.nombre_figura,
            rfc_figura: figura.rfc_figura,
            tipo_figura: figura.tipo_figura,
            num_licencia: figura.num_licencia,
            domicilio: figura.domicilio,
            datos_adicionales: {
              residencia_fiscal_figura: figura.residencia_fiscal_figura,
              num_reg_id_trib_figura: figura.num_reg_id_trib_figura,
            },
          });
      }

      await cargarFigurasFrecuentes();
    } catch (error) {
      console.error('Error guardando figura frecuente:', error);
    }
  }, [cargarFigurasFrecuentes]);

  const eliminarFiguraFrecuente = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('figuras_frecuentes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Figura frecuente eliminada",
      });

      await cargarFigurasFrecuentes();
    } catch (error) {
      console.error('Error eliminando figura frecuente:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la figura frecuente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, cargarFigurasFrecuentes]);

  return {
    loading,
    figurasFrecuentes,
    cargarFigurasFrecuentes,
    guardarFiguraFrecuente,
    eliminarFiguraFrecuente,
  };
};
