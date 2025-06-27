
import { useState } from 'react';
import { CreditCard, Check, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanSummaryCard } from '@/components/suscripcion/PlanSummaryCard';
import { ProtectedContent } from '@/components/ProtectedContent';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanesCard } from '@/components/suscripcion/PlanesCard';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function Planes() {
  const [activeTab, setActiveTab] = useState('plan');
  const permissions = useUnifiedPermissionsV2();
  const { planes, cambiarPlan, isChangingPlan } = useSuscripcion();
  const { user } = useAuth();

  // Obtener contadores reales de la base de datos (mismo hook que usa el dashboard)
  const { data: realCounts } = useQuery({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      const [vehiculosRes, conductoresRes, sociosRes, remolquesRes, cartasRes, viajesRes] = await Promise.all([
        supabase.from('vehiculos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('conductores').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('socios').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('remolques_ccp').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('cartas_porte').select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString()),
        supabase.from('viajes').select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString())
      ]);

      return {
        vehiculos: vehiculosRes.count || 0,
        conductores: conductoresRes.count || 0,
        socios: sociosRes.count || 0,
        remolques: remolquesRes.count || 0,
        cartas_porte: cartasRes.count || 0,
        viajes: viajesRes.count || 0
      };
    },
    enabled: !!user?.id
  });

  // Crear planDetails basado en la información real del usuario
  const planDetails = [
    {
      feature: permissions.usage.cartas_porte.limit ? 
        `${permissions.usage.cartas_porte.limit} cartas porte` : 
        'Cartas porte ilimitadas',
      included: true
    },
    {
      feature: permissions.usage.conductores.limit ? 
        `${permissions.usage.conductores.limit} conductores` : 
        'Conductores ilimitados',
      included: true
    },
    {
      feature: permissions.usage.vehiculos.limit ? 
        `${permissions.usage.vehiculos.limit} vehículos` : 
        'Vehículos ilimitados',
      included: true
    },
    {
      feature: permissions.usage.socios.limit ? 
        `${permissions.usage.socios.limit} socios` : 
        'Socios ilimitados',
      included: true
    },
    {
      feature: permissions.usage.remolques?.limit ? 
        `${permissions.usage.remolques.limit} remolques` : 
        'Remolques ilimitados',
      included: true
    },
    {
      feature: permissions.usage.viajes?.limit ? 
        `${permissions.usage.viajes.limit} viajes por mes` : 
        'Viajes ilimitados',
      included: true
    },
    { feature: 'Generación de XML', included: permissions.hasFullAccess },
    { feature: 'Timbrado automático', included: permissions.hasFullAccess },
    { feature: 'Cancelación de CFDI', included: permissions.hasFullAccess },
    { feature: 'Tracking en tiempo real', included: permissions.hasFullAccess }
  ];

  return (
    <ProtectedContent requiredFeature="cartas_porte">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Planes y Suscripción</h1>
        </div>

        {/* Tarjeta principal del plan con conteos reales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {permissions.planInfo.name}
                </CardTitle>
                <CardDescription>
                  {permissions.accessLevel === 'freemium' ? 'Plan Gratis' :
                   permissions.accessLevel === 'trial' ? 'Período de Prueba' :
                   permissions.accessLevel === 'paid' ? 'Plan Activo' :
                   permissions.accessLevel === 'superuser' ? 'Administrador' : 
                   'Sin plan activo'}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Estado</div>
                <div className="font-medium">
                  {permissions.planInfo.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Conductores */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conductores</span>
                  <span className="text-xs text-muted-foreground">
                    {realCounts?.conductores || 0}
                    {permissions.usage.conductores.limit ? `/${permissions.usage.conductores.limit}` : ''}
                  </span>
                </div>
                <LimitUsageIndicator 
                  resourceType="conductores" 
                  showDetails={false}
                />
                {permissions.usage.conductores.limit && (
                  <div className="text-xs text-muted-foreground">
                    {((realCounts?.conductores || 0) / permissions.usage.conductores.limit * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Vehículos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vehículos</span>
                  <span className="text-xs text-muted-foreground">
                    {realCounts?.vehiculos || 0}
                    {permissions.usage.vehiculos.limit ? `/${permissions.usage.vehiculos.limit}` : ''}
                  </span>
                </div>
                <LimitUsageIndicator 
                  resourceType="vehiculos" 
                  showDetails={false}
                />
                {permissions.usage.vehiculos.limit && (
                  <div className="text-xs text-muted-foreground">
                    {((realCounts?.vehiculos || 0) / permissions.usage.vehiculos.limit * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Socios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Socios</span>
                  <span className="text-xs text-muted-foreground">
                    {realCounts?.socios || 0}
                    {permissions.usage.socios.limit ? `/${permissions.usage.socios.limit}` : ''}
                  </span>
                </div>
                <LimitUsageIndicator 
                  resourceType="socios" 
                  showDetails={false}
                />
                {permissions.usage.socios.limit && (
                  <div className="text-xs text-muted-foreground">
                    {((realCounts?.socios || 0) / permissions.usage.socios.limit * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Remolques */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Remolques</span>
                  <span className="text-xs text-muted-foreground">
                    {realCounts?.remolques || 0}
                    {permissions.usage.remolques?.limit ? `/${permissions.usage.remolques.limit}` : ''}
                  </span>
                </div>
                {permissions.usage.remolques?.limit ? (
                  <LimitUsageIndicator 
                    resourceType="remolques" 
                    showDetails={false}
                  />
                ) : (
                  <div className="text-xs text-green-600">Sin límite</div>
                )}
                {permissions.usage.remolques?.limit && (
                  <div className="text-xs text-muted-foreground">
                    {((realCounts?.remolques || 0) / permissions.usage.remolques.limit * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Cartas Porte */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cartas Porte</span>
                  <span className="text-xs text-muted-foreground">
                    {realCounts?.cartas_porte || 0}
                    {permissions.usage.cartas_porte.limit ? `/${permissions.usage.cartas_porte.limit}` : ''}
                  </span>
                </div>
                <LimitUsageIndicator 
                  resourceType="cartas_porte" 
                  showDetails={false}
                />
                {permissions.usage.cartas_porte.limit && (
                  <div className="text-xs text-muted-foreground">
                    {((realCounts?.cartas_porte || 0) / permissions.usage.cartas_porte.limit * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Viajes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Viajes</span>
                  <span className="text-xs text-muted-foreground">
                    {realCounts?.viajes || 0}
                    {permissions.usage.viajes?.limit ? `/${permissions.usage.viajes.limit}` : ''}
                  </span>
                </div>
                {permissions.usage.viajes?.limit ? (
                  <LimitUsageIndicator 
                    resourceType="viajes" 
                    showDetails={false}
                  />
                ) : (
                  <div className="text-xs text-green-600">Sin límite</div>
                )}
                {permissions.usage.viajes?.limit && (
                  <div className="text-xs text-muted-foreground">
                    {((realCounts?.viajes || 0) / permissions.usage.viajes.limit * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles y gestión */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plan">Plan Actual</TabsTrigger>
            <TabsTrigger value="uso">Uso de Recursos</TabsTrigger>
            <TabsTrigger value="cambiar">Cambiar Plan</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Características de tu Plan</CardTitle>
                <CardDescription>
                  Estas son las funciones disponibles en tu plan actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {planDetails.filter(d => d.included).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{item.feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uso" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso Detallado por Recurso</CardTitle>
                <CardDescription>
                  Visualiza tu uso actual de recursos con conteos en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LimitUsageIndicator resourceType="conductores" />
                <LimitUsageIndicator resourceType="vehiculos" />
                <LimitUsageIndicator resourceType="socios" />
                <LimitUsageIndicator resourceType="cartas_porte" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cambiar" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planes.map((plan) => (
                <PlanesCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={plan.nombre === permissions.planInfo.name}
                  onSelectPlan={cambiarPlan}
                  isChanging={isChangingPlan}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="facturacion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Facturación</CardTitle>
                <CardDescription>
                  Consulta tus facturas y pagos realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Próximamente</h3>
                  <p className="text-muted-foreground">
                    La sección de facturación estará disponible pronto
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
