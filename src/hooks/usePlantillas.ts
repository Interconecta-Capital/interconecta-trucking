
import { useState, useEffect } from 'react';
import { CartaPorteData, PlantillaData } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Plantilla {
  id: string;
  nombre: string;
  descripcion?: string;
  template_data: CartaPorteData;
  es_publica: boolean;
  uso_count: number;
  created_at: string;
  updated_at: string;
}

export function usePlantillas() {
  const { user } = useAuth();
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [plantillasPublicas, setPlantillasPublicas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchPlantillas = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plantillas_carta_porte')
        .select('*')
        .or(`usuario_id.eq.${user.id},es_publica.eq.true`)
        .order('uso_count', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        template_data: typeof item.template_data === 'string' 
          ? JSON.parse(item.template_data) 
          : item.template_data as CartaPorteData,
        updated_at: item.updated_at || item.created_at
      }));
      
      // Separate public and private plantillas
      const publicPlantillas = transformedData.filter(p => p.es_publica);
      const userPlantillas = transformedData.filter(p => p.usuario_id === user.id);
      
      setPlantillas(userPlantillas);
      setPlantillasPublicas(publicPlantillas);
    } catch (err) {
      console.error('Error fetching plantillas:', err);
      setError('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const buscarPlantillas = async (searchTerm: string): Promise<Plantilla[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('plantillas_carta_porte')
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`)
        .or(`usuario_id.eq.${user.id},es_publica.eq.true`);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        template_data: typeof item.template_data === 'string' 
          ? JSON.parse(item.template_data) 
          : item.template_data as CartaPorteData,
        updated_at: item.updated_at || item.created_at
      }));
    } catch (err) {
      console.error('Error searching plantillas:', err);
      return [];
    }
  };

  const getPlantillasFrecuentes = (): Plantilla[] => {
    return plantillas
      .filter(p => p.uso_count > 0)
      .sort((a, b) => b.uso_count - a.uso_count)
      .slice(0, 5);
  };

  const eliminarPlantilla = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('plantillas_carta_porte')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) throw error;
    
    await fetchPlantillas();
  };

  const duplicarPlantilla = async (id: string, nuevoNombre: string) => {
    if (!user) return;
    
    const plantilla = plantillas.find(p => p.id === id);
    if (!plantilla) return;
    
    const { error } = await supabase
      .from('plantillas_carta_porte')
      .insert({
        nombre: nuevoNombre,
        descripcion: plantilla.descripcion,
        template_data: plantilla.template_data,
        usuario_id: user.id,
        es_publica: false
      });

    if (error) throw error;
    
    await fetchPlantillas();
  };

  useEffect(() => {
    fetchPlantillas();
  }, [user]);

  return {
    plantillas,
    plantillasPublicas,
    loading,
    error,
    fetchPlantillas,
    buscarPlantillas,
    getPlantillasFrecuentes,
    eliminarPlantilla,
    duplicarPlantilla,
  };
}

export { type PlantillaData };
