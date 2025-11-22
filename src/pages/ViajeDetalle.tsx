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
      setFactura(parsed.factura || null);
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
    if (!factura) return;
    setShowFacturaPreview(true);
  };

  const handleTimbrarFactura = async (updatedData: { moneda: string; forma_pago: string; metodo_pago: string }) => {
    if (!factura) return;
    
    try {
      setIsTimbrando(true);
      
      // Actualizar datos editables en la factura
      await supabase
        .from('facturas')
        .update({
          moneda: updatedData.moneda,
          forma_pago: updatedData.forma_pago,
          metodo_pago: updatedData.metodo_pago
        })
        .eq('id', factura.id);
      
      // Llamar edge function para timbrar
      const { data, error } = await supabase.functions.invoke('timbrar-invoice', {
        body: { facturaId: factura.id }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success('✅ Factura timbrada exitosamente');
        
        // Actualizar estado del viaje a 'programado'
        await supabase
          .from('viajes')
          .update({ estado: 'programado' })
          .eq('id', id);
        
        // Cerrar modal y recargar datos
        setShowFacturaPreview(false);
        await cargarViajeCompleto();
      } else {
        throw new Error(data.error || 'Error desconocido al timbrar');
      }
    } catch (error: any) {
      console.error('Error timbrando factura:', error);
      toast.error('Error al timbrar factura', {
        description: error.message
      });
      throw error; // Re-lanzar para que el modal también lo maneje
    } finally {
      setIsTimbrando(false);
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
            rfc_emisor: viaje?.tracking_data?.cliente?.rfc || '',
            nombre_emisor: '',
            regimen_fiscal_emisor: null,
            rfc_receptor: viaje?.tracking_data?.cliente?.rfc || '',
            nombre_receptor: viaje?.tracking_data?.cliente?.nombre_razon_social || '',
            regimen_fiscal_receptor: viaje?.tracking_data?.cliente?.regimen_fiscal || null,
            uso_cfdi: viaje?.tracking_data?.cliente?.uso_cfdi || null,
            subtotal: factura.total / 1.16,
            total: factura.total,
            total_impuestos_trasladados: factura.total - (factura.total / 1.16),
            status: factura.status as 'draft' | 'timbrado',
            tiene_carta_porte: true,
            tipo_comprobante: 'I',
            fecha_expedicion: new Date().toISOString(),
            moneda: 'MXN',
            forma_pago: '01',
            metodo_pago: 'PUE',
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
