import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Viaje } from '@/types/viaje';
import { ViajeEditor } from '@/components/viajes/editor/ViajeEditor';
import { Card, CardContent } from '@/components/ui/card';

export default function ViajeEditar() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['viaje', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Viaje;
    }
  });

  if (isLoading) {
    return <div className="p-8">Cargando viaje...</div>;
  }

  if (!data || error) {
    return (
      <Card className="p-8">
        <CardContent>Error cargando el viaje.</CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ViajeEditor viaje={data} onViajeUpdate={refetch} onClose={() => {}} />
    </div>
  );
}
