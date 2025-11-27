import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function CreditosUsageAlert() {
  const [dismissed, setDismissed] = useState(false);

  const { data: alertData } = useQuery({
    queryKey: ['creditos-usage-alert'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Obtener balance actual
      const { data: creditosData } = await supabase
        .from('creditos_usuarios')
        .select('timbres_mes_actual, balance_disponible')
        .eq('user_id', user.id)
        .single();

      // Obtener límite del plan
      const { data: suscripcion } = await supabase
        .from('suscripciones')
        .select(`
          plan_id,
          planes_suscripcion (
            timbres_mensuales,
            nombre
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'trial'])
        .single();

      // Verificar si hay consumos REALES este mes
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: consumosReales } = await supabase
        .from('transacciones_creditos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('tipo', 'consumo')
        .gte('created_at', inicioMes);

      // Si no hay plan o el límite es 0 o null, no mostrar alerta
      const limite = suscripcion?.planes_suscripcion?.timbres_mensuales;
      const planNombre = suscripcion?.planes_suscripcion?.nombre || 'Plan Gratuito';
      
      if (!creditosData || !limite || limite <= 0) {
        return null;
      }

      const timbres = creditosData.timbres_mes_actual ?? limite;
      const balancePrepago = creditosData.balance_disponible ?? 0;
      const porcentajeUsado = ((limite - timbres) / limite) * 100;
      const tieneConsumosReales = (consumosReales || 0) > 0;

      return {
        timbres,
        limite,
        porcentajeUsado,
        balancePrepago,
        tieneConsumosReales,
        planNombre
      };
    },
    refetchInterval: 60000, // Cada minuto en lugar de cada 30s
  });

  if (!alertData || dismissed) return null;

  const { timbres, limite, porcentajeUsado, balancePrepago, tieneConsumosReales } = alertData;

  // Alerta roja SOLO si:
  // 1. timbres <= 0
  // 2. Y hay consumos reales este mes (no es solo que nunca ha usado)
  // 3. Y no tiene balance prepago
  if (timbres <= 0 && tieneConsumosReales && balancePrepago <= 0) {
    return (
      <div className="mb-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-sm text-destructive flex-1">
          Has agotado tus {limite} timbres mensuales.
        </span>
        <Link 
          to="/planes" 
          className="text-sm font-medium text-destructive hover:underline flex items-center gap-1"
        >
          <Zap className="h-3 w-3" />
          Ver planes
        </Link>
        <button 
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-destructive/20 rounded"
        >
          <X className="h-3 w-3 text-destructive" />
        </button>
      </div>
    );
  }

  // Alerta amarilla discreta: 80% o más de timbres usados
  if (porcentajeUsado >= 80 && tieneConsumosReales) {
    return (
      <div className="mb-4 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span className="text-sm text-amber-700 dark:text-amber-400 flex-1">
          Te quedan {timbres} de {limite} timbres ({Math.round(100 - porcentajeUsado)}% disponible)
        </span>
        <Link 
          to="/planes" 
          className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
        >
          Upgrade
        </Link>
        <button 
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-500/20 rounded"
        >
          <X className="h-3 w-3 text-amber-600" />
        </button>
      </div>
    );
  }

  return null;
}
