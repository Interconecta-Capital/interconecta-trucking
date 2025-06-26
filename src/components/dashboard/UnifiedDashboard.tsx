
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { DashboardLayout } from './DashboardLayout';
import { WelcomeCard } from './WelcomeCard';
import { QuickActionsCard } from './QuickActionsCard';
import { AIInsights } from '@/components/ai/AIInsights';

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const permissions = useUnifiedPermissionsV2();

  // Obtener contadores reales de la base de datos
  const { data: realCounts } = useQuery({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [vehiculosRes, sociosRes, conductoresRes, cartasRes] = await Promise.all([
        supabase.from('vehiculos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('socios').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('conductores').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('cartas_porte').select('id', { count: 'exact' }).eq('usuario_id', user.id)
      ]);

      return {
        vehiculos: vehiculosRes.count || 0,
        socios: sociosRes.count || 0,
        conductores: conductoresRes.count || 0,
        cartas_porte: cartasRes.count || 0
      };
    },
    enabled: !!user?.id
  });

  // Mostrar tarjeta de bienvenida para usuarios nuevos
  const shouldShowWelcome = !user?.profile?.has_visited_dashboard;

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

      {/* Métricas del dashboard con datos reales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realCounts?.vehiculos || 0}
              {permissions.accessLevel === 'freemium' && permissions.planInfo.limits && 
                `/${permissions.planInfo.limits.vehiculos}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.planInfo.limits && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: máximo {permissions.planInfo.limits.vehiculos}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realCounts?.socios || 0}
              {permissions.accessLevel === 'freemium' && permissions.planInfo.limits && 
                `/${permissions.planInfo.limits.socios}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.planInfo.limits && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: máximo {permissions.planInfo.limits.socios}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realCounts?.conductores || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sin límite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartas Porte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realCounts?.cartas_porte || 0}
              {permissions.accessLevel === 'freemium' && permissions.planInfo.limits && 
                `/${permissions.planInfo.limits.cartas_porte_mensual}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.planInfo.limits && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: {permissions.planInfo.limits.cartas_porte_mensual}/mes
              </p>
            )}
          </CardContent>
        </Card>
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
