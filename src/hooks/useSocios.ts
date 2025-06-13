
import { useState, useEffect } from 'react';
import { useSimpleAuth } from './useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Socio {
  id: string;
  user_id: string;
  nombre_razon_social: string;
  rfc: string;
  tipo_persona: string; // Changed from union type to string to match database
  telefono?: string;
  email?: string;
  direccion?: any;
  activo: boolean;
  estado?: string; // Added optional estado field
  created_at: string;
  updated_at: string;
}

export const useSocios = () => {
  const { user } = useSimpleAuth();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      cargarSocios();
    }
  }, [user?.id]);

  const cargarSocios = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSocios(data || []);
    } catch (error) {
      console.error('Error loading socios:', error);
      toast.error('Error al cargar socios');
    } finally {
      setLoading(false);
    }
  };

  const crearSocio = async (data: Omit<Socio, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('socios')
      .insert({
        ...data,
        user_id: user.id
      });

    if (error) throw error;
    
    cargarSocios();
    toast.success('Socio creado exitosamente');
  };

  const actualizarSocio = async (id: string, data: Partial<Socio>) => {
    const { error } = await supabase
      .from('socios')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    
    cargarSocios();
    toast.success('Socio actualizado exitosamente');
  };

  const eliminarSocio = async (id: string) => {
    const { error } = await supabase
      .from('socios')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
    
    cargarSocios();
    toast.success('Socio eliminado exitosamente');
  };

  return {
    socios,
    loading,
    crearSocio,
    actualizarSocio,
    eliminarSocio
  };
};
