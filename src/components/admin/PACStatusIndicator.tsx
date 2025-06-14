
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Activity
} from 'lucide-react';
import { multiplePACManager } from '@/services/pac/MultiplePACManager';

export function PACStatusIndicator() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPACStatus();
    const interval = setInterval(loadPACStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPACStatus = async () => {
    try {
      const status = multiplePACManager.getProviderStatus();
      setProviders(status);
      setLoading(false);
    } catch (error) {
      console.error('Error loading PAC status:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPACStatus();
    setRefreshing(false);
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

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return <Badge variant="default">Primary</Badge>;
    if (priority <= 3) return <Badge variant="secondary">Secondary</Badge>;
    return <Badge variant="outline">Backup</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PAC Providers Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthyCount = providers.filter(p => p.isActive && p.healthStatus === 'healthy').length;
  const totalActive = providers.filter(p => p.isActive).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>PAC Providers Status</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={healthyCount === totalActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {healthyCount}/{totalActive} Healthy
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 rounded-lg border ${
                provider.isActive ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(provider.healthStatus)}
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(provider.priority)}
                  <Badge className={getStatusColor(provider.healthStatus)}>
                    {provider.healthStatus}
                  </Badge>
                  {!provider.isActive && (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
              </div>

              {provider.isActive && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Success Rate
                    </p>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={provider.successRate} 
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {provider.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Response Time
                    </p>
                    <p className="text-sm">
                      {provider.responseTime.toFixed(0)}ms
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Last Check
                    </p>
                    <p className="text-sm">
                      {new Date(provider.lastHealthCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  Priority: {provider.priority} • 
                  Type: {provider.type}
                </div>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No PAC providers configured</p>
            <Button size="sm" className="mt-2">
              Configure Providers
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
