import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Ticket, Plus } from "lucide-react";
import { CompraCreditosModal } from "./CompraCreditosModal";

export function CreditosBalance() {
  const [showCompraModal, setShowCompraModal] = useState(false);

  const { data: balance, isLoading } = useQuery({
    queryKey: ['creditos-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('creditos_usuarios')
        .select('balance_disponible')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[CreditosBalance] Error fetching balance:', error);
        return 0;
      }
      
      return data?.balance_disponible || 0;
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

  return (
    <>
      <div className="flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-lg border border-primary/20">
        <Ticket className="w-5 h-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground">{balance}</span>
          <span className="text-xs text-muted-foreground">timbres</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => setShowCompraModal(true)}
          className="ml-2"
          variant="default"
        >
          <Plus className="w-4 h-4 mr-1" />
          Recargar
        </Button>
      </div>

      <CompraCreditosModal 
        isOpen={showCompraModal}
        onClose={() => setShowCompraModal(false)}
      />
    </>
  );
}
