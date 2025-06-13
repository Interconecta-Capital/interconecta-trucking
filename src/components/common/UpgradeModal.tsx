
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, X, TrendingUp } from 'lucide-react';
import { useSuscripcion } from '@/hooks/useSuscripcion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  blockedAction?: string;
}

const planes = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: 299,
    descripcion: 'Perfecto para pequeñas empresas',
    icon: Star,
    caracteristicas: [
      'Hasta 50 cartas porte por mes',
      'Gestión básica de vehículos',
      'Soporte por email',
      'Reportes básicos'
    ]
  },
  {
    id: 'profesional',
    nombre: 'Profesional',
    precio: 599,
    descripcion: 'Para empresas en crecimiento',
    icon: Zap,
    caracteristicas: [
      'Hasta 200 cartas porte por mes',
      'Gestión completa de flota',
      'Soporte prioritario',
      'Reportes avanzados',
      'Integraciones API'
    ],
    popular: true
  },
  {
    id: 'empresarial',
    nombre: 'Empresarial',
    precio: 999,
    descripcion: 'Para grandes operaciones',
    icon: Crown,
    caracteristicas: [
      'Cartas porte ilimitadas',
      'Gestión completa de operaciones',
      'Soporte 24/7',
      'Reportes personalizados',
      'Integraciones avanzadas',
      'Gerente de cuenta dedicado'
    ]
  }
];

export const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  title = "Actualiza tu Plan",
  description = "Tu período de prueba ha expirado. Selecciona un plan para continuar usando la plataforma.",
  blockedAction
}: UpgradeModalProps) => {
  const { crearCheckout, isCreatingCheckout } = useSuscripcion();

  const handleSelectPlan = async (planId: string) => {
    try {
      await crearCheckout(planId);
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
    }
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
          {planes.map((plan) => {
            const Icon = plan.icon;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Más Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                    plan.popular ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                  <CardDescription>{plan.descripcion}</CardDescription>
                  <div className="text-3xl font-bold">
                    ${plan.precio}
                    <span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
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
