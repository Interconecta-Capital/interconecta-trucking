
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { DashboardLayout } from './DashboardLayout';
import { WelcomeCard } from './WelcomeCard';
import { QuickActionsCard } from './QuickActionsCard';
import { AIInsights } from '@/components/ai/AIInsights';

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const permissions = useUnifiedPermissionsV2();

  // Obtener contadores reales de la base de datos
  const { data: realCounts } = useDashboardCounts();

  // Mostrar tarjeta de bienvenida para usuarios nuevos
  const shouldShowWelcome = !user?.profile?.has_visited_dashboard;

  // Función para obtener el color de la barra de progreso
  const getProgressColor = (used: number, limit: number | null) => {
    if (!limit) return 'bg-blue-600';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  // Función para renderizar una tarjeta de métrica con límites
  const renderMetricCard = (title: string, used: number, limit: number | null, isMonthly = false) => {
    const percentage = limit ? (used / limit) * 100 : 0;
    const progressColor = getProgressColor(used, limit);
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {used}
            {limit && `/${limit}`}
          </div>
          
          {limit && (
            <div className="mt-2 space-y-1">
              <Progress 
                value={percentage} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {percentage >= 90 ? (
                  <span className="text-red-600 font-medium">
                    ¡Límite casi alcanzado!
                  </span>
                ) : percentage >= 75 ? (
                  <span className="text-yellow-600 font-medium">
                    Acercándose al límite
                  </span>
                ) : (
                  <span className="text-green-600">
                    {limit - used} disponibles
                  </span>
                )}
                {isMonthly && ' este mes'}
              </p>
            </div>
          )}
          
          {permissions.accessLevel === 'freemium' && limit && (
            <p className="text-xs text-muted-foreground mt-1">
              Plan Gratis: máximo {limit}{isMonthly ? '/mes' : ''}
            </p>
          )}
          
          {!limit && (
            <p className="text-xs text-muted-foreground">
              Sin límite
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Saludo personalizado */}
      <PersonalizedGreeting />

      {/* Información del Plan - Adaptativa */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de tu Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Plan Actual</p>
              <p className="text-2xl font-bold">{permissions.planInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Nivel de Acceso</p>
              <p className="text-lg capitalize">
                {permissions.accessLevel === 'freemium' ? 'Gratis' : 
                 permissions.accessLevel === 'trial' ? 'Prueba' :
                 permissions.accessLevel === 'paid' ? 'Pagado' :
                 permissions.accessLevel === 'superuser' ? 'Administrador' : 
                 permissions.accessLevel}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Estado</p>
              <p className="text-lg">{permissions.planInfo.isActive ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {permissions.accessReason}
          </p>
        </CardContent>
      </Card>

      {/* Tarjeta de bienvenida para usuarios nuevos */}
      <WelcomeCard show={shouldShowWelcome} />

      {/* Métricas del dashboard con datos reales y límites */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {renderMetricCard(
          'Vehículos', 
          realCounts?.vehiculos || 0, 
          permissions.usage.vehiculos.limit
        )}
        
        {renderMetricCard(
          'Conductores', 
          realCounts?.conductores || 0, 
          permissions.usage.conductores.limit
        )}
        
        {renderMetricCard(
          'Socios', 
          realCounts?.socios || 0, 
          permissions.usage.socios.limit
        )}
        
        {renderMetricCard(
          'Remolques', 
          realCounts?.remolques || 0, 
          permissions.usage.remolques.limit
        )}
        
        {renderMetricCard(
          'Cartas Porte', 
          realCounts?.cartas_porte || 0, 
          permissions.usage.cartas_porte.limit,
          true
        )}
        
        {renderMetricCard(
          'Viajes', 
          realCounts?.viajes || 0, 
          permissions.usage.viajes.limit,
          true
        )}
      </div>

      {/* Insights inteligentes */}
      <AIInsights />

      {/* Acciones rápidas */}
      <QuickActionsCard />

      {/* Layout del dashboard con calendario */}
      <DashboardLayout />
    </div>
  );
}
