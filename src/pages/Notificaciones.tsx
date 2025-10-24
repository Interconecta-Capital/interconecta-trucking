import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeNotifications } from '@/hooks/notifications/useRealtimeNotifications';
import { navigateFromNotification, getNotificationIcon } from '@/utils/notificationNavigation';
import { Bell, Search, CheckCheck, Trash2, Filter, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';
import 'moment/locale/es';
import * as LucideIcons from 'lucide-react';

moment.locale('es');

type FilterType = 'all' | 'unread' | 'read';
type TabType = 'all' | 'success' | 'warning' | 'error' | 'info';

export default function Notificaciones() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [tabType, setTabType] = useState<TabType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useRealtimeNotifications();

  // Filtrado y búsqueda
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filtro por estado leído/no leído
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.leida);
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.leida);
    }

    // Filtro por tipo (tab)
    if (tabType !== 'all') {
      filtered = filtered.filter(n => n.tipo === tabType);
    }

    // Búsqueda por título o mensaje
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.titulo.toLowerCase().includes(query) ||
        n.mensaje.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filterType, tabType, searchQuery]);

  const handleNotificationClick = async (notificationId: string, metadata: any) => {
    try {
      await markAsRead(notificationId);
      navigateFromNotification(metadata, navigate);
    } catch (error) {
      console.error('[Notificaciones] Error al manejar click:', error);
      toast.error('Error al procesar notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar como leídas');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => deleteNotification(id))
      );
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} notificaciones eliminadas`);
    } catch (error) {
      toast.error('Error al eliminar notificaciones');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
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
    
    return <IconComponent className={`h-5 w-5 ${colorClass}`} />;
  };

  const getTypeCount = (type: TabType) => {
    if (type === 'all') return notifications.length;
    return notifications.filter(n => n.tipo === type).length;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notificaciones
            </h1>
            <p className="text-muted-foreground mt-1">
              Todas tus notificaciones en un solo lugar
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Total: {notifications.length}
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              Sin leer: {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Card principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Notificaciones</CardTitle>
              <CardDescription>
                Gestiona y revisa todas tus notificaciones
              </CardDescription>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar ({selectedIds.size})
                </Button>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas
                </Button>
              )}
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="unread">Sin leer</TabsTrigger>
                  <TabsTrigger value="read">Leídas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabs por tipo */}
          <Tabs value={tabType} onValueChange={(v) => setTabType(v as TabType)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">
                Todas ({getTypeCount('all')})
              </TabsTrigger>
              <TabsTrigger value="success">
                Éxito ({getTypeCount('success')})
              </TabsTrigger>
              <TabsTrigger value="warning">
                Advertencia ({getTypeCount('warning')})
              </TabsTrigger>
              <TabsTrigger value="error">
                Error ({getTypeCount('error')})
              </TabsTrigger>
              <TabsTrigger value="info">
                Info ({getTypeCount('info')})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tabType} className="mt-4">
              <ScrollArea className="h-[600px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      {searchQuery ? 'No se encontraron notificaciones' : 'No hay notificaciones'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Las notificaciones aparecerán aquí'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notificacion) => (
                      <div
                        key={notificacion.id}
                        className={`p-4 rounded-lg border transition-all ${
                          notificacion.leida 
                            ? 'bg-background hover:bg-muted/30 border-border' 
                            : 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                        } ${selectedIds.has(notificacion.id) ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedIds.has(notificacion.id)}
                            onChange={() => toggleSelection(notificacion.id)}
                            className="mt-1 cursor-pointer"
                          />

                          {/* Icono */}
                          {getIconComponent(notificacion.tipo, notificacion.urgente)}
                          
                          {/* Contenido */}
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleNotificationClick(notificacion.id, notificacion.metadata)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-base font-semibold text-foreground">
                                {notificacion.titulo}
                              </p>
                              {!notificacion.leida && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                            
                            {notificacion.urgente && (
                              <Badge variant="destructive" className="text-xs mb-2">
                                Urgente
                              </Badge>
                            )}
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {notificacion.mensaje}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                              <span>{moment(notificacion.created_at).format('DD/MM/YYYY HH:mm')}</span>
                              <span>•</span>
                              <span>{moment(notificacion.created_at).fromNow()}</span>
                            </div>
                          </div>

                          {/* Botón eliminar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notificacion.id);
                              toast.success('Notificación eliminada');
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
