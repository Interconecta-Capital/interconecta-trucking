import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemMetrics, useRateLimitStats } from '@/hooks/admin/useSystemMetrics';
import { Users, FileText, Car, TrendingUp, UserCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SystemMetricsDashboard() {
  const { data: metrics, isLoading } = useSystemMetrics();
  const { data: rateLimitStats } = useRateLimitStats();

  if (isLoading) {
    return <div className="text-center py-8">Cargando métricas del sistema...</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos (7 días)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.users.new7Days || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registros en la última semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits (1h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{rateLimitStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Intentos bloqueados por rate limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {metrics?.subscriptions && Object.entries(metrics.subscriptions).map(([status, count]) => (
              <Badge
                key={status}
                variant={status === 'trial' ? 'default' : status === 'active' ? 'secondary' : 'outline'}
                className="text-sm px-4 py-2"
              >
                {status}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartas Porte</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.resources.cartasPorte || 0}</div>
            <p className="text-xs text-muted-foreground">
              Documentos generados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.resources.vehiculos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.resources.conductores || 0}</div>
            <p className="text-xs text-muted-foreground">
              Activos en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Completados</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.resources.viajesCompletados || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total histórico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Details */}
      {rateLimitStats && rateLimitStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Rate Limiting (última hora)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(rateLimitStats.byAction).map(([action, count]) => (
                <div key={action} className="flex justify-between items-center p-2 rounded-lg bg-muted">
                  <span className="text-sm font-medium">{action}</span>
                  <Badge variant="outline">{count} intentos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
