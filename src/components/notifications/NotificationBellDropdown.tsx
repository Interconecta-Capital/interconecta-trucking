import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRealtimeNotifications } from '@/hooks/notifications/useRealtimeNotifications';
import { navigateFromNotification, getNotificationIcon } from '@/utils/notificationNavigation';
import { toast } from 'sonner';
import moment from 'moment';
import 'moment/locale/es';
import * as LucideIcons from 'lucide-react';

moment.locale('es');

export function NotificationBellDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadInitialNotifications
  } = useRealtimeNotifications();

  // Cargar notificaciones al montar
  useEffect(() => {
    loadInitialNotifications();
  }, [loadInitialNotifications]);

  // Obtener las últimas 8 notificaciones
  const recentNotifications = notifications.slice(0, 8);

  const handleNotificationClick = async (notificationId: string, metadata: any) => {
    try {
      // Marcar como leída
      await markAsRead(notificationId);
      
      // Cerrar el popover
      setOpen(false);
      
      // Navegar según metadata
      navigateFromNotification(metadata, navigate);
    } catch (error) {
      console.error('[NotificationBell] Error al manejar click:', error);
      toast.error('Error al procesar notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('[NotificationBell] Error al marcar todas como leídas:', error);
      toast.error('Error al marcar como leídas');
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notificaciones');
  };

  const getIconComponent = (tipo: string, urgente: boolean) => {
    const iconName = getNotificationIcon(tipo, urgente);
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Bell;
    
    const colorClass = urgente 
      ? 'text-red-500' 
      : tipo === 'success' || tipo === 'entrega'
      ? 'text-green-500'
      : tipo === 'warning' || tipo === 'retraso'
      ? 'text-orange-500'
      : tipo === 'error'
      ? 'text-red-500'
      : 'text-blue-500';
    
    return <IconComponent className={`h-4 w-4 ${colorClass} flex-shrink-0`} />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 relative"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>
        
        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No hay notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Te avisaremos cuando llegue algo nuevo
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {recentNotifications.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    notificacion.leida 
                      ? 'bg-background hover:bg-muted/30 border-border' 
                      : 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                  }`}
                  onClick={() => handleNotificationClick(notificacion.id, notificacion.metadata)}
                >
                  <div className="flex items-start gap-3">
                    {getIconComponent(notificacion.tipo, notificacion.urgente)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate flex-1">
                          {notificacion.titulo}
                        </p>
                        {!notificacion.leida && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      {notificacion.urgente && (
                        <Badge variant="destructive" className="text-xs mb-1">
                          Urgente
                        </Badge>
                      )}
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {notificacion.mensaje}
                      </p>
                      
                      <p className="text-xs text-muted-foreground/70">
                        {moment(notificacion.created_at).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        {recentNotifications.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={handleViewAll}
            >
              <Eye className="h-3 w-3 mr-2" />
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
