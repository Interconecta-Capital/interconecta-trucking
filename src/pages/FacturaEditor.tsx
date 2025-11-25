import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAmbienteTimbrado } from '@/hooks/useAmbienteTimbrado';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SATValidationService } from '@/services/validacion/SATValidationService';

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
  const { ambiente } = useAmbienteTimbrado();
  const [loading, setLoading] = useState(false);

  const [tipoComprobante, setTipoComprobante] = useState<'I' | 'E' | 'T'>('I');
  const [rfcReceptor, setRfcReceptor] = useState('');
  const [nombreReceptor, setNombreReceptor] = useState('');
  const [usoCFDI, setUsoCFDI] = useState('G03');
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [cartaPorteVinculada, setCartaPorteVinculada] = useState<string | null>(null);
  
  const [validandoRFC, setValidandoRFC] = useState(false);
  const [rfcValidado, setRfcValidado] = useState<boolean | null>(null);
  const [cartasPorteDisponibles, setCartasPorteDisponibles] = useState<any[]>([]);
  const [mostrarSelectorCP, setMostrarSelectorCP] = useState(false);

  const [rfcEmisor, setRfcEmisor] = useState('');
  const [nombreEmisor, setNombreEmisor] = useState('');

  useEffect(() => {
    cargarConfiguracionEmpresa();
    cargarCartasPorteDisponibles();
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

  const validarRFCReceptor = async () => {
    if (!rfcReceptor || rfcReceptor.length < 12) {
      toast.error('Ingresa un RFC válido antes de validar');
      return;
    }

    setValidandoRFC(true);
    try {
      const resultado = await SATValidationService.validarRFCEnSAT(rfcReceptor);
      
      if (resultado.valido) {
        setRfcValidado(true);
        toast.success(`RFC validado: ${resultado.detalles?.razonSocial || 'Válido'}`);
        
        // Autocompletar nombre si está disponible
        if (resultado.detalles?.razonSocial && !nombreReceptor) {
          setNombreReceptor(resultado.detalles.razonSocial);
        }
      } else {
        setRfcValidado(false);
        toast.error(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error validando RFC:', error);
      toast.error('Error al validar RFC. Intenta nuevamente.');
      setRfcValidado(false);
    } finally {
      setValidandoRFC(false);
    }
  };

  const cargarCartasPorteDisponibles = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from('cartas_porte')
      .select('id, folio, uuid_fiscal, fecha_timbrado, origen, destino')
      .eq('usuario_id', user.user.id)
      .eq('status', 'timbrado')
      .is('factura_id', null)
      .order('fecha_timbrado', { ascending: false })
      .limit(50);

    if (!error && data) {
      setCartasPorteDisponibles(data);
    }
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
    // Temporalmente comentado hasta que se regeneren los tipos
    toast.info('Por favor, regenera los tipos de TypeScript primero');
    return;
    
    /* DESCOMENTAR DESPUÉS DE REGENERAR TIPOS:
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No autenticado');

      const totales = calcularTotales();

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
        uso_cfdi: usoCFDI,
        fecha_expedicion: new Date().toISOString()
      });

      if (error) throw error;

      toast.success('Factura guardada como borrador');
      navigate('/administracion/fiscal');
    } catch (error) {
      console.error('Error guardando factura:', error);
      toast.error('Error al guardar factura');
    } finally {
      setLoading(false);
    }
    */
  };

  const timbrarFactura = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No autenticado');

      // Validar RFC antes de timbrar
      if (rfcValidado !== true) {
        toast.error('Debes validar el RFC del receptor antes de timbrar');
        setLoading(false);
        return;
      }

      if (conceptos.length === 0) {
        toast.error('Debes agregar al menos un concepto');
        setLoading(false);
        return;
      }

      // 1. Guardar borrador primero si no existe ID
      let facturaId = id;
      if (!facturaId) {
        const totales = calcularTotales();
        const { data: nuevaFactura, error: insertError } = await supabase
          .from('facturas')
          .insert({
            user_id: user.user.id,
            tipo_comprobante: tipoComprobante,
            rfc_emisor: rfcEmisor,
            nombre_emisor: nombreEmisor,
            rfc_receptor: rfcReceptor,
            nombre_receptor: nombreReceptor,
            subtotal: totales.subtotal,
            total: totales.total,
            status: 'draft',
            uso_cfdi: usoCFDI,
            fecha_expedicion: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        facturaId = nuevaFactura.id;
      }

      // 2. Preparar datos básicos para timbrado
      let facturaData: any = {
        rfcEmisor,
        nombreEmisor,
        rfcReceptor,
        nombreReceptor,
        tipoCfdi: tipoComprobante === 'I' ? 'Ingreso' : 'Traslado',
        usoCfdi: usoCFDI,
        conceptos: conceptos.map(c => ({
          clave_prod_serv: c.clave_prod_serv,
          cantidad: c.cantidad,
          clave_unidad: c.clave_unidad,
          descripcion: c.descripcion,
          valor_unitario: c.valor_unitario,
          importe: c.importe
        }))
      };

      // 3. Si hay carta porte vinculada, cargar sus datos completos
      if (cartaPorteVinculada) {
        console.log('📦 [FACTURA] Cargando datos de Carta Porte vinculada:', cartaPorteVinculada);
        
        const { data: cartaPorte, error: cpError } = await supabase
          .from('cartas_porte')
          .select(`
            *,
            ubicaciones:ubicaciones(*),
            mercancias:mercancias(*),
            autotransporte:autotransporte(*),
            figuras:figuras(*)
          `)
          .eq('id', cartaPorteVinculada)
          .single();

        if (!cpError && cartaPorte) {
          console.log('✅ [FACTURA] Carta Porte cargada con ubicaciones:', cartaPorte.ubicaciones?.length || 0);
          
          // Agregar datos de transporte a facturaData
          facturaData = {
            ...facturaData,
            ubicaciones: cartaPorte.ubicaciones || [],
            mercancias: cartaPorte.mercancias || [],
            autotransporte: cartaPorte.autotransporte?.[0] || null,
            figuras: cartaPorte.figuras || [],
            cartaPorteId: cartaPorte.id_ccp,
            cartaPorteVersion: cartaPorte.version_carta_porte || '3.1',
            transporteInternacional: cartaPorte.transporte_internacional || false
          };
        } else {
          console.warn('⚠️ [FACTURA] No se pudo cargar Carta Porte:', cpError);
        }
      }

      console.log('🚀 [TIMBRADO FACTURA] Iniciando timbrado...', { 
        facturaId, 
        ambiente: 'sandbox',
        tieneCartaPorte: !!cartaPorteVinculada,
        ubicaciones: facturaData.ubicaciones?.length || 0
      });

      // 4. Llamar edge function para timbrar
      const { data: result, error: timbradoError } = await supabase.functions.invoke(
        'timbrar-con-sw',
        {
          body: {
            facturaData,
            facturaId,
            ambiente
          }
        }
      );

      if (timbradoError || !result?.success) {
        console.error('❌ [TIMBRADO FACTURA] Error:', timbradoError || result?.error);
        throw new Error(result?.error || 'Error al timbrar');
      }

      console.log('✅ [TIMBRADO FACTURA] Exitoso. UUID:', result.uuid);
      
      // 4. Actualizar estado en BD
      await supabase
        .from('facturas')
        .update({
          status: 'timbrado',
          uuid: result.uuid,
          fecha_timbrado: new Date().toISOString(),
          xml_timbrado: result.xml
        })
        .eq('id', facturaId);

      toast.success(`Factura timbrada exitosamente. UUID: ${result.uuid}`);
      navigate('/facturas');
    } catch (error) {
      console.error('💥 [TIMBRADO FACTURA] Excepción:', error);
      toast.error(error instanceof Error ? error.message : 'Error al timbrar');
    } finally {
      setLoading(false);
    }
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
                <div className="space-y-2">
                  <Label htmlFor="rfc-receptor">RFC Receptor*</Label>
                  <Input
                    id="rfc-receptor"
                    value={rfcReceptor}
                    onChange={(e) => {
                      setRfcReceptor(e.target.value.toUpperCase());
                      setRfcValidado(null);
                    }}
                    placeholder="XAXX010101000"
                    maxLength={13}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validarRFCReceptor}
                    disabled={validandoRFC || !rfcReceptor}
                    className="w-full"
                  >
                    {validandoRFC ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validando...
                      </>
                    ) : rfcValidado === true ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        RFC Validado
                      </>
                    ) : rfcValidado === false ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        RFC Inválido
                      </>
                    ) : (
                      'Validar RFC con SAT'
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombre-receptor">Nombre / Razón Social*</Label>
                <Input
                  id="nombre-receptor"
                  value={nombreReceptor}
                  onChange={(e) => setNombreReceptor(e.target.value)}
                  placeholder="Nombre del receptor"
                />
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
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vincula una Carta Porte existente a esta factura (opcional)
              </p>

              {cartaPorteVinculada ? (
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Carta Porte Vinculada</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {cartaPorteVinculada}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCartaPorteVinculada(null)}
                    >
                      Desvincular
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setMostrarSelectorCP(true)}
                  >
                    Seleccionar Carta Porte
                  </Button>

                  {mostrarSelectorCP && (
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                      {cartasPorteDisponibles.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No hay Cartas Porte timbradas disponibles
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {cartasPorteDisponibles.map((cp) => (
                            <div
                              key={cp.id}
                              className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setCartaPorteVinculada(cp.id);
                                setMostrarSelectorCP(false);
                              }}
                            >
                              <p className="font-medium">Folio: {cp.folio}</p>
                              <p className="text-sm text-muted-foreground">
                                UUID: {cp.uuid_fiscal?.slice(0, 8)}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Timbrado: {new Date(cp.fecha_timbrado).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
