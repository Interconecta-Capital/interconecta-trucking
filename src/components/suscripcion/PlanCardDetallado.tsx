import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, Star, Ticket, TrendingUp } from 'lucide-react';
import { PlanSuscripcion } from '@/hooks/useSuscripcion';

interface RealCounts {
  conductores: number;
  vehiculos: number;
  socios: number;
  remolques: number;
  cartas_porte: number;
  viajes: number;
}

interface PlanCardDetalladoProps {
  plan: PlanSuscripcion;
  isCurrentPlan: boolean;
  onSelectPlan: (planId: string) => void;
  isChanging: boolean;
  realCounts?: RealCounts;
}

export function PlanCardDetallado({ plan, isCurrentPlan, onSelectPlan, isChanging, realCounts }: PlanCardDetalladoProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const calcularUso = (tipo: keyof RealCounts, limite?: number | null) => {
    if (!realCounts || !limite) return 0;
    return Math.min(100, (realCounts[tipo] / limite) * 100);
  };

  const isPopular = plan.nombre === 'Flota';

  return (
    <Card className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPopular ? 'border-orange-200 dark:border-orange-800' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500">
          <Star className="w-3 h-3 mr-1" />
          Más Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-primary">
          Plan Actual
        </Badge>
      )}

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{plan.nombre}</CardTitle>
            <CardDescription className="mt-1">{plan.descripcion}</CardDescription>
          </div>
        </div>

        {/* Precio */}
        <div className="text-center py-4 border-y mt-4">
          <div className="text-4xl font-bold">
            {formatPrice(plan.precio_mensual)}
            <span className="text-base font-normal text-muted-foreground">/mes</span>
          </div>
          {plan.precio_anual && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              {formatPrice(plan.precio_anual)}/año (ahorras{' '}
              {Math.round(((plan.precio_mensual * 12 - plan.precio_anual) / (plan.precio_mensual * 12)) * 100)}%)
            </div>
          )}
          {plan.dias_prueba > 0 && !isCurrentPlan && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              ✨ Prueba gratis por {plan.dias_prueba} días
            </div>
          )}
        </div>

        {/* Timbres destacados */}
        {plan.timbres_mensuales && (
          <div className="mt-3 flex items-center justify-center gap-2 text-primary bg-primary/10 py-2 px-4 rounded-lg">
            <Ticket className="w-5 h-5" />
            <span className="font-semibold">{plan.timbres_mensuales} timbres/mes renovables</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Límites con barra de progreso */}
        {isCurrentPlan && realCounts && (
          <div className="space-y-3 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Uso Actual
            </div>
            <LimitItem
              label="Conductores"
              limite={plan.limite_conductores}
              uso={realCounts.conductores}
              porcentaje={calcularUso('conductores', plan.limite_conductores)}
            />
            <LimitItem
              label="Vehículos"
              limite={plan.limite_vehiculos}
              uso={realCounts.vehiculos}
              porcentaje={calcularUso('vehiculos', plan.limite_vehiculos)}
            />
            <LimitItem
              label="Socios"
              limite={plan.limite_socios}
              uso={realCounts.socios}
              porcentaje={calcularUso('socios', plan.limite_socios)}
            />
            <LimitItem
              label="Cartas Porte"
              limite={plan.limite_cartas_porte}
              uso={realCounts.cartas_porte}
              porcentaje={calcularUso('cartas_porte', plan.limite_cartas_porte)}
            />
          </div>
        )}

        {/* Límites del plan */}
        {!isCurrentPlan && (
          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="text-sm font-medium text-muted-foreground mb-2">Límites del Plan</div>
            <SimpleLimitItem label="Conductores" limite={plan.limite_conductores} />
            <SimpleLimitItem label="Vehículos" limite={plan.limite_vehiculos} />
            <SimpleLimitItem label="Socios" limite={plan.limite_socios} />
            <SimpleLimitItem label="Cartas Porte" limite={plan.limite_cartas_porte} />
          </div>
        )}

        {/* Funcionalidades */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Funcionalidades</div>
          <FeatureItem label="Generación de XML" included={plan.puede_generar_xml} />
          <FeatureItem label="Timbrado automático" included={plan.puede_timbrar} />
          <FeatureItem label="Cancelación de CFDI" included={plan.puede_cancelar_cfdi} />
          <FeatureItem label="Tracking en tiempo real" included={plan.puede_tracking} />
          <FeatureItem label="Panel de administración" included={plan.puede_acceder_administracion} />
          <FeatureItem label="Funciones avanzadas" included={plan.puede_acceder_funciones_avanzadas} />
          {plan.puede_acceder_enterprise && (
            <FeatureItem label="🏆 Funciones Enterprise" included={true} />
          )}
        </div>

        {/* Botón de acción */}
        <Button
          onClick={() => onSelectPlan(plan.id)}
          disabled={isCurrentPlan || isChanging}
          className="w-full mt-4"
          variant={isCurrentPlan ? 'outline' : 'default'}
        >
          {isCurrentPlan ? 'Plan Actual' : 
           isChanging ? 'Procesando...' : 
           plan.precio_mensual === 0 ? 'Seleccionar Gratis' :
           `Seleccionar ${plan.nombre}`}
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar límites con uso
function LimitItem({ label, limite, uso, porcentaje }: { label: string; limite?: number | null; uso?: number; porcentaje?: number }) {
  if (!limite) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-green-600 dark:text-green-400 font-medium">Ilimitado</span>
      </div>
    );
  }

  const getColorClass = () => {
    if (!porcentaje) return 'bg-primary';
    if (porcentaje >= 90) return 'bg-red-500';
    if (porcentaje >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {uso || 0} / {limite}
        </span>
      </div>
      {uso !== undefined && (
        <Progress value={porcentaje || 0} className="h-2" />
      )}
    </div>
  );
}

// Componente para mostrar límites simples (sin uso)
function SimpleLimitItem({ label, limite }: { label: string; limite?: number | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {limite ? limite : <span className="text-green-600 dark:text-green-400">Ilimitado</span>}
      </span>
    </div>
  );
}

// Componente para características
function FeatureItem({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <span className={included ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}
