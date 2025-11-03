import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, TrendingUp, Clock, ShoppingCart } from "lucide-react";
import { CompraCreditosModal } from "@/components/creditos/CompraCreditosModal";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Creditos() {
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [searchParams] = useSearchParams();

  // Mostrar mensajes de éxito/cancelación
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("¡Compra exitosa! Tus créditos han sido acreditados.");
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info("Compra cancelada. Puedes intentarlo de nuevo cuando quieras.");
    }
  }, [searchParams]);

  const { data: creditosData } = useQuery({
    queryKey: ['creditos-usuario'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('creditos_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) console.error('[Creditos] Error:', error);
      return data;
    },
  });

  const { data: transacciones } = useQuery({
    queryKey: ['transacciones-creditos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('transacciones_creditos')
        .select('*, paquetes_creditos(nombre)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) console.error('[Creditos] Error:', error);
      return data || [];
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis Créditos</h1>
          <p className="text-muted-foreground">
            Gestiona tu saldo de timbres y revisa tu historial
          </p>
        </div>
        <Button onClick={() => setShowCompraModal(true)} size="lg">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Comprar Créditos
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Disponible</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {creditosData?.balance_disponible || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              timbres disponibles para usar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comprados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {creditosData?.total_comprados || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              créditos adquiridos históricamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumidos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {creditosData?.total_consumidos || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              timbres utilizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription>
            Últimas 10 transacciones de créditos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transacciones && transacciones.length > 0 ? (
            <div className="space-y-4">
              {transacciones.map((transaccion: any) => (
                <div 
                  key={transaccion.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        transaccion.tipo === 'compra' ? 'default' :
                        transaccion.tipo === 'regalo' ? 'secondary' :
                        'destructive'
                      }>
                        {transaccion.tipo}
                      </Badge>
                      {transaccion.paquetes_creditos?.nombre && (
                        <span className="text-sm text-muted-foreground">
                          {transaccion.paquetes_creditos.nombre}
                        </span>
                      )}
                    </div>
                    {transaccion.notas && (
                      <p className="text-sm text-muted-foreground">
                        {transaccion.notas}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaccion.created_at).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaccion.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaccion.cantidad > 0 ? '+' : ''}{transaccion.cantidad}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {transaccion.balance_nuevo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay transacciones aún</p>
              <Button 
                onClick={() => setShowCompraModal(true)}
                variant="link"
                className="mt-2"
              >
                Compra tu primer paquete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CompraCreditosModal 
        isOpen={showCompraModal}
        onClose={() => setShowCompraModal(false)}
      />
    </div>
  );
}
