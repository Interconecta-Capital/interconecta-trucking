
import { useState, useEffect } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
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
      
      setPlantillas(transformedData);
    } catch (err) {
      console.error('Error fetching plantillas:', err);
      setError('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantillas();
  }, [user]);

  return {
    plantillas,
    loading,
    error,
    fetchPlantillas,
  };
}
