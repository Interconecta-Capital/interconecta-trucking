
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export interface PlantillaData {
  id: string;
  nombre: string;
  descripcion?: string;
  template_data: CartaPorteData;
  usuario_id: string;
  tenant_id?: string;
  es_publica: boolean;
  uso_count: number;
  created_at: string;
  updated_at: string;
}

export function usePlantillas() {
  const [plantillas, setPlantillas] = useState<PlantillaData[]>([]);
  const [plantillasPublicas, setPlantillasPublicas] = useState<PlantillaData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadPlantillas = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Cargar plantillas del usuario
      const { data: userPlantillas, error: userError } = await supabase
        .from('plantillas_carta_porte')
        .select('*')
        .eq('usuario_id', user.id)
        .order('uso_count', { ascending: false });

      if (userError) throw userError;

      // Cargar plantillas públicas
      const { data: publicPlantillas, error: publicError } = await supabase
        .from('plantillas_carta_porte')
        .select('*')
        .eq('es_publica', true)
        .neq('usuario_id', user.id)
        .order('uso_count', { ascending: false })
        .limit(20);

      if (publicError) throw publicError;

      // Cast the data to match our interface
      setPlantillas((userPlantillas || []).map(p => ({
        ...p,
        template_data: p.template_data as CartaPorteData
      })));
      
      setPlantillasPublicas((publicPlantillas || []).map(p => ({
        ...p,
        template_data: p.template_data as CartaPorteData
      })));
    } catch (error) {
      console.error('Error loading plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarPlantilla = async (
    nombre: string,
    descripcion: string,
    templateData: CartaPorteData,
    esPublica: boolean = false
  ) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('plantillas_carta_porte')
      .insert({
        nombre,
        descripcion,
        template_data: templateData as any, // Cast to Json type
        usuario_id: user.id,
        es_publica: esPublica,
        uso_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    await loadPlantillas();
    return data;
  };

  const cargarPlantilla = async (plantillaId: string): Promise<CartaPorteData> => {
    const { data, error } = await supabase
      .from('plantillas_carta_porte')
      .select('template_data, uso_count')
      .eq('id', plantillaId)
      .single();

    if (error) throw error;

    // Incrementar contador de uso
    await supabase
      .from('plantillas_carta_porte')
      .update({ uso_count: (data.uso_count || 0) + 1 })
      .eq('id', plantillaId);

    await loadPlantillas();
    return data.template_data as CartaPorteData;
  };

  const eliminarPlantilla = async (plantillaId: string) => {
    const { error } = await supabase
      .from('plantillas_carta_porte')
      .delete()
      .eq('id', plantillaId);

    if (error) throw error;
    await loadPlantillas();
  };

  const duplicarPlantilla = async (plantillaId: string, nuevoNombre: string) => {
    const plantilla = plantillas.find(p => p.id === plantillaId) || 
                     plantillasPublicas.find(p => p.id === plantillaId);
    
    if (!plantilla) throw new Error('Plantilla no encontrada');

    return await guardarPlantilla(
      nuevoNombre,
      `Copia de ${plantilla.descripcion}`,
      plantilla.template_data,
      false
    );
  };

  const buscarPlantillas = async (termino: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('plantillas_carta_porte')
      .select('*')
      .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
      .or(`usuario_id.eq.${user.id},es_publica.eq.true`)
      .order('uso_count', { ascending: false });

    if (error) throw error;
    
    // Cast the data to match our interface
    return (data || []).map(p => ({
      ...p,
      template_data: p.template_data as CartaPorteData
    }));
  };

  const getPlantillasFrecuentes = () => {
    return plantillas.slice(0, 5);
  };

  const getSugerenciasPlantillas = (ubicacionOrigen?: string, ubicacionDestino?: string) => {
    // Sugerir plantillas basadas en ubicaciones similares
    const todasLasPlantillas = [...plantillas, ...plantillasPublicas];
    
    return todasLasPlantillas.filter(plantilla => {
      const templateData = plantilla.template_data;
      const ubicaciones = templateData.ubicaciones || [];
      
      return ubicaciones.some(ubicacion => 
        ubicacion.domicilio?.municipio?.includes(ubicacionOrigen || '') ||
        ubicacion.domicilio?.municipio?.includes(ubicacionDestino || '')
      );
    }).slice(0, 3);
  };

  useEffect(() => {
    if (user) {
      loadPlantillas();
    }
  }, [user]);

  return {
    plantillas,
    plantillasPublicas,
    loading,
    guardarPlantilla,
    cargarPlantilla,
    eliminarPlantilla,
    duplicarPlantilla,
    buscarPlantillas,
    getPlantillasFrecuentes,
    getSugerenciasPlantillas,
    loadPlantillas
  };
}
