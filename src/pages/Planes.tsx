
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
import { useRealTimeCounts } from '@/hooks/useRealTimeCounts';
import { useSuscripcion } from '@/hooks/useSuscripcion';

export default function Planes() {
  const [activeTab, setActiveTab] = useState('plan');
  const permissions = useUnifiedPermissionsV2();
  const { data: realCounts } = useRealTimeCounts();
  const { planes, cambiarPlan, isChangingPlan } = useSuscripcion();

  // Crear planDetails basado en la información disponible en permissions
  const planDetails = [
    {
      feature: permissions.usage.cartas_porte.limit ? 
        `${permissions.usage.cartas_porte.limit} cartas porte por mes` : 
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
      feature: permissions.usage.remolques.limit ? 
        `${permissions.usage.remolques.limit} remolques` : 
        'Remolques ilimitados',
      included: true
    },
    {
      feature: permissions.usage.viajes.limit ? 
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

        {/* Tarjeta principal del plan */}
        <PlanSummaryCard />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Uso de Recursos</CardTitle>
                  <CardDescription>
                    Contadores en tiempo real de tus recursos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LimitUsageIndicator resourceType="conductores" />
                  <LimitUsageIndicator resourceType="vehiculos" />
                  <LimitUsageIndicator resourceType="socios" />
                  <LimitUsageIndicator resourceType="remolques" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uso Mensual</CardTitle>
                  <CardDescription>
                    Recursos que se renuevan cada mes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LimitUsageIndicator resourceType="cartas_porte" />
                  <LimitUsageIndicator resourceType="viajes" />
                </CardContent>
              </Card>
            </div>

            {/* Mostrar resumen de contadores reales */}
            {realCounts && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Contadores</CardTitle>
                  <CardDescription>
                    Vista general de todos tus recursos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Vehículos</p>
                      <p className="text-2xl font-bold">{realCounts.vehiculos}</p>
                    </div>
                    <div>
                      <p className="font-medium">Conductores</p>
                      <p className="text-2xl font-bold">{realCounts.conductores}</p>
                    </div>
                    <div>
                      <p className="font-medium">Socios</p>
                      <p className="text-2xl font-bold">{realCounts.socios}</p>
                    </div>
                    <div>
                      <p className="font-medium">Remolques</p>
                      <p className="text-2xl font-bold">{realCounts.remolques}</p>
                    </div>
                    <div>
                      <p className="font-medium">Cartas (este mes)</p>
                      <p className="text-2xl font-bold">{realCounts.cartas_porte_mes}</p>
                    </div>
                    <div>
                      <p className="font-medium">Viajes (este mes)</p>
                      <p className="text-2xl font-bold">{realCounts.viajes_mes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
