import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function CreditosUsageAlert() {
  const { data: alertData } = useQuery({
    queryKey: ['creditos-usage-alert'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Obtener balance actual
      const { data: creditosData } = await supabase
        .from('creditos_usuarios')
        .select('timbres_mes_actual')
        .eq('user_id', user.id)
        .single();

      // Obtener límite del plan
      const { data: suscripcion } = await supabase
        .from('suscripciones')
        .select(`
          plan_id,
          planes_suscripcion (
            timbres_mensuales
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'trial'])
        .single();

      // Si no hay plan o el límite es 0 o null, no mostrar alerta
      const limite = suscripcion?.planes_suscripcion?.timbres_mensuales;
      if (!creditosData || !limite || limite <= 0) {
        return null;
      }

      const timbres = creditosData.timbres_mes_actual ?? limite;
      const porcentajeUsado = ((limite - timbres) / limite) * 100;

      return {
        timbres,
        limite,
        porcentajeUsado,
      };
    },
    refetchInterval: 30000,
  });

  if (!alertData) return null;

  const { timbres, limite, porcentajeUsado } = alertData;

  // Alerta roja: 100% de timbres agotados (timbres restantes = 0)
  if (timbres <= 0) {
    return (
      <Alert variant="destructive" className="mb-4 border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold">
          ¡Has agotado tus timbres mensuales!
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            Has usado los {limite} timbres de este mes. Para continuar timbrando cartas porte,
            necesitas hacer upgrade a un plan con más capacidad.
          </p>
          <Link to="/planes">
            <Button variant="default" className="bg-red-600 hover:bg-red-700">
              <Zap className="w-4 h-4 mr-2" />
              Ver Planes Disponibles
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta amarilla: 80% o más de timbres usados
  if (porcentajeUsado >= 80) {
    return (
      <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertTitle className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
          Estás cerca de agotar tus timbres
        </AlertTitle>
        <AlertDescription className="mt-2 text-yellow-800 dark:text-yellow-200">
          <p className="mb-3">
            Te quedan solo {timbres} de {limite} timbres este mes ({Math.round(100 - porcentajeUsado)}% disponible).
            Considera hacer upgrade para evitar interrupciones.
          </p>
          <Link to="/planes">
            <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-950">
              <Zap className="w-4 h-4 mr-2" />
              Ver Planes con Más Timbres
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
