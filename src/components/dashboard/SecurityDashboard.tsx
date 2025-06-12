
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityMonitoring } from '@/hooks/auth/useSecurityMonitoring';
import { AlertTriangle, Shield, Users, Activity, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SecurityDashboard() {
  const { 
    isAdmin, 
    securityEvents, 
    rateLimitAttempts,
    getSecurityStats,
    getSuspiciousActivities,
    refetchSecurityEvents,
    refetchRateLimitAttempts
  } = useSecurityMonitoring();

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-interconecta-text-secondary">
            Acceso denegado. Solo administradores pueden ver este panel.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = getSecurityStats();
  const suspiciousActivities = getSuspiciousActivities();

  const handleRefresh = () => {
    refetchSecurityEvents();
    refetchRateLimitAttempts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-sora text-interconecta-text-primary">
            Panel de Seguridad
          </h2>
          <p className="text-interconecta-text-secondary font-inter">
            Monitoreo y análisis de eventos de seguridad
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
            <Activity className="h-4 w-4 text-interconecta-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-interconecta-text-secondary">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inicios Exitosos</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
            <p className="text-xs text-interconecta-text-secondary">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inicios Fallidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            <p className="text-xs text-interconecta-text-secondary">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.registrationAttempts}</div>
            <p className="text-xs text-interconecta-text-secondary">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rateLimitViolations}</div>
            <p className="text-xs text-interconecta-text-secondary">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activities */}
      {suspiciousActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Actividades Sospechosas
            </CardTitle>
            <CardDescription>
              Eventos que requieren atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-800">{activity.type}</p>
                    <p className="text-sm text-red-600">{activity.description}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Seguridad Recientes</CardTitle>
            <CardDescription>
              Últimos 10 eventos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {securityEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.event_type}</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                    {event.event_data.email && (
                      <p className="text-xs text-gray-500">{event.event_data.email}</p>
                    )}
                  </div>
                  <Badge variant={
                    event.event_type.includes('failed') ? 'destructive' : 
                    event.event_type.includes('successful') ? 'default' : 'secondary'
                  }>
                    {event.event_type.includes('failed') ? 'Error' : 
                     event.event_type.includes('successful') ? 'Éxito' : 'Info'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Recientes</CardTitle>
            <CardDescription>
              Últimos 10 intentos bloqueados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rateLimitAttempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{attempt.action_type}</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(attempt.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                    <p className="text-xs text-gray-500">{attempt.identifier}</p>
                  </div>
                  <Badge variant="secondary">Bloqueado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
