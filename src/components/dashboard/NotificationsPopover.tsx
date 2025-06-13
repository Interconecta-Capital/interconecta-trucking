
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export function NotificationsPopover() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

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
      return data || [];
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
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      tipo: 'retraso',
      titulo: 'Retraso en ruta',
      mensaje: 'Vehículo ABC-123 presenta retraso de 45 minutos',
      urgente: true,
      leida: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '3',
      tipo: 'mantenimiento',
      titulo: 'Mantenimiento programado',
      mensaje: 'Verificación vehicular vence en 3 días',
      urgente: false,
      leida: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];

  const notificacionesMostrar = notificaciones.length > 0 ? notificaciones : notificacionesEjemplo;
  const notificacionesNoLeidas = notificacionesMostrar.filter(n => !n.leida).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {notificacionesNoLeidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {notificacionesNoLeidas > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notificacionesNoLeidas}
              </Badge>
            )}
          </h4>
        </div>
        
        <ScrollArea className="h-80">
          <div className="space-y-1 p-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notificacionesMostrar.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No hay notificaciones
              </div>
            ) : (
              notificacionesMostrar.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notificacion.leida 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => marcarComoLeida(notificacion.id)}
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
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full text-sm">
            Ver todas las notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
