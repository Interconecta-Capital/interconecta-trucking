import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSecurityAuditLog, useSecurityStats } from '@/hooks/admin/useSecurityAuditLog';
import { Shield, AlertTriangle, Info, XCircle, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SecurityAuditDashboard() {
  const [filters, setFilters] = useState({
    eventType: '',
    startDate: '',
    endDate: '',
  });

  const { data: auditLogs, isLoading } = useSecurityAuditLog(filters);
  const { data: stats } = useSecurityStats();

  const getEventSeverity = (eventType: string): 'error' | 'warning' | 'info' => {
    if (eventType.includes('failed') || eventType.includes('error')) return 'error';
    if (eventType.includes('warning') || eventType === 'role_changed') return 'warning';
    return 'info';
  };

  const getSeverityIcon = (eventType: string) => {
    const severity = getEventSeverity(eventType);
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (eventType: string) => {
    const severity = getEventSeverity(eventType);
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'login': 'Inicio de Sesión',
      'failed_login': 'Inicio de Sesión Fallido',
      'user_created': 'Usuario Creado',
      'user_anonymized': 'Usuario Anonimizado',
      'data_export_requested': 'Exportación de Datos',
      'role_changed': 'Cambio de Rol',
      'secret_access': 'Acceso a Secreto',
      'pac_credentials_access': 'Acceso a Credenciales PAC',
    };
    return labels[eventType] || eventType;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Exitosos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.successfulLogins || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Fallidos</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failedLogins || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filters.eventType} onValueChange={(value) => setFilters({ ...filters, eventType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="login">Inicio de Sesión</SelectItem>
                <SelectItem value="failed_login">Login Fallido</SelectItem>
                <SelectItem value="user_created">Usuario Creado</SelectItem>
                <SelectItem value="user_anonymized">Usuario Anonimizado</SelectItem>
                <SelectItem value="data_export_requested">Exportación de Datos</SelectItem>
                <SelectItem value="role_changed">Cambio de Rol</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              placeholder="Fecha Inicio"
            />

            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              placeholder="Fecha Fin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando eventos...</div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(log.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getSeverityColor(log.event_type)}>
                        {getEventSeverity(log.event_type)}
                      </Badge>
                      <Badge variant="secondary">
                        {getEventTypeLabel(log.event_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss", { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.event_type}</p>
                    {log.event_data && typeof log.event_data === 'object' && (
                      <pre className="text-xs text-muted-foreground mt-2 overflow-x-auto">
                        {JSON.stringify(log.event_data, null, 2)}
                      </pre>
                    )}
                    {log.ip_address && typeof log.ip_address === 'string' && (
                      <p className="text-xs text-muted-foreground mt-1">IP: {log.ip_address}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron eventos con los filtros seleccionados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
