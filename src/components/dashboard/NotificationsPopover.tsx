
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export function NotificationsPopover() {
  const [notifications] = useState([
    {
      id: 1,
      title: 'Nuevo viaje programado',
      message: 'Se ha programado un viaje para mañana',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      title: 'Documento por vencer',
      message: 'El seguro del vehículo ABC-123 vence en 7 días',
      time: '1 hora ago',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notificaciones</h4>
            <Badge variant="secondary">{unreadCount} nuevas</Badge>
          </div>
          
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay notificaciones
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {notification.time}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <Button variant="outline" className="w-full" size="sm">
              Ver todas las notificaciones
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
