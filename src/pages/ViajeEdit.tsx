import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Viaje } from '@/types/viaje';
import { ViajeEditor } from '@/components/viajes/editor/ViajeEditor';

export default function ViajeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadViaje = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) {
        setViaje(data as Viaje);
      }
      setLoading(false);
    };
    loadViaje();
  }, [id]);

  if (loading) {
    return <div className="p-6">Cargando viaje...</div>;
  }

  if (!viaje) {
    return <div className="p-6">Viaje no encontrado</div>;
  }

  const handleUpdated = () => {
    navigate('/viajes');
  };

  return (
    <div className="container mx-auto py-6">
      <ViajeEditor viaje={viaje} onViajeUpdate={handleUpdated} onClose={() => navigate('/viajes')} />
    </div>
  );
}
