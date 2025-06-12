
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Truck, Clock, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CartaPorteFormModal } from './CartaPorteFormModal';

export function ProximosEventos() {
  const { user } = useAuth();
  const [showCartaPorteForm, setShowCartaPorteForm] = useState(false);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['proximos-eventos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'mantenimiento':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'entrega':
        return <MapPin className="h-4 w-4 text-green-600" />;
      default:
        return <CalendarIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return 'bg-blue-100 text-blue-800';
      case 'mantenimiento':
        return 'bg-orange-100 text-orange-800';
      case 'entrega':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              <CardDescription>
                Tus próximas actividades programadas
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCartaPorteForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-4">
              <CalendarIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                No tienes eventos próximos
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowCartaPorteForm(true)}
              >
                Programar Viaje
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento) => (
                <div key={evento.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5">
                    {getEventIcon(evento.tipo_evento)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {evento.titulo}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getEventBadgeColor(evento.tipo_evento)}`}
                      >
                        {evento.tipo_evento}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {evento.descripcion && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {evento.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CartaPorteFormModal 
        open={showCartaPorteForm}
        onOpenChange={setShowCartaPorteForm}
      />
    </>
  );
}
