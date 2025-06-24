
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

export default function Planes() {
  const [activeTab, setActiveTab] = useState('plan');
  const permissions = useUnifiedPermissionsV2();
  const { planes, cambiarPlan, isChangingPlan } = useSuscripcion();

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
                  {permissions.planDetails.filter(d => d.included).map((item, i) => (
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
