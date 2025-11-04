import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, TrendingUp } from "lucide-react";
import { CompraCreditosModal } from "./CompraCreditosModal";
import { useSuperuser } from "@/hooks/useSuperuser";
import { Link } from "react-router-dom";

export function CreditosBalance() {
  const [showCompraModal, setShowCompraModal] = useState(false);
  const { isSuperuser } = useSuperuser();

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['creditos-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { timbres: 0, limite: 0, fechaRenovacion: null };

      // Obtener timbres mensuales actuales y límite del plan
      const { data: creditosData, error: creditosError } = await supabase
        .from('creditos_usuarios')
        .select('timbres_mes_actual, fecha_renovacion')
        .eq('user_id', user.id)
        .single();

      if (creditosError) {
        console.error('[CreditosBalance] Error fetching balance:', creditosError);
        return { timbres: 0, limite: 0, fechaRenovacion: null };
      }

      // Obtener límite del plan actual
      const { data: suscripcion, error: subsError } = await supabase
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

      if (subsError) {
        console.error('[CreditosBalance] Error fetching subscription:', subsError);
      }
      
      return { 
        timbres: creditosData?.timbres_mes_actual || 0,
        limite: suscripcion?.planes_suscripcion?.timbres_mensuales || 0,
        fechaRenovacion: creditosData?.fecha_renovacion
      };
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-2 rounded-lg animate-pulse">
        <Ticket className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  const { timbres, limite, fechaRenovacion } = balanceData || { timbres: 0, limite: 0, fechaRenovacion: null };
  const porcentajeUsado = limite > 0 ? ((limite - timbres) / limite) * 100 : 0;
  const fechaRenovacionTexto = fechaRenovacion 
    ? new Date(fechaRenovacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    : 'próximo mes';

  // Para superusuarios, mostrar link al dashboard completo
  if (isSuperuser) {
    return (
      <Link to="/admin/timbres">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Dashboard Admin</span>
            <span className="text-sm font-semibold text-foreground">Ver Métricas</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-lg border border-primary/20">
        <Ticket className="w-5 h-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">
            {timbres}/{limite}
          </span>
          <span className="text-xs text-muted-foreground">
            Se renuevan el {fechaRenovacionTexto}
          </span>
        </div>
        
        {/* Indicador visual de uso */}
        {limite > 0 && (
          <div className="ml-2 flex flex-col gap-1">
            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  porcentajeUsado > 80 ? 'bg-destructive' : 
                  porcentajeUsado > 50 ? 'bg-yellow-500' : 
                  'bg-primary'
                }`}
                style={{ width: `${porcentajeUsado}%` }}
              />
            </div>
            {porcentajeUsado > 80 && (
              <Link to="/planes">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
