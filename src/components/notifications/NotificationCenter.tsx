
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail
} from 'lucide-react';
import { useRealtimeNotifications, NotificationData } from '@/hooks/notifications/useRealtimeNotifications';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  urgentOnly: boolean;
  categories: {
    viajes: boolean;
    vehiculos: boolean;
    conductores: boolean;
    documentos: boolean;
    sistema: boolean;
  };
}

export const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission
  } = useRealtimeNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    soundEnabled: true,
    urgentOnly: false,
    categories: {
      viajes: true,
      vehiculos: true,
      conductores: true,
      documentos: true,
      sistema: false
    }
  });

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleEnablePushNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setSettings(prev => ({ ...prev, pushEnabled: true }));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (settings.urgentOnly && !notification.urgente) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Centro de Notificaciones</h2>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todas las notificaciones leídas'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Marcar todas como leídas
            </Button>
          )}
          <Button 
            onClick={() => setShowSettings(!showSettings)} 
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Canales de Notificación</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor="push">Notificaciones Push</Label>
                  </div>
                  <Switch
                    id="push"
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleEnablePushNotifications();
                      } else {
                        setSettings(prev => ({ ...prev, pushEnabled: false }));
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email">Notificaciones por Email</Label>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <Label htmlFor="sound">Sonidos</Label>
                  </div>
                  <Switch
                    id="sound"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="urgent">Solo notificaciones urgentes</Label>
                  <Switch
                    id="urgent"
                    checked={settings.urgentOnly}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, urgentOnly: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Categorías</h3>
                
                {Object.entries(settings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Label htmlFor={category} className="capitalize">
                      {category.replace('_', ' ')}
                    </Label>
                    <Switch
                      id={category}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {filteredNotifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 border-b hover:bg-gray-50 transition-colors ${
                      !notification.leida ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.titulo}</h4>
                        {notification.urgente && (
                          <Badge variant="destructive" className="text-xs">
                            Urgente
                          </Badge>
                        )}
                        <Badge variant={getBadgeVariant(notification.tipo)} className="text-xs">
                          {notification.tipo}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.mensaje}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {moment(notification.created_at).fromNow()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!notification.leida && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
