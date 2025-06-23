
import { useState } from 'react';
import { CreditCard, Check, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstadoSuscripcion } from '@/components/suscripcion/EstadoSuscripcion';
import { PlanSummaryCard } from '@/components/suscripcion/PlanSummaryCard';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function Planes() {
  const [activeTab, setActiveTab] = useState('actual');

  return (
    <ProtectedContent requiredFeature="cartas_porte">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Planes y Suscripción</h1>
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
            <PlanSummaryCard />
            
            {/* Características del plan actual */}
            <Card>
              <CardHeader>
                <CardTitle>Características de tu Plan</CardTitle>
                <CardDescription>
                  Estas son las funciones disponibles en tu plan actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Cartas Porte ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Gestión de vehículos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Gestión de conductores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Soporte técnico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Reportes avanzados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">API integración</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planes Disponibles</CardTitle>
                <CardDescription>
                  Selecciona el plan que mejor se adapte a tus necesidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Próximamente</h3>
                  <p className="text-muted-foreground">
                    Los planes adicionales estarán disponibles pronto
                  </p>
                </div>
              </CardContent>
            </Card>
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
