
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useOptimizedNotifications } from '@/hooks/useOptimizedNotifications';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export function ActiveNotificationsWidget() {
  const { 
    notificaciones, 
    notificacionesNoLeidas, 
    notificacionesUrgentes,
    marcarComoLeida 
  } = useOptimizedNotifications();
  
  const navigate = useNavigate();

  const getIcon = (tipo: string, urgente: boolean) => {
    if (urgente) return AlertTriangle;
    switch (tipo) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Bell;
    }
  };

  const getIconColor = (tipo: string, urgente: boolean) => {
    if (urgente) return 'text-red-500';
    switch (tipo) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-orange-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const notificacionesRecientes = notificaciones.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificaciones
        </CardTitle>
        <div className="flex gap-1">
          {notificacionesUrgentes > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notificacionesUrgentes} urgentes
            </Badge>
          )}
          {notificacionesNoLeidas > 0 && (
            <Badge variant="secondary" className="text-xs">
              {notificacionesNoLeidas} nuevas
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notificacionesRecientes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay notificaciones recientes</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {notificacionesRecientes.map((notif) => {
                  const Icon = getIcon(notif.tipo, notif.urgente);
                  const iconColor = getIconColor(notif.tipo, notif.urgente);
                  
                  return (
                    <div
                      key={notif.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        notif.leida 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {notif.titulo}
                            </p>
                            {notif.urgente && (
                              <Badge variant="destructive" className="text-xs">
                                Urgente
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notif.mensaje}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {moment(notif.created_at).fromNow()}
                          </p>
                        </div>
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/notificaciones')}
            >
              Ver todas las notificaciones
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
