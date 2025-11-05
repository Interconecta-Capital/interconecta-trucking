
import { useState } from 'react';
import { CreditCard, Check, Star, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanSummaryCard } from '@/components/suscripcion/PlanSummaryCard';
import { ProtectedContent } from '@/components/ProtectedContent';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanesCard } from '@/components/suscripcion/PlanesCard';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { CreditosBalance } from '@/components/creditos/CreditosBalance';
import { CreditosUsageAlert } from '@/components/creditos/CreditosUsageAlert';

export default function Planes() {
  const [activeTab, setActiveTab] = useState('plan');
  const permissions = useUnifiedPermissionsV2();
  const { planes, cambiarPlan, isChangingPlan } = useSuscripcion();

  // Obtener contadores reales de la base de datos (mismo hook que usa el dashboard)
  const { data: realCounts } = useDashboardCounts();

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
        {/* Alertas de uso de timbres */}
        <CreditosUsageAlert />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Planes y Suscripción</h1>
          </div>
          <CreditosBalance />
        </div>

        {/* Tarjeta principal del plan con conteos reales */}
        <Card className="plan-usage-card">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 plan-usage-grid">
              {/* Conductores */}
              <div className="space-y-2 usage-item-container">
                <LimitUsageIndicator
                  resourceType="conductores"
                />
              </div>

              {/* Vehículos */}
              <div className="space-y-2 usage-item-container">
                <LimitUsageIndicator
                  resourceType="vehiculos"
                />
              </div>

              {/* Socios */}
              <div className="space-y-2 usage-item-container">
                <LimitUsageIndicator
                  resourceType="socios"
                />
              </div>

              {/* Remolques */}
              <div className="space-y-2 usage-item-container">
                {permissions.usage.remolques?.limit ? (
                  <LimitUsageIndicator
                    resourceType="remolques"
                  />
                ) : (
                  <div className="text-xs text-green-600">Sin límite</div>
                )}
              </div>

              {/* Cartas Porte */}
              <div className="space-y-2 usage-item-container">
                <LimitUsageIndicator
                  resourceType="cartas_porte"
                />
              </div>

              {/* Viajes */}
              <div className="space-y-2 usage-item-container">
                {permissions.usage.viajes?.limit ? (
                  <LimitUsageIndicator
                    resourceType="viajes"
                  />
                ) : (
                  <div className="text-xs text-green-600">Sin límite</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles y gestión */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="scrollable-tabs-container-wrapper">
            <TabsList className="grid w-full grid-cols-4 scrollable-tabs-container">
              <TabsTrigger value="plan">Plan Actual</TabsTrigger>
              <TabsTrigger value="uso">Uso de Recursos</TabsTrigger>
              <TabsTrigger value="cambiar">Cambiar Plan</TabsTrigger>
              <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            </TabsList>
          </div>

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
                <LimitUsageIndicator resourceType="remolques" />
                <LimitUsageIndicator resourceType="cartas_porte" />
                <LimitUsageIndicator resourceType="viajes" />
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
