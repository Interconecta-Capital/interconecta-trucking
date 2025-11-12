import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Concepto {
  id: string;
  clave_prod_serv: string;
  cantidad: number;
  clave_unidad: string;
  descripcion: string;
  valor_unitario: number;
  importe: number;
}

export default function FacturaEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const [tipoComprobante, setTipoComprobante] = useState<'I' | 'E' | 'T'>('I');
  const [rfcReceptor, setRfcReceptor] = useState('');
  const [nombreReceptor, setNombreReceptor] = useState('');
  const [usoCFDI, setUsoCFDI] = useState('G03');
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [cartaPorteVinculada, setCartaPorteVinculada] = useState<string | null>(null);

  const [rfcEmisor, setRfcEmisor] = useState('');
  const [nombreEmisor, setNombreEmisor] = useState('');

  useEffect(() => {
    cargarConfiguracionEmpresa();
    if (id) {
      cargarFactura(id);
    }
  }, [id]);

  const cargarConfiguracionEmpresa = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: config } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (config) {
      setRfcEmisor(config.rfc_emisor);
      setNombreEmisor(config.razon_social);
    }
  };

  const cargarFactura = async (facturaId: string) => {
    // Implementar carga de factura existente
  };

  const agregarConcepto = () => {
    const nuevoConcepto: Concepto = {
      id: Date.now().toString(),
      clave_prod_serv: '84111506',
      cantidad: 1,
      clave_unidad: 'E48',
      descripcion: '',
      valor_unitario: 0,
      importe: 0
    };
    setConceptos([...conceptos, nuevoConcepto]);
  };

  const eliminarConcepto = (id: string) => {
    setConceptos(conceptos.filter(c => c.id !== id));
  };

  const actualizarConcepto = (id: string, campo: keyof Concepto, valor: any) => {
    setConceptos(conceptos.map(c => {
      if (c.id === id) {
        const updated = { ...c, [campo]: valor };
        if (campo === 'cantidad' || campo === 'valor_unitario') {
          updated.importe = updated.cantidad * updated.valor_unitario;
        }
        return updated;
      }
      return c;
    }));
  };

  const calcularTotales = () => {
    const subtotal = conceptos.reduce((sum, c) => sum + c.importe, 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const guardarBorrador = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No autenticado');

      const totales = calcularTotales();

      // TODO: Descomentar después de ejecutar las migraciones SQL
      toast.info('Tabla facturas aún no creada. Ejecuta las migraciones SQL primero.');
      
      /* DESCOMENTAR DESPUÉS DE EJECUTAR MIGRACIONES:
      const { error } = await supabase.from('facturas').insert({
        user_id: user.user.id,
        tipo_comprobante: tipoComprobante,
        rfc_emisor: rfcEmisor,
        nombre_emisor: nombreEmisor,
        rfc_receptor: rfcReceptor,
        nombre_receptor: nombreReceptor,
        subtotal: totales.subtotal,
        total: totales.total,
        status: 'draft',
        tiene_carta_porte: !!cartaPorteVinculada,
        carta_porte_id: cartaPorteVinculada,
        fecha_expedicion: new Date().toISOString()
      });

      if (error) throw error;

      toast.success('Factura guardada como borrador');
      navigate('/administracion/fiscal');
      */
    } catch (error) {
      console.error('Error guardando factura:', error);
      toast.error('Error al guardar factura');
    } finally {
      setLoading(false);
    }
  };

  const timbrarFactura = async () => {
    toast.info('Función de timbrado pendiente de implementación');
  };

  const totales = calcularTotales();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {id ? 'Editar Factura' : 'Nueva Factura'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={guardarBorrador} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button onClick={timbrarFactura} disabled={loading || conceptos.length === 0}>
            <Send className="h-4 w-4 mr-2" />
            Timbrar Factura
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Datos Generales</TabsTrigger>
          <TabsTrigger value="conceptos">Conceptos</TabsTrigger>
          <TabsTrigger value="complementos">Complementos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Comprobante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Comprobante</Label>
                  <Select value={tipoComprobante} onValueChange={(v) => setTipoComprobante(v as 'I' | 'E' | 'T')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Ingreso</SelectItem>
                      <SelectItem value="E">Egreso</SelectItem>
                      <SelectItem value="T">Traslado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Uso CFDI</Label>
                  <Select value={usoCFDI} onValueChange={setUsoCFDI}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="G03">Gastos en general</SelectItem>
                      <SelectItem value="G01">Adquisición de mercancías</SelectItem>
                      <SelectItem value="S01">Sin efectos fiscales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emisor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RFC Emisor</Label>
                  <Input value={rfcEmisor} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Nombre / Razón Social</Label>
                  <Input value={nombreEmisor} readOnly className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receptor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RFC Receptor</Label>
                  <Input 
                    value={rfcReceptor} 
                    onChange={(e) => setRfcReceptor(e.target.value.toUpperCase())}
                    placeholder="XAXX010101000"
                  />
                </div>
                <div>
                  <Label>Nombre / Razón Social</Label>
                  <Input 
                    value={nombreReceptor} 
                    onChange={(e) => setNombreReceptor(e.target.value)}
                    placeholder="Nombre del cliente"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conceptos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conceptos</CardTitle>
              <Button size="sm" onClick={agregarConcepto}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Concepto
              </Button>
            </CardHeader>
            <CardContent>
              {conceptos.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay conceptos. Agrega al menos uno para continuar.
                </p>
              ) : (
                <div className="space-y-4">
                  {conceptos.map((concepto) => (
                    <Card key={concepto.id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-span-2">
                            <Label className="text-xs">Descripción</Label>
                            <Input
                              value={concepto.descripcion}
                              onChange={(e) => actualizarConcepto(concepto.id, 'descripcion', e.target.value)}
                              placeholder="Descripción del servicio/producto"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cantidad</Label>
                            <Input
                              type="number"
                              value={concepto.cantidad}
                              onChange={(e) => actualizarConcepto(concepto.id, 'cantidad', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Valor Unitario</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={concepto.valor_unitario}
                              onChange={(e) => actualizarConcepto(concepto.id, 'valor_unitario', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Importe</Label>
                            <Input
                              value={concepto.importe.toFixed(2)}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarConcepto(concepto.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {conceptos.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-end gap-4">
                      <span className="font-medium">Subtotal:</span>
                      <span>${totales.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-4">
                      <span className="font-medium">IVA (16%):</span>
                      <span>${totales.iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-4 text-lg font-bold">
                      <span>Total:</span>
                      <span>${totales.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complementos">
          <Card>
            <CardHeader>
              <CardTitle>Complemento Carta Porte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vincula una Carta Porte existente a esta factura (opcional)
              </p>
              <Button variant="outline">
                Seleccionar Carta Porte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
