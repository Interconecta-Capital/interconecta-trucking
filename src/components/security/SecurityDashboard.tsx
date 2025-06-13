
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityMonitoring } from '@/hooks/auth/useSecurityMonitoring';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, Users, Activity, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SecurityDashboard() {
  const { user, hasAccess } = useAuth();
  const {
    isAdmin,
    securityEvents,
    rateLimitAttempts,
    getSecurityStats,
    getSuspiciousActivities,
    refetchSecurityEvents,
    refetchRateLimitAttempts
  } = useSecurityMonitoring();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Only show to admin users
  if (!user || !hasAccess('admin') || !isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Shield className="h-5 w-5 mr-2" />
              Acceso Denegado
            </CardTitle>
            <CardDescription>
              No tienes permisos para acceder al panel de seguridad.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const stats = getSecurityStats();
  const suspiciousActivities = getSuspiciousActivities();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSecurityEvents(),
        refetchRateLimitAttempts()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getEventSeverityColor = (eventType: string) => {
    const highSeverity = ['login_failed', 'password_reset_failed', 'suspicious_activity'];
    const mediumSeverity = ['rate_limit_violation', 'account_locked'];
    
    if (highSeverity.includes(eventType)) return 'destructive';
    if (mediumSeverity.includes(eventType)) return 'secondary';
    return 'default';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sora">Panel de Seguridad</h1>
          <p className="text-muted-foreground">Monitoreo y análisis de seguridad del sistema</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inicios de Sesión Fallidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inicios Exitosos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violaciones de Límite</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rateLimitViolations}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activities */}
      {suspiciousActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Actividades Sospechosas
            </CardTitle>
            <CardDescription>
              Actividades que requieren atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <Badge variant={activity.severity === 'high' ? 'destructive' : 'secondary'}>
                    {activity.severity === 'high' ? 'Alta' : 'Media'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Seguridad Recientes</CardTitle>
          <CardDescription>
            Últimos 20 eventos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {securityEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getEventSeverityColor(event.event_type)}>
                      {event.event_type.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {event.event_data?.email && `Email: ${event.event_data.email}`}
                    {event.event_data?.error && ` - Error: ${event.event_data.error}`}
                  </p>
                  {event.ip_address && (
                    <p className="text-xs text-muted-foreground">IP: {event.ip_address}</p>
                  )}
                </div>
              </div>
            ))}
            {securityEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No se encontraron eventos de seguridad
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Límites de Velocidad</CardTitle>
          <CardDescription>
            Intentos que han activado los límites de velocidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rateLimitAttempts.slice(0, 20).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{attempt.action_type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(attempt.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">Identificador: {attempt.identifier}</p>
                </div>
              </div>
            ))}
            {rateLimitAttempts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No se encontraron violaciones de límite de velocidad
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
