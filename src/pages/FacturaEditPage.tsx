import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function FacturaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formaPago, setFormaPago] = useState('01');
  const [metodoPago, setMetodoPago] = useState('PUE');
  const [moneda, setMoneda] = useState('MXN');
  const [usoCfdi, setUsoCfdi] = useState('G03');

  const { data: factura, isLoading } = useQuery({
    queryKey: ['factura-editar', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Cargar datos en el formulario cuando se cargue la factura
  useEffect(() => {
    if (factura) {
      setFormaPago((factura as any).forma_pago || '01');
      setMetodoPago((factura as any).metodo_pago || 'PUE');
      setMoneda(factura.moneda || 'MXN');
      setUsoCfdi(factura.uso_cfdi || 'G03');
    }
  }, [factura]);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('facturas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factura-editar', id] });
      queryClient.invalidateQueries({ queryKey: ['factura-detalle', id] });
      toast.success('✅ Factura actualizada correctamente');
      navigate(`/factura/${id}`);
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar factura: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      forma_pago: formaPago,
      metodo_pago: metodoPago,
      moneda: moneda,
      uso_cfdi: usoCfdi,
      updated_at: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cargando...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Factura no encontrada</h1>
          </div>
        </div>
      </div>
    );
  }

  if (factura.status === 'timbrada') {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">No se puede editar</h1>
            <p className="text-muted-foreground">Esta factura ya está timbrada y no puede ser modificada</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/factura/${id}`)}>Ver Detalles</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Factura</h1>
          <p className="text-muted-foreground mt-1">
            Folio: {factura.folio || factura.id.substring(0, 8)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* RFC Emisor (solo lectura) */}
              <div className="space-y-2">
                <Label>RFC Emisor</Label>
                <Input value={factura.rfc_emisor || ''} disabled />
              </div>

              {/* RFC Receptor (solo lectura) */}
              <div className="space-y-2">
                <Label>RFC Receptor</Label>
                <Input value={factura.rfc_receptor || ''} disabled />
              </div>

              {/* Total (solo lectura) */}
              <div className="space-y-2">
                <Label>Total</Label>
                <Input 
                  value={`$${parseFloat(String(factura.total || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
                  disabled 
                />
              </div>

              {/* Moneda */}
              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda *</Label>
                <Select value={moneda} onValueChange={setMoneda}>
                  <SelectTrigger id="moneda">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                    <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Forma de Pago */}
              <div className="space-y-2">
                <Label htmlFor="forma-pago">Forma de Pago *</Label>
                <Select value={formaPago} onValueChange={setFormaPago}>
                  <SelectTrigger id="forma-pago">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">01 - Efectivo</SelectItem>
                    <SelectItem value="02">02 - Cheque nominativo</SelectItem>
                    <SelectItem value="03">03 - Transferencia electrónica</SelectItem>
                    <SelectItem value="04">04 - Tarjeta de crédito</SelectItem>
                    <SelectItem value="28">28 - Tarjeta de débito</SelectItem>
                    <SelectItem value="99">99 - Por definir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label htmlFor="metodo-pago">Método de Pago *</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger id="metodo-pago">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
                    <SelectItem value="PPD">PPD - Pago en parcialidades o diferido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Uso CFDI */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="uso-cfdi">Uso CFDI *</Label>
                <Select value={usoCfdi} onValueChange={setUsoCfdi}>
                  <SelectTrigger id="uso-cfdi">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                    <SelectItem value="G02">G02 - Devoluciones, descuentos o bonificaciones</SelectItem>
                    <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                    <SelectItem value="I01">I01 - Construcciones</SelectItem>
                    <SelectItem value="I02">I02 - Mobiliario y equipo de oficina</SelectItem>
                    <SelectItem value="I03">I03 - Equipo de transporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
