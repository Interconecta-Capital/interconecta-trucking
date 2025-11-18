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
  AlertCircle
} from 'lucide-react';
import { Viaje } from '@/types/viaje';
import { ViajeOrchestrationService } from '@/services/viajes/ViajeOrchestrationService';

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

  useEffect(() => {
    if (id) {
      cargarViajeCompleto();
    }
  }, [id]);

  const cargarViajeCompleto = async () => {
    try {
      setLoading(true);
      
      // Cargar viaje con todas sus relaciones
      const { data: viajeData, error: viajeError } = await supabase
        .from('viajes')
        .select(`
          *,
          facturas (*),
          cartas_porte (*),
          conductores (*),
          vehiculos (*),
          socios (*)
        `)
        .eq('id', id)
        .single();

      if (viajeError) throw viajeError;

      setViaje(viajeData as any);
      setFactura(viajeData.facturas?.[0] || null);
      setCartaPorte(viajeData.cartas_porte?.[0] || null);
      setConductor(viajeData.conductores || null);
      setVehiculo(viajeData.vehiculos || null);
      setSocio(viajeData.socios || null);
      
    } catch (error) {
      console.error('Error cargando viaje:', error);
      toast.error('Error al cargar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleTimbrarFactura = async () => {
    if (!factura) return;
    
    try {
      setProcessing(true);
      
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
        
        // Recargar datos
        await cargarViajeCompleto();
      }
    } catch (error: any) {
      console.error('Error timbrando factura:', error);
      toast.error('Error al timbrar factura', {
        description: error.message
      });
    } finally {
      setProcessing(false);
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
              {factura.status === 'draft' && (
                <Button 
                  onClick={handleTimbrarFactura} 
                  disabled={processing}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {processing ? 'Timbrando...' : 'Timbrar Factura'}
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
    </div>
  );
}
