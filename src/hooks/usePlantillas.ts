
import { useState, useEffect } from 'react';
import { useSimpleAuth } from './useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlantillaData {
  id: string;
  user_id: string;
  nombre: string;
  descripcion?: string;
  template_data: any;
  es_publica: boolean;
  uso_count: number;
  created_at: string;
  updated_at: string;
}

export const usePlantillas = () => {
  const { user } = useSimpleAuth();
  const [plantillas, setPlantillas] = useState<PlantillaData[]>([]);
  const [plantillasPublicas, setPlantillasPublicas] = useState<PlantillaData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      cargarPlantillas();
      cargarPlantillasPublicas();
    }
  }, [user?.id]);

  const cargarPlantillas = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plantillas_carta_porte')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPlantillas(data || []);
    } catch (error) {
      console.error('Error loading plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPlantillasPublicas = async () => {
    try {
      const { data, error } = await supabase
        .from('plantillas_carta_porte')
        .select('*')
        .eq('es_publica', true)
        .order('uso_count', { ascending: false });

      if (error) throw error;
      setPlantillasPublicas(data || []);
    } catch (error) {
      console.error('Error loading public plantillas:', error);
    }
  };

  const guardarPlantilla = async (
    nombre: string,
    descripcion: string,
    templateData: any,
    esPublica: boolean = false
  ) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('plantillas_carta_porte')
      .insert({
        user_id: user.id,
        nombre,
        descripcion,
        template_data: templateData,
        es_publica: esPublica,
        uso_count: 0
      });

    if (error) throw error;
    
    cargarPlantillas();
    if (esPublica) cargarPlantillasPublicas();
  };

  const eliminarPlantilla = async (plantillaId: string) => {
    const { error } = await supabase
      .from('plantillas_carta_porte')
      .delete()
      .eq('id', plantillaId);

    if (error) throw error;
    
    cargarPlantillas();
  };

  const duplicarPlantilla = async (plantillaId: string, nuevoNombre: string) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const { data: plantilla, error: fetchError } = await supabase
      .from('plantillas_carta_porte')
      .select('*')
      .eq('id', plantillaId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('plantillas_carta_porte')
      .insert({
        user_id: user.id,
        nombre: nuevoNombre,
        descripcion: plantilla.descripcion,
        template_data: plantilla.template_data,
        es_publica: false,
        uso_count: 0
      });

    if (error) throw error;
    
    cargarPlantillas();
  };

  const buscarPlantillas = async (termino: string) => {
    const { data, error } = await supabase
      .from('plantillas_carta_porte')
      .select('*')
      .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
      .eq('es_publica', true);

    if (error) throw error;
    return data;
  };

  const getPlantillasFrecuentes = () => {
    return plantillas
      .filter(p => p.uso_count > 0)
      .sort((a, b) => b.uso_count - a.uso_count)
      .slice(0, 5);
  };

  return {
    plantillas,
    plantillasPublicas,
    loading,
    guardarPlantilla,
    eliminarPlantilla,
    duplicarPlantilla,
    buscarPlantillas,
    getPlantillasFrecuentes
  };
};
