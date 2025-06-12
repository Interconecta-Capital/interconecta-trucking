
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useTrialTracking } from '@/hooks/useTrialTracking';

export default function Planes() {
  const { suscripcion, crearCheckout, abrirPortalCliente, isCreatingCheckout } = useSuscripcion();
  const { trialInfo, loading: trialLoading } = useTrialTracking();

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

  const handleSelectPlan = async (planId: string) => {
    try {
      crearCheckout(planId);
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
    }
  };

  const handleManageSubscription = () => {
    abrirPortalCliente();
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">Planes y Suscripciones</h1>
        <p className="text-muted-foreground text-lg">
          Elige el plan que mejor se adapte a tu negocio
        </p>
      </div>

      {/* Estado actual */}
      {suscripcion && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Plan Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{suscripcion.plan?.nombre}</p>
                <p className="text-muted-foreground">
                  Estado: <Badge variant={suscripcion.status === 'active' ? 'default' : 'secondary'}>
                    {suscripcion.status}
                  </Badge>
                </p>
                {suscripcion.fecha_vencimiento && (
                  <p className="text-sm text-muted-foreground">
                    Vence: {new Date(suscripcion.fecha_vencimiento).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={handleManageSubscription}>
                Gestionar Suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de prueba */}
      {!trialLoading && trialInfo.isTrialActive && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Período de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {trialInfo.daysRemaining} días restantes de tu prueba gratuita
                </p>
                <p className="text-muted-foreground">
                  Has usado {trialInfo.daysUsed} de {trialInfo.totalTrialDays} días
                </p>
              </div>
              <div className="text-right">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${(trialInfo.daysUsed / trialInfo.totalTrialDays) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = suscripcion?.plan?.nombre?.toLowerCase() === plan.nombre.toLowerCase();
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''} ${isCurrentPlan ? 'bg-blue-50' : ''}`}
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
                  disabled={isCreatingCheckout || isCurrentPlan}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan ? 'Plan Actual' : `Seleccionar ${plan.nombre}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas algo personalizado?</CardTitle>
          <CardDescription>
            Contáctanos para planes empresariales personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            Contactar Ventas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
