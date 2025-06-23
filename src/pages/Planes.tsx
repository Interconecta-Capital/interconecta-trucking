
import { useState } from 'react';
import { CreditCard, Check, Star, Zap, Shield, Crown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstadoSuscripcion } from '@/components/suscripcion/EstadoSuscripcion';
import { PlanSummaryCard } from '@/components/suscripcion/PlanSummaryCard';
import { ProtectedContent } from '@/components/ProtectedContent';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

const planFeatures = {
  trial: [
    'Acceso completo por tiempo limitado',
    'Hasta 5 vehículos',
    'Hasta 3 conductores',
    'Carta Porte básica',
    'Soporte por email'
  ],
  pro: [
    'Vehículos ilimitados',
    'Conductores ilimitados',
    'Carta Porte completa',
    'Timbrado automático',
    'Reportes avanzados',
    'Soporte prioritario',
    'API completa',
    'Backup automático'
  ],
  enterprise: [
    'Todo lo del plan Pro',
    'Usuarios múltiples',
    'Roles y permisos',
    'Dashboard ejecutivo',
    'Integración personalizada',
    'Soporte dedicado 24/7',
    'SLA garantizado',
    'Consultoría incluida'
  ]
};

export default function Planes() {
  const [activeTab, setActiveTab] = useState('actual');
  const permissions = useUnifiedPermissionsV2();

  const getCurrentPlanIcon = () => {
    switch (permissions.accessLevel) {
      case 'trial':
        return <Zap className="h-5 w-5 text-orange-600" />;
      case 'paid':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'superuser':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPlanName = () => {
    switch (permissions.accessLevel) {
      case 'trial':
        return 'Plan Trial';
      case 'paid':
        return permissions.planInfo.name || 'Plan Pro';
      case 'superuser':
        return 'Superusuario';
      default:
        return 'Sin Plan';
    }
  };

  return (
    <ProtectedContent requiredFeature="cartas_porte">
      <div className="container mx-auto py-6 space-y-6 max-w-6xl">
        {/* Header mejorado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Planes y Suscripción</h1>
              <p className="text-gray-600">Gestiona tu plan y accede a todas las funcionalidades</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
            {getCurrentPlanIcon()}
            <span className="font-medium">{getPlanName()}</span>
          </div>
        </div>

        {/* Estado actual de la suscripción */}
        <EstadoSuscripcion />

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="actual">Plan Actual</TabsTrigger>
            <TabsTrigger value="planes">Cambiar Plan</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          </TabsList>

          <TabsContent value="actual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlanSummaryCard />
              
              {/* Características del plan actual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Características Incluidas
                  </CardTitle>
                  <CardDescription>
                    Funciones disponibles en tu plan actual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {planFeatures[permissions.accessLevel === 'trial' ? 'trial' : 'pro']?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Uso actual */}
            {permissions.accessLevel !== 'superuser' && (
              <Card>
                <CardHeader>
                  <CardTitle>Uso Actual</CardTitle>
                  <CardDescription>
                    Tu uso actual vs límites del plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {permissions.planInfo.limites.vehiculos || '∞'}
                      </div>
                      <div className="text-sm text-gray-600">Vehículos</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {permissions.planInfo.limites.conductores || '∞'}
                      </div>
                      <div className="text-sm text-gray-600">Conductores</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {permissions.planInfo.limites.socios || '∞'}
                      </div>
                      <div className="text-sm text-gray-600">Socios</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {permissions.planInfo.limites.cartas_porte || '∞'}
                      </div>
                      <div className="text-sm text-gray-600">Cartas Porte</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="planes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Planes Disponibles
                </CardTitle>
                <CardDescription>
                  Selecciona el plan que mejor se adapte a tus necesidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Plan Trial */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-medium">
                      GRATIS
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        Plan Trial
                      </CardTitle>
                      <div className="text-3xl font-bold">$0</div>
                      <CardDescription>Por 14 días</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {planFeatures.trial.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        variant={permissions.accessLevel === 'trial' ? 'secondary' : 'default'}
                        disabled={permissions.accessLevel === 'trial'}
                      >
                        {permissions.accessLevel === 'trial' ? 'Plan Actual' : 'Iniciar Trial'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Plan Pro */}
                  <Card className="relative overflow-hidden border-blue-200 shadow-lg">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium">
                      RECOMENDADO
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Plan Pro
                      </CardTitle>
                      <div className="text-3xl font-bold">$999</div>
                      <CardDescription>Por mes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {planFeatures.pro.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        variant={permissions.accessLevel === 'paid' ? 'secondary' : 'default'}
                        disabled={permissions.accessLevel === 'paid'}
                      >
                        {permissions.accessLevel === 'paid' ? 'Plan Actual' : (
                          <>
                            Actualizar a Pro
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Plan Enterprise */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-medium">
                      ENTERPRISE
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-600" />
                        Enterprise
                      </CardTitle>
                      <div className="text-3xl font-bold">Cotizar</div>
                      <CardDescription>Precio personalizado</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {planFeatures.enterprise.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full" variant="outline">
                        Contactar Ventas
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facturacion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Historial de Facturación
                </CardTitle>
                <CardDescription>
                  Consulta tus facturas y pagos realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Próximamente</h3>
                  <p className="text-muted-foreground mb-4">
                    La sección de facturación estará disponible pronto
                  </p>
                  <Button variant="outline">
                    Recibir Notificación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
