
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  Database,
  Zap
} from 'lucide-react';
import { monitoringService } from '@/services/monitoring/MonitoringService';

export function SystemHealthDashboard() {
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    const unsubscribe = monitoringService.subscribe((event) => {
      if (event.type === 'metrics') {
        setMetrics(prev => [...prev.slice(-99), event.data]);
      } else if (event.type === 'alert') {
        setAlerts(prev => [event.data, ...prev]);
      } else if (event.type === 'health') {
        setHealthChecks(event.data);
      }
    });

    const interval = setInterval(loadDashboardData, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = () => {
    try {
      setSystemOverview(monitoringService.getSystemOverview());
      setAlerts(monitoringService.getAlerts());
      setHealthChecks(monitoringService.getHealthChecks());
      setMetrics(monitoringService.getMetrics(50));
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveAlert = (alertId: string) => {
    monitoringService.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(systemOverview?.status)}
                  <Badge className={`ml-2 ${getStatusColor(systemOverview?.status)}`}>
                    {systemOverview?.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">
                  {systemOverview?.alerts?.total || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {systemOverview?.alerts?.critical || 0} critical
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">
                  {systemOverview?.metrics?.performance?.responseTime?.toFixed(0) || 0}ms
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <p className="text-xs text-green-600">Good</p>
                </div>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {systemOverview?.metrics?.resources?.activeUsers || 0}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <p className="text-xs text-green-600">+12%</p>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Availability</span>
                <span>{((systemOverview?.metrics?.performance?.availability || 0) * 100).toFixed(2)}%</span>
              </div>
              <Progress value={(systemOverview?.metrics?.performance?.availability || 0) * 100} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Cache Hit Rate</span>
                <span>{((systemOverview?.metrics?.resources?.cacheHitRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(systemOverview?.metrics?.resources?.cacheHitRate || 0) * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span>{((systemOverview?.metrics?.resources?.memoryUsage || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(systemOverview?.metrics?.resources?.memoryUsage || 0) * 100}
                className={systemOverview?.metrics?.resources?.memoryUsage > 0.8 ? 'bg-red-100' : ''}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Error Rate</span>
                <span>{((systemOverview?.metrics?.performance?.errorRate || 0) * 100).toFixed(2)}%</span>
              </div>
              <Progress 
                value={(systemOverview?.metrics?.performance?.errorRate || 0) * 100}
                className={systemOverview?.metrics?.performance?.errorRate > 0.05 ? 'bg-red-100' : 'bg-green-100'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthChecks.map((check) => (
                <div key={check.service} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium capitalize">{check.service.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        Last check: {new Date(check.lastCheck).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                    {check.responseTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {check.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.filter(alert => !alert.resolved).slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                  'border-yellow-500 bg-yellow-50'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()} • {alert.source}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'destructive' :
                          'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cartas Porte (24h)</p>
                <p className="text-2xl font-bold">
                  {systemOverview?.metrics?.business?.cartasPorteCreated || 0}
                </p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful Timbrados</p>
                <p className="text-2xl font-bold text-green-600">
                  {systemOverview?.metrics?.business?.timbradosSuccessful || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Timbrados</p>
                <p className="text-2xl font-bold text-red-600">
                  {systemOverview?.metrics?.business?.timbradosFailed || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
