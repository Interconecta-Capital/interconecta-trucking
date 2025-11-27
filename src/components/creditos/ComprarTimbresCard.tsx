import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ticket, Sparkles, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaqueteCreditos {
  id: string;
  nombre: string;
  cantidad_creditos: number;
  precio_mxn: number;
  precio_por_credito: number;
  descuento_porcentaje: number;
  descripcion: string | null;
  activo: boolean;
  orden: number;
}

export function ComprarTimbresCard() {
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  // Obtener paquetes de créditos disponibles
  const { data: paquetes, isLoading: isLoadingPaquetes } = useQuery({
    queryKey: ['paquetes-creditos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paquetes_creditos')
        .select('*')
        .eq('activo', true)
        .order('orden');
      
      if (error) throw error;
      return data as PaqueteCreditos[];
    }
  });

  const handleComprar = async (paqueteId: string) => {
    setIsLoading(paqueteId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { paquete_id: paqueteId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (error: any) {
      console.error('Error al crear checkout:', error);
      toast.error(error.message || 'Error al procesar la compra');
    } finally {
      setIsLoading(null);
    }
  };

  if (isLoadingPaquetes) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Comprar Timbres Adicionales
        </CardTitle>
        <CardDescription>
          Timbres prepagados que se consumen primero. Los timbres comprados no expiran y se acumulan a tu balance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paquetes?.map((paquete, index) => (
            <Card 
              key={paquete.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                index === 2 ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
            >
              {index === 2 && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Popular
                </div>
              )}
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <div className="text-3xl font-bold">{paquete.cantidad_creditos}</div>
                  <div className="text-sm text-muted-foreground">timbres</div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    ${paquete.precio_mxn.toLocaleString('es-MX')} MXN
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${paquete.precio_por_credito.toFixed(2)} por timbre
                  </div>
                </div>

                {paquete.descuento_porcentaje > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ahorra {paquete.descuento_porcentaje}%
                  </Badge>
                )}

                <ul className="text-xs text-left space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    No expiran
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Se usan primero
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Pago único
                  </li>
                </ul>

                <Button 
                  className="w-full"
                  onClick={() => handleComprar(paquete.id)}
                  disabled={isLoading === paquete.id}
                >
                  {isLoading === paquete.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    'Comprar'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">¿Cómo funcionan los timbres?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ¿Te quedaste sin timbres? <strong>Aquiere</strong> timbres adicionales a tu plan mensual</li>
            <li>• Los timbres de tu plan se renuevan automáticamente cada mes</li>
            <li>• Pago seguro procesado por Stripe</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
