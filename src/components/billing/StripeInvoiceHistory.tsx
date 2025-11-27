import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ExternalLink, FileText, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function StripeInvoiceHistory() {
  const { suscripcion, abrirPortalCliente, isOpeningPortal } = useSuscripcion();
  const [isLoadingPortal, setIsLoadingPortal] = React.useState(false);

  // Obtener historial de transacciones de créditos
  const { data: transacciones, isLoading } = useQuery({
    queryKey: ['transacciones-creditos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacciones_creditos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const handlePortalAccess = async () => {
    setIsLoadingPortal(true);
    try {
      await abrirPortalCliente();
    } catch (error: any) {
      toast.error('Error al abrir el portal de facturación');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const getStatusBadge = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return <Badge className="bg-green-100 text-green-800">Compra</Badge>;
      case 'consumo':
        return <Badge variant="secondary">Consumo</Badge>;
      case 'suscripcion':
        return <Badge className="bg-blue-100 text-blue-800">Suscripción</Badge>;
      case 'renovacion':
        return <Badge className="bg-purple-100 text-purple-800">Renovación</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  // Obtener estado y fechas de la suscripción de forma segura
  const suscripcionEstado = suscripcion?.status;
  const fechaFinPeriodo = suscripcion?.fecha_fin_prueba;

  const isActive = suscripcionEstado === 'active';
  const isTrial = suscripcionEstado === 'trial';
  const isInactive = !isActive && !isTrial;

  return (
    <div className="space-y-6">
      {/* Información de suscripción actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Tu Suscripción
          </CardTitle>
          <CardDescription>
            Gestiona tu suscripción y métodos de pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suscripcion ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Plan Actual</div>
                <div className="font-semibold">{suscripcion.plan?.nombre || 'Sin plan'}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Estado</div>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">Activa</span>
                    </>
                  ) : isTrial ? (
                    <>
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold text-amber-600">En prueba</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-600">Inactiva</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Fecha fin período</div>
                <div className="font-semibold">
                  {fechaFinPeriodo ? 
                    format(new Date(fechaFinPeriodo), 'dd MMM yyyy', { locale: es }) :
                    'N/A'
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No tienes una suscripción activa
            </div>
          )}

          <Button 
            onClick={handlePortalAccess}
            disabled={isLoadingPortal || isOpeningPortal}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isLoadingPortal ? 'Abriendo...' : 'Gestionar en Stripe'}
          </Button>
        </CardContent>
      </Card>

      {/* Historial de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
          <CardDescription>
            Registro de compras de timbres y consumos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transacciones && transacciones.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Timbres</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacciones.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.tipo)}
                      </TableCell>
                      <TableCell>
                        {tx.notas || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={tx.tipo === 'consumo' ? 'text-red-600' : 'text-green-600'}>
                          {tx.tipo === 'consumo' ? '-' : '+'}{tx.cantidad}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin transacciones</h3>
              <p className="text-muted-foreground">
                Las transacciones de timbres aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
