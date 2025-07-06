
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { DocumentosProcesadosWidget } from './DocumentosProcesadosWidget';
import { QuickActionsCard } from './QuickActionsCard';
import { AIInsights } from '@/components/ai/AIInsights';
import { 
  DollarSign,
  Target,
  Route,
  Truck
} from 'lucide-react';

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const permissions = useUnifiedPermissionsV2();

  // Obtener contadores reales de la base de datos
  const { data: realCounts } = useDashboardCounts();

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

      {/* Quick Metrics Bar - Widgets principales del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-900">$125,430</div>
                <div className="text-xs text-blue-700">Ingresos del mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-900">18.5%</div>
                <div className="text-xs text-green-700">Margen promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Route className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-lg font-bold text-purple-900">247</div>
                <div className="text-xs text-purple-700">Viajes completados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-lg font-bold text-orange-900">85%</div>
                <div className="text-xs text-orange-700">Utilización flota</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas del dashboard con datos reales y límites */}
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
            {renderMetricCard(
              'Vehículos',
              realCounts?.vehiculos || 0,
              permissions.usage.vehiculos.limit
            )}
          </CarouselItem>
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
            {renderMetricCard(
              'Conductores',
              realCounts?.conductores || 0,
              permissions.usage.conductores.limit
            )}
          </CarouselItem>
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
            {renderMetricCard(
              'Socios',
              realCounts?.socios || 0,
              permissions.usage.socios.limit
            )}
          </CarouselItem>
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
            {renderMetricCard(
              'Remolques',
              realCounts?.remolques || 0,
              permissions.usage.remolques.limit
            )}
          </CarouselItem>
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
            {renderMetricCard(
              'Cartas Porte',
              realCounts?.cartas_porte || 0,
              permissions.usage.cartas_porte.limit,
              true
            )}
          </CarouselItem>
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
            {renderMetricCard(
              'Viajes',
              realCounts?.viajes || 0,
              permissions.usage.viajes.limit,
              true
            )}
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Contenido principal organizado en columnas */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <QuickActionsCard />
          <EnhancedCalendarView />
        </div>
        <div className="space-y-6">
          <AIInsights />
          <DocumentosProcesadosWidget />
        </div>
      </div>
    </div>
  );
}
