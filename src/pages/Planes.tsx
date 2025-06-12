
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { PlanesCard } from '@/components/suscripcion/PlanesCard';
import { EstadoSuscripcion } from '@/components/suscripcion/EstadoSuscripcion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Planes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    planes, 
    suscripcion, 
    cambiarPlan, 
    isChangingPlan, 
    verificarSuscripcion 
  } = useSuscripcion();

  // Verificar estado después de un pago exitoso
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "¡Pago exitoso!",
        description: "Su suscripción ha sido activada correctamente.",
      });
      // Verificar el estado de la suscripción
      setTimeout(() => {
        verificarSuscripcion();
      }, 2000);
    } else if (canceled === 'true') {
      toast({
        title: "Pago cancelado",
        description: "El proceso de pago fue cancelado.",
        variant: "destructive",
      });
    }
    
    // Limpiar parámetros de la URL
    if (success || canceled) {
      navigate('/planes', { replace: true });
    }
  }, [searchParams, toast, verificarSuscripcion, navigate]);

  const handleSelectPlan = (planId: string) => {
    cambiarPlan(planId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Planes y Precios
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Elige el plan que mejor se adapte a las necesidades de tu empresa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Estado de suscripción actual */}
          <div className="lg:col-span-1">
            <EstadoSuscripcion />
          </div>

          {/* Planes disponibles */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planes.map((plan) => (
                <PlanesCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={suscripcion?.plan_id === plan.id}
                  onSelectPlan={handleSelectPlan}
                  isChanging={isChangingPlan}
                />
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>¿Necesitas algo más personalizado?</CardTitle>
                <CardDescription>
                  Contáctanos para planes empresariales con características específicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">
                  Contactar Ventas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
