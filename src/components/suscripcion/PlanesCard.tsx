
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { PlanSuscripcion } from '@/hooks/useSuscripcion';

interface PlanesCardProps {
  plan: PlanSuscripcion;
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: string) => void;
  isChanging?: boolean;
}

export const PlanesCard = ({ plan, isCurrentPlan, onSelectPlan, isChanging }: PlanesCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const getFeatures = () => {
    const features = [];
    
    if (plan.limite_cartas_porte) {
      features.push(`${plan.limite_cartas_porte} cartas porte`);
    } else {
      features.push('Cartas porte ilimitadas');
    }
    
    if (plan.limite_conductores) {
      features.push(`${plan.limite_conductores} conductores`);
    } else {
      features.push('Conductores ilimitados');
    }
    
    if (plan.limite_vehiculos) {
      features.push(`${plan.limite_vehiculos} vehículos`);
    } else {
      features.push('Vehículos ilimitados');
    }
    
    if (plan.limite_socios) {
      features.push(`${plan.limite_socios} socios`);
    } else {
      features.push('Socios ilimitados');
    }
    
    if (plan.puede_generar_xml) features.push('Generación de XML');
    if (plan.puede_timbrar) features.push('Timbrado automático');
    if (plan.puede_cancelar_cfdi) features.push('Cancelación de CFDI');
    if (plan.puede_tracking) features.push('Tracking en tiempo real');
    
    return features;
  };

  const isPopular = plan.nombre === 'Profesional';

  const getButtonText = () => {
    if (isCurrentPlan) return 'Plan Actual';
    if (plan.precio_mensual === 0) return 'Seleccionar Gratis';
    return 'Suscribirse';
  };

  return (
    <Card className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} ${isPopular ? 'border-orange-200' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500">
          <Star className="w-3 h-3 mr-1" />
          Más Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-blue-500">
          Plan Actual
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.nombre}</CardTitle>
        <CardDescription>{plan.descripcion}</CardDescription>
        
        <div className="mt-4">
          <div className="text-3xl font-bold">
            {formatPrice(plan.precio_mensual)}
            <span className="text-sm font-normal text-gray-500">/mes</span>
          </div>
          
          {plan.precio_anual && (
            <div className="text-lg text-green-600 mt-1">
              {formatPrice(plan.precio_anual)}/año
              <span className="text-sm"> (ahorras {Math.round((1 - (plan.precio_anual / (plan.precio_mensual * 12))) * 100)}%)</span>
            </div>
          )}
        </div>

        {plan.dias_prueba > 0 && !isCurrentPlan && (
          <div className="text-sm text-blue-600 mt-2">
            Prueba gratis por {plan.dias_prueba} días
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-2 mb-6">
          {getFeatures().map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Button 
          onClick={() => onSelectPlan(plan.id)}
          disabled={isCurrentPlan || isChanging}
          className="w-full"
          variant={isCurrentPlan ? 'outline' : 'default'}
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};
