
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export function NotificationsPanel() {
  const { user } = useAuth();

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const marcarComoLeida = async (notificationId: string) => {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notificationId);
  };

  const getNotificationIcon = (tipo: string, urgente: boolean) => {
    if (urgente) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (tipo) {
      case 'entrega':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'retraso':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'mantenimiento':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  // Crear algunas notificaciones de ejemplo si no hay datos
  const notificacionesEjemplo = [
    {
      id: '1',
      tipo: 'entrega',
      titulo: 'Entrega completada',
      mensaje: 'Entrega en Guadalajara completada exitosamente',
      urgente: false,
      leida: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // hace 30 min
    },
    {
      id: '2',
      tipo: 'retraso',
      titulo: 'Retraso en ruta',
      mensaje: 'Vehículo ABC-123 presenta retraso de 45 minutos',
      urgente: true,
      leida: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // hace 1 hora
    },
    {
      id: '3',
      tipo: 'mantenimiento',
      titulo: 'Mantenimiento programado',
      mensaje: 'Verificación vehicular vence en 3 días',
      urgente: false,
      leida: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2 horas
    },
  ];

  const notificacionesMostrar = notificaciones.length > 0 ? notificaciones : notificacionesEjemplo;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
          {notificacionesMostrar.filter(n => !n.leida).length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notificacionesMostrar.filter(n => !n.leida).length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-1 px-4 pb-4">
            {notificacionesMostrar.map((notificacion) => (
              <div
                key={notificacion.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notificacion.leida 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getNotificationIcon(notificacion.tipo, notificacion.urgente)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notificacion.titulo}
                        </p>
                        {notificacion.urgente && (
                          <Badge variant="destructive" className="text-xs">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notificacion.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {moment(notificacion.created_at).fromNow()}
                      </p>
                    </div>
                  </div>
                  {!notificacion.leida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => marcarComoLeida(notificacion.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full text-sm">
            Ver todas las notificaciones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
