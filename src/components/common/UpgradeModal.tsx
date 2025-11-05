
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, X, TrendingUp, Ticket } from 'lucide-react';
import { useSuscripcion } from '@/hooks/useSuscripcion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  blockedAction?: string;
}

// Planes ahora se obtienen dinámicamente desde Supabase

export const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  title = "Actualiza tu Plan",
  description = "Tu período de prueba ha expirado. Selecciona un plan para continuar usando la plataforma.",
  blockedAction
}: UpgradeModalProps) => {
  const { planes, crearCheckout, isCreatingCheckout } = useSuscripcion();

  const handleSelectPlan = async (planId: string) => {
    try {
      await crearCheckout(planId);
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
    }
  };

  const getIconForPlan = (planName: string) => {
    if (planName.toLowerCase().includes('operador')) return Star;
    if (planName.toLowerCase().includes('flota')) return Zap;
    if (planName.toLowerCase().includes('business') || planName.toLowerCase().includes('empresarial')) return Crown;
    return Star;
  };

  const getFeatures = (plan: any) => {
    const features = [];
    if (plan.timbres_mensuales) features.push(`${plan.timbres_mensuales} timbres mensuales renovables`);
    if (plan.limite_conductores) features.push(`Hasta ${plan.limite_conductores} conductores`);
    if (plan.limite_vehiculos) features.push(`Hasta ${plan.limite_vehiculos} vehículos`);
    if (plan.puede_timbrar) features.push('Timbrado automático');
    if (plan.puede_tracking) features.push('Tracking en tiempo real');
    return features;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                {title}
              </DialogTitle>
              <p className="text-muted-foreground mt-2">{description}</p>
              {blockedAction && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Acción bloqueada:</strong> {blockedAction}
                  </p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {planes.filter(p => p.precio_mensual > 0).map((plan) => {
            const Icon = getIconForPlan(plan.nombre);
            const features = getFeatures(plan);
            const isPopular = plan.nombre === 'Flota';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-blue-500 border-2' : ''}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Más Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                    isPopular ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                  <CardDescription>{plan.descripcion}</CardDescription>
                  
                  {plan.timbres_mensuales && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-950/20 py-2 px-3 rounded-lg">
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm font-semibold">{plan.timbres_mensuales} timbres/mes</span>
                    </div>
                  )}
                  
                  <div className="text-3xl font-bold mt-3">
                    ${plan.precio_mensual}
                    <span className="text-sm font-normal text-muted-foreground"> MXN/mes</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                    disabled={isCreatingCheckout}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCreatingCheckout ? 'Procesando...' : `Seleccionar ${plan.nombre}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Necesitas algo personalizado?{' '}
            <Button variant="link" className="p-0 h-auto">
              Contactar Ventas
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
