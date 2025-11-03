import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Sparkles, TrendingUp, Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CompraCreditosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaqueteCreditos {
  id: string;
  nombre: string;
  cantidad_creditos: number;
  precio_mxn: number;
  descuento_porcentaje: number;
  precio_por_credito: number;
  descripcion: string;
  orden: number;
}

export function CompraCreditosModal({ isOpen, onClose }: CompraCreditosModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paquetes, isLoading } = useQuery({
    queryKey: ['paquetes-creditos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paquetes_creditos')
        .select('*')
        .eq('activo', true)
        .order('orden');
      
      if (error) throw error;
      return data as PaqueteCreditos[];
    },
    enabled: isOpen,
  });

  const comprarPaquete = async (paqueteId: string) => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Debes iniciar sesión para comprar créditos");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { paquete_id: paqueteId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('[CompraCreditosModal] Error:', error);
      toast.error("Error al procesar la compra. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaqueteIcon = (orden: number) => {
    switch (orden) {
      case 1: return <Ticket className="w-6 h-6" />;
      case 2: return <Sparkles className="w-6 h-6" />;
      case 3: return <TrendingUp className="w-6 h-6" />;
      case 4: return <Building2 className="w-6 h-6" />;
      default: return <Ticket className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Recarga tu Saldo de Timbres</DialogTitle>
          <DialogDescription>
            Selecciona un paquete de créditos. Los créditos no expiran y se consumen según tu uso.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {paquetes?.map((paquete, index) => (
              <Card 
                key={paquete.id} 
                className={`relative transition-all hover:shadow-lg ${
                  index === 2 ? 'border-primary shadow-md' : ''
                }`}
              >
                {index === 2 && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-primary">
                      {getPaqueteIcon(paquete.orden)}
                      <CardTitle className="text-xl">{paquete.nombre}</CardTitle>
                    </div>
                    {paquete.descuento_porcentaje > 0 && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                        Ahorra {paquete.descuento_porcentaje}%
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {paquete.descripcion}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-foreground">
                        ${paquete.precio_mxn.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">MXN</span>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-semibold text-primary">
                        {paquete.cantidad_creditos} Timbres
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${paquete.precio_por_credito.toFixed(2)} MXN por timbre
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    onClick={() => comprarPaquete(paquete.id)}
                    disabled={isProcessing}
                    className="w-full"
                    variant={index === 2 ? "default" : "outline"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Comprar Ahora
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            ¿Por qué comprar créditos?
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✅ Los créditos nunca expiran</li>
            <li>✅ Paga solo por lo que uses</li>
            <li>✅ Ahorra más comprando paquetes grandes</li>
            <li>✅ Recarga tu saldo cuando lo necesites</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
