
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Truck, 
  UserCheck, 
  FileText,
  Infinity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';

interface UnifiedUsageIndicatorProps {
  resourceType?: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte';
  showAll?: boolean;
}

export function UnifiedUsageIndicator({ 
  resourceType, 
  showAll = false 
}: UnifiedUsageIndicatorProps) {
  const permissions = useUnifiedPermissions();

  // No mostrar para superusuarios
  if (permissions.accessLevel === 'superuser') {
    return null;
  }

  const resourceConfig = {
    conductores: { icon: Users, label: 'Conductores', color: 'text-blue-600' },
    vehiculos: { icon: Truck, label: 'Vehículos', color: 'text-green-600' },
    socios: { icon: UserCheck, label: 'Socios', color: 'text-purple-600' },
    cartas_porte: { icon: FileText, label: 'Cartas de Porte', color: 'text-orange-600' }
  };

  const renderUsageCard = (
    type: keyof typeof resourceConfig, 
    usage: { used: number; limit: number | null }
  ) => {
    const config = resourceConfig[type];
    const IconComponent = config.icon;
    const percentage = usage.limit ? (usage.used / usage.limit) * 100 : 0;
    const isNearLimit = usage.limit ? percentage > 80 : false;
    const isAtLimit = usage.limit ? usage.used >= usage.limit : false;

    return (
      <Card key={type} className="relative">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <IconComponent className={`h-4 w-4 ${config.color}`} />
              {config.label}
            </div>
            <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'outline' : 'secondary'}>
              {usage.limit ? `${usage.used}/${usage.limit}` : usage.used}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usage.limit ? (
            <div className="space-y-2">
              <Progress 
                value={percentage} 
                className={`h-2 ${
                  isAtLimit ? 'bg-red-100' : 
                  isNearLimit ? 'bg-yellow-100' : 
                  'bg-gray-100'
                }`}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{usage.used} usados</span>
                <div className="flex items-center gap-1">
                  {isAtLimit ? (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  ) : isNearLimit ? (
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  <span className={
                    isAtLimit ? 'text-red-600' : 
                    isNearLimit ? 'text-yellow-600' : 
                    'text-green-600'
                  }>
                    {isAtLimit ? 'Límite alcanzado' : 
                     isNearLimit ? 'Cerca del límite' : 
                     'Disponible'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Infinity className="h-3 w-3" />
              <span>Sin límite</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (showAll) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(permissions.usage).map(([type, usage]) => 
          renderUsageCard(type as keyof typeof resourceConfig, usage)
        )}
      </div>
    );
  }

  if (resourceType && permissions.usage[resourceType]) {
    return renderUsageCard(resourceType, permissions.usage[resourceType]);
  }

  return null;
}
