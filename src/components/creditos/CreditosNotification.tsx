import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

const NOTIFICATION_KEY = 'creditos_notification_dismissed';
const NOTIFICATION_VERSION = '1.0'; // Cambiar para mostrar de nuevo

export function CreditosNotification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(NOTIFICATION_KEY);
    if (dismissed !== NOTIFICATION_VERSION) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(NOTIFICATION_KEY, NOTIFICATION_VERSION);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Alert className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <AlertTitle className="text-lg font-semibold">
              ¡Nuevo Modelo de Precios!
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Hemos mejorado nuestro sistema para que pagues <strong>solo por lo que uses</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Ahora los timbres se compran por separado del plan de software. 
                Esto te da mayor flexibilidad y control sobre tus gastos.
              </p>
              <div className="flex gap-2 mt-3">
                <Button asChild size="sm" variant="default">
                  <Link to="/planes">Ver Planes</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/creditos">Comprar Créditos</Link>
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
