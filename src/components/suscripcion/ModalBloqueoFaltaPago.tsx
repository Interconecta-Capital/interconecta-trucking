import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSuscripcion } from "@/hooks/useSuscripcion";
import { AlertTriangle, CreditCard, Clock } from "lucide-react";

export const ModalBloqueoFaltaPago = () => {
  const { bloqueo, suscripcion, suscripcionVencida } = useSuscripcion();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mostrar modal si está bloqueado o si la suscripción está vencida
    if (bloqueo?.activo || suscripcionVencida()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [bloqueo, suscripcionVencida]);

  const handlePayment = () => {
    // Redirigir a la página de pagos o abrir Stripe
    window.location.href = "/pagos";
  };

  const handleUpgradePlan = () => {
    // Redirigir a la página de planes
    window.location.href = "/planes";
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {bloqueo?.activo ? "Cuenta Bloqueada" : "Suscripción Vencida"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {bloqueo?.activo && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {bloqueo.mensaje_bloqueo ||
                  "Su cuenta ha sido bloqueada por falta de pago."}
              </AlertDescription>
            </Alert>
          )}

          {suscripcionVencida() && !bloqueo?.activo && (
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Su período de prueba ha expirado. Para continuar usando la
                plataforma, seleccione un plan de pago.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Qué puede hacer?</CardTitle>
              <CardDescription>
                Para continuar usando todas las funciones de la plataforma:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suscripcion?.status === "past_due" && (
                <Button onClick={handlePayment} className="w-full" size="lg">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Realizar Pago Pendiente
                </Button>
              )}

              <Button
                onClick={handleUpgradePlan}
                variant={
                  suscripcion?.status === "past_due" ? "outline" : "default"
                }
                className="w-full"
                size="lg"
              >
                Ver Planes y Precios
              </Button>

              <div className="text-sm text-gray-500 text-center">
                <p>Mientras tanto, solo puede acceder a:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Módulo de pagos y facturación</li>
                  <li>Configuración de cuenta</li>
                  <li>Soporte técnico</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
