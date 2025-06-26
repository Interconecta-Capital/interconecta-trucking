
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { FreemiumTestButtons } from './FreemiumTestButtons';
import { DashboardLayout } from './DashboardLayout';
import { WelcomeCard } from './WelcomeCard';

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const permissions = useUnifiedPermissionsV2();

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

      {/* Panel de pruebas - Solo para plan Gratis */}
      {permissions.accessLevel === 'freemium' && <FreemiumTestButtons />}

      {/* Tarjeta de bienvenida para usuarios nuevos */}
      <WelcomeCard show={shouldShowWelcome} />

      {/* Métricas del dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.vehiculos.used}
              {permissions.usage.vehiculos.limit && `/${permissions.usage.vehiculos.limit}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.usage.vehiculos.limit && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: máximo {permissions.usage.vehiculos.limit}
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
              {permissions.usage.socios.used}
              {permissions.usage.socios.limit && `/${permissions.usage.socios.limit}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.usage.socios.limit && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: máximo {permissions.usage.socios.limit}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.viajes.used}
              {permissions.usage.viajes.limit && `/${permissions.usage.viajes.limit}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.usage.viajes.limit && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: {permissions.usage.viajes.limit}/mes
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartas Porte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.cartas_porte.used}
              {permissions.usage.cartas_porte.limit && `/${permissions.usage.cartas_porte.limit}`}
            </div>
            {permissions.accessLevel === 'freemium' && permissions.usage.cartas_porte.limit && (
              <p className="text-xs text-muted-foreground">
                Plan Gratis: {permissions.usage.cartas_porte.limit}/mes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Layout del dashboard con calendario, insights y acciones rápidas */}
      <DashboardLayout />
    </div>
  );
}
