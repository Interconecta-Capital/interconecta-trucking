import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Send, 
  Download, 
  FileText, 
  Truck, 
  MapPin, 
  User, 
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Viaje } from '@/types/viaje';
import { ViajeOrchestrationService } from '@/services/viajes/ViajeOrchestrationService';
import { FacturaPreviewModal } from '@/components/viajes/documentos/FacturaPreviewModal';

interface Factura {
  id: string;
  serie: string;
  folio: string;
  total: number;
  status: string;
  uuid_fiscal?: string;
  pdf_url?: string;
  xml_timbrado?: string;
  fecha_timbrado?: string;
}

interface CartaPorte {
  id: string;
  id_ccp: string;
  status: string;
  uuid_fiscal?: string;
  fecha_timbrado?: string;
}

export default function ViajeDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [factura, setFactura] = useState<Factura | null>(null);
  const [cartaPorte, setCartaPorte] = useState<CartaPorte | null>(null);
  const [conductor, setConductor] = useState<any>(null);
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [socio, setSocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showFacturaPreview, setShowFacturaPreview] = useState(false);
  const [isTimbrando, setIsTimbrando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarViajeCompleto();
    }
  }, [id]);

  const cargarViajeCompleto = async () => {
    try {
      setLoading(true);
      
      // ⚡ OPTIMIZACIÓN: Usar función RPC para una sola consulta
      const { data: result, error } = await supabase
        .rpc('get_viaje_completo_optimizado', { p_viaje_id: id });

      if (error) throw error;
      if (!result) throw new Error('Viaje no encontrado');

      // Parsear el resultado JSONB
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      setViaje(parsed.viaje);
      
      // ✅ MEJORADO: Asegurar que la factura tenga todos los campos fiscales
      if (parsed.factura) {
        setFactura({
          ...parsed.factura,
          // Asegurar que los campos fiscales estén disponibles
          rfc_emisor: parsed.factura.rfc_emisor,
          nombre_emisor: parsed.factura.nombre_emisor,
          regimen_fiscal_emisor: parsed.factura.regimen_fiscal_emisor,
          rfc_receptor: parsed.factura.rfc_receptor,
          nombre_receptor: parsed.factura.nombre_receptor,
          regimen_fiscal_receptor: parsed.factura.regimen_fiscal_receptor, // ✅ Ahora guardado en BD
          uso_cfdi: parsed.factura.uso_cfdi,
          subtotal: parsed.factura.subtotal,
          total_impuestos_trasladados: parsed.factura.total_impuestos_trasladados,
          moneda: parsed.factura.moneda,
          forma_pago: parsed.factura.forma_pago,
          metodo_pago: parsed.factura.metodo_pago
        } as any);
      }
      
      setCartaPorte(parsed.carta_porte || null);
      setConductor(parsed.conductor || null);
      setVehiculo(parsed.vehiculo || null);
      setSocio(parsed.socio || null);
      
    } catch (error) {
      console.error('Error cargando viaje:', error);
      toast.error('Error al cargar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handlePrepararPreview = () => {
    if (!factura) {
      console.error('❌ No hay factura para mostrar');
      toast.error('No se encontró la factura');
      return;
    }
    
    console.log('📄 Abriendo preview de factura:', {
      id: factura.id,
      serie: factura.serie,
      folio: factura.folio,
      status: factura.status,
      rfc_receptor: (factura as any).rfc_receptor,
      regimen_fiscal_receptor: (factura as any).regimen_fiscal_receptor
    });
    
    setShowFacturaPreview(true);
  };

  /**
   * ⚡ FASE 3 y 6: MEJORADO - Timbrado con validaciones exhaustivas y logs
   * Maneja el flujo completo de timbrado con fallbacks y auditoría
   */
  const handleTimbrarFactura = async (updatedData: { moneda: string; forma_pago: string; metodo_pago: string }) => {
    console.group('🎯 [TIMBRADO] Inicio del proceso');
    console.log('📋 Datos de entrada:', {
      facturaId: factura?.id,
      viajeId: id,
      updatedData,
      facturaStatus: factura?.status
    });
    
    // ✅ VALIDACIÓN 1: Verificar que existe la factura
    if (!factura) {
      console.error('❌ [TIMBRADO] Factura no encontrada');
      console.groupEnd();
      toast.error('No se encontró la factura para timbrar');
      return;
    }
    
    // ✅ VALIDACIÓN 2: Verificar que no está ya timbrada
    if (factura.status === 'timbrado') {
      console.warn('⚠️ [TIMBRADO] La factura ya está timbrada');
      console.groupEnd();
      toast.warning('Esta factura ya está timbrada');
      return;
    }
    
    try {
      setIsTimbrando(true);
      toast.loading('Preparando factura para timbrado...', { id: 'timbrado-process' });
      
      // ✅ FASE 1: Cargar régimen fiscal desde socio si falta (FALLBACK)
      let regimenFiscalReceptor = (factura as any).regimen_fiscal_receptor;
      console.log('🔍 [TIMBRADO] Régimen fiscal actual:', regimenFiscalReceptor);
      
      if (!regimenFiscalReceptor && viaje?.socio_id) {
        console.log('⚠️ [TIMBRADO] Régimen fiscal faltante, aplicando fallback desde socio...');
        const { data: socioData, error: socioError } = await supabase
          .from('socios')
          .select('regimen_fiscal, nombre_razon_social')
          .eq('id', viaje.socio_id)
          .single();
        
        if (socioError) {
          console.error('❌ [TIMBRADO] Error cargando socio:', socioError);
        } else if (socioData?.regimen_fiscal) {
          regimenFiscalReceptor = socioData.regimen_fiscal;
          console.log('✅ [TIMBRADO] Régimen fiscal obtenido desde socio:', {
            socio: socioData.nombre_razon_social,
            regimen: regimenFiscalReceptor
          });
        } else {
          console.warn('⚠️ [TIMBRADO] Socio sin régimen fiscal, usando default');
        }
      }
      
      // ✅ VALIDACIÓN 3: Asegurar que hay un régimen fiscal válido
      const regimenFinal = regimenFiscalReceptor || '616'; // 616 = Sin obligaciones fiscales
      if (!regimenFiscalReceptor) {
        console.warn('⚠️ [TIMBRADO] Usando régimen fiscal por defecto (616)');
      }
      
      // ✅ FASE 2: Actualizar factura con datos editables + régimen fiscal
      console.log('💾 [TIMBRADO] Actualizando factura en BD...');
      const updatePayload = {
        moneda: updatedData.moneda,
        forma_pago: updatedData.forma_pago,
        metodo_pago: updatedData.metodo_pago,
        regimen_fiscal_receptor: regimenFinal
      };
      console.log('📦 [TIMBRADO] Payload de actualización:', updatePayload);
      
      const { error: updateError } = await supabase
        .from('facturas')
        .update(updatePayload)
        .eq('id', factura.id);
      
      if (updateError) {
        console.error('❌ [TIMBRADO] Error actualizando factura:', updateError);
        throw new Error(`Error al actualizar factura: ${updateError.message}`);
      }
      
      console.log('✅ [TIMBRADO] Factura actualizada correctamente en BD');
      toast.loading('Enviando a timbrar con SmartWeb...', { id: 'timbrado-process' });
      
      // ✅ FASE 3: Llamar edge function para timbrar con el PAC
      console.log('📤 [TIMBRADO] Invocando edge function timbrar-invoice...');
      const startTime = Date.now();
      
      const { data: timbradoData, error: timbradoError } = await supabase.functions.invoke('timbrar-invoice', {
        body: { facturaId: factura.id }
      });
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ [TIMBRADO] Edge function respondió en ${duration}ms`);
      console.log('📥 [TIMBRADO] Respuesta completa:', { data: timbradoData, error: timbradoError });

      // ✅ VALIDACIÓN 4: Verificar respuesta del edge function
      if (timbradoError) {
        console.error('❌ [TIMBRADO] Error del edge function:', timbradoError);
        throw new Error(`Error del PAC: ${timbradoError.message || JSON.stringify(timbradoError)}`);
      }
      
      if (!timbradoData) {
        console.error('❌ [TIMBRADO] Edge function no retornó datos');
        throw new Error('El servicio de timbrado no retornó una respuesta válida');
      }
      
      // ✅ FASE 4: Verificar resultado del timbrado
      if (timbradoData.success && timbradoData.uuid) {
        console.log('✅ [TIMBRADO] Factura timbrada exitosamente');
        console.log('🎫 [TIMBRADO] UUID generado:', timbradoData.uuid);
        console.log('📊 [TIMBRADO] Metadatos:', {
          fecha_timbrado: timbradoData.fecha_timbrado,
          no_certificado_sat: timbradoData.no_certificado_sat
        });
        
        toast.success('✅ Factura timbrada exitosamente', { 
          id: 'timbrado-process',
          description: `UUID: ${timbradoData.uuid}`,
          duration: 5000
        });
        
        // ✅ FASE 5: Actualizar estado del viaje a 'programado'
        console.log('🔄 [TIMBRADO] Actualizando estado del viaje...');
        const { error: viajeError } = await supabase
          .from('viajes')
          .update({ estado: 'programado' })
          .eq('id', id);
        
        if (viajeError) {
          console.warn('⚠️ [TIMBRADO] No se pudo actualizar el viaje:', viajeError);
        } else {
          console.log('✅ [TIMBRADO] Viaje actualizado a estado: programado');
        }
        
        // ✅ FASE 6: Cerrar modal y recargar datos
        setShowFacturaPreview(false);
        await cargarViajeCompleto();
        
        console.log('🎉 [TIMBRADO] Proceso completado exitosamente');
        console.groupEnd();
      } else {
        // Timbrado falló según el PAC
        const errorMsg = timbradoData.error || 'Error desconocido del PAC';
        console.error('❌ [TIMBRADO] PAC rechazó el timbrado:', errorMsg);
        console.error('📋 [TIMBRADO] Detalles:', timbradoData.details);
        console.groupEnd();
        
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.group('💥 [TIMBRADO] Error capturado');
      console.error('Error completo:', error);
      console.error('Stack trace:', error.stack);
      console.groupEnd();
      
      // Mostrar error al usuario con contexto
      const errorMessage = error.message || 'Error desconocido al timbrar';
      const errorDetails = error.details || error.hint || 'Revisa la consola para más información';
      
      toast.error(`Error al timbrar: ${errorMessage}`, { 
        id: 'timbrado-process',
        description: errorDetails,
        duration: 8000
      });
      throw error; // Re-lanzar para que el modal también lo maneje
    } finally {
      setIsTimbrando(false);
      console.log('🏁 [TIMBRADO] Finalizando proceso');
    }
  };

  const descargarPDF = async (url?: string) => {
    if (!url) {
      toast.error('PDF no disponible');
      return;
    }
    window.open(url, '_blank');
  };

  const descargarXML = async (xmlContent?: string) => {
    if (!xmlContent) {
      toast.error('XML no disponible');
      return;
    }
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${factura?.serie}-${factura?.folio}.xml`;
    a.click();
  };

  const getEstadoBadgeVariant = (estado: string) => {
    const variants: Record<string, any> = {
      'borrador': 'secondary',
      'programado': 'default',
      'en_transito': 'default',
      'completado': 'default',
      'cancelado': 'destructive',
      'retrasado': 'destructive'
    };
    return variants[estado] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Viaje no encontrado</p>
            <Button onClick={() => navigate('/viajes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Viajes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/viajes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Viaje #{viaje.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">
              Creado el {new Date(viaje.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant={getEstadoBadgeVariant(viaje.estado)}>
          {viaje.estado.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Información Principal del Viaje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Información del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Origen
              </Label>
              <p className="font-medium">{viaje.origen}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Destino
              </Label>
              <p className="font-medium">{viaje.destino}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Conductor
              </Label>
              <p className="font-medium">{conductor?.nombre || 'No asignado'}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                Vehículo
              </Label>
              <p className="font-medium">{vehiculo?.placa || 'No asignado'}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Fecha Programada
              </Label>
              <p className="font-medium">
                {new Date(viaje.fecha_inicio_programada).toLocaleDateString()}
              </p>
            </div>
            
            {viaje.precio_cobrado && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Precio
                </Label>
                <p className="font-medium text-xl">
                  ${viaje.precio_cobrado.toLocaleString('es-MX')}
                </p>
              </div>
            )}
          </div>
          
          {viaje.observaciones && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label className="text-muted-foreground">Observaciones</Label>
                <p className="text-sm">{viaje.observaciones}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sección de Factura */}
      {factura && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Factura Vinculada
            </CardTitle>
            <CardDescription>
              Documento fiscal asociado a este viaje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Serie - Folio</Label>
                <p className="font-semibold text-lg">
                  {factura.serie}-{factura.folio}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total</Label>
                <p className="font-semibold text-lg">
                  ${factura.total.toLocaleString('es-MX')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <div className="mt-1">
                  <Badge variant={factura.status === 'timbrado' ? 'default' : 'secondary'}>
                    {factura.status === 'draft' ? 'BORRADOR' : 'TIMBRADO'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {factura.uuid_fiscal && (
              <div className="bg-muted p-3 rounded-md">
                <Label className="text-muted-foreground text-xs">UUID Fiscal</Label>
                <p className="font-mono text-sm mt-1">{factura.uuid_fiscal}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              {(factura.status === 'draft' || factura.status === 'BORRADOR') && (
                <Button 
                  onClick={handlePrepararPreview} 
                  disabled={processing}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Pre-visualizar Factura
                </Button>
              )}
              
              {factura.status === 'timbrado' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => descargarPDF(factura.pdf_url)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => descargarXML(factura.xml_timbrado)}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Descargar XML
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sección de Carta Porte */}
      {cartaPorte && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Carta Porte
            </CardTitle>
            <CardDescription>
              Complemento de transporte de mercancías
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">ID CCP</Label>
                <p className="font-semibold">{cartaPorte.id_ccp || 'Pendiente'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <div className="mt-1">
                  <Badge variant={cartaPorte.status === 'timbrado' ? 'default' : 'secondary'}>
                    {cartaPorte.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            {cartaPorte.status === 'draft' && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ℹ️ Información:</strong> La Carta Porte se generará y timbrará automáticamente después de timbrar la factura.
                </p>
              </div>
            )}
            
            {cartaPorte.uuid_fiscal && (
              <div className="bg-muted p-3 rounded-md">
                <Label className="text-muted-foreground text-xs">UUID Fiscal</Label>
                <p className="font-mono text-sm mt-1">{cartaPorte.uuid_fiscal}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Pre-visualización de Factura */}
      {factura && showFacturaPreview && (
        <FacturaPreviewModal
          open={showFacturaPreview}
          onOpenChange={setShowFacturaPreview}
          facturaData={{
            id: factura.id,
            serie: factura.serie,
            folio: factura.folio,
            rfc_emisor: (factura as any).rfc_emisor || '',
            nombre_emisor: (factura as any).nombre_emisor || '',
            regimen_fiscal_emisor: (factura as any).regimen_fiscal_emisor || null,
            rfc_receptor: (factura as any).rfc_receptor || '',
            nombre_receptor: (factura as any).nombre_receptor || '',
            regimen_fiscal_receptor: (factura as any).regimen_fiscal_receptor || null, // ✅ Ahora viene de la BD
            uso_cfdi: (factura as any).uso_cfdi || null,
            subtotal: (factura as any).subtotal || factura.total / 1.16,
            total: factura.total,
            total_impuestos_trasladados: (factura as any).total_impuestos_trasladados || factura.total - (factura.total / 1.16),
            status: factura.status as 'draft' | 'timbrado',
            tiene_carta_porte: true,
            tipo_comprobante: 'I',
            fecha_expedicion: new Date().toISOString(),
            moneda: (factura as any).moneda || 'MXN',
            forma_pago: (factura as any).forma_pago || '01',
            metodo_pago: (factura as any).metodo_pago || 'PUE',
            uuid_fiscal: factura.uuid_fiscal
          }}
          viajeData={{
            tipo_servicio: viaje?.tipo_servicio
          }}
          onTimbrar={handleTimbrarFactura}
          isTimbrando={isTimbrando}
        />
      )}
    </div>
  );
}
