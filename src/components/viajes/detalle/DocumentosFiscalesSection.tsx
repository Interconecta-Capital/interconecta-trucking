import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FileText, Package, Download, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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

interface BorradorCartaPorte {
  id: string;
  nombre_borrador: string;
  ultima_edicion: string;
}

interface DocumentosFiscalesSectionProps {
  factura: Factura | null;
  cartaPorte: CartaPorte | null;
  borradorCartaPorte: BorradorCartaPorte | null;
  viaje: any;
  onReload: () => Promise<void>;
}

export function DocumentosFiscalesSection({
  factura,
  cartaPorte,
  borradorCartaPorte,
  viaje,
  onReload
}: DocumentosFiscalesSectionProps) {
  const navigate = useNavigate();

  // Determinar estado del documento de Carta Porte
  const getEstadoDocumentoCartaPorte = () => {
    if (cartaPorte?.status === 'timbrado') {
      return 'timbrado';
    }
    if (cartaPorte?.id) {
      return 'activa';
    }
    if (borradorCartaPorte?.id) {
      return 'borrador';
    }
    return 'sin_documento';
  };

  const estadoDocCP = getEstadoDocumentoCartaPorte();

  const descargarPDF = (url?: string) => {
    if (!url) {
      toast.error('PDF no disponible');
      return;
    }
    window.open(url, '_blank');
  };

  const descargarXML = (xmlContent?: string, filename?: string) => {
    if (!xmlContent) {
      toast.error('XML no disponible');
      return;
    }
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'documento.xml';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Sección de Factura */}
      {factura && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Factura
            </CardTitle>
            <CardDescription>
              Documento fiscal CFDI
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
                    onClick={() => descargarXML(factura.xml_timbrado, `factura-${factura.serie}-${factura.folio}.xml`)}
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
          {/* CASO 1: Sin documento */}
          {estadoDocCP === 'sin_documento' && (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No hay Carta Porte generada para este viaje
              </p>
              <Button
                onClick={async () => {
                  try {
                    toast.loading('Generando borrador de Carta Porte...', { id: 'create-borrador' });
                    
                    const result = await ViajeOrchestrationService.crearBorradorDesdeViaje(viaje.id);
                    
                    if (result.success && result.borradorId) {
                      toast.success('Borrador creado exitosamente', { id: 'create-borrador' });
                      await onReload();
                    } else {
                      throw new Error(result.error || 'Error desconocido');
                    }
                  } catch (error: any) {
                    console.error('Error creando borrador:', error);
                    toast.error('Error al crear borrador: ' + error.message, { id: 'create-borrador' });
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generar Borrador de Carta Porte
              </Button>
            </div>
          )}

          {/* CASO 2: Borrador en progreso */}
          {estadoDocCP === 'borrador' && borradorCartaPorte && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nombre del Borrador</Label>
                  <p className="font-semibold">{borradorCartaPorte.nombre_borrador}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última Edición</Label>
                  <p className="font-semibold">
                    {new Date(borradorCartaPorte.ultima_edicion).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>📝 Borrador en progreso:</strong> Continúa completando la información de la Carta Porte.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/carta-porte/editor?borrador=${borradorCartaPorte.id}`)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Continuar Llenado de Carta Porte
                </Button>
              </div>
            </>
          )}

          {/* CASO 3: Carta Porte activa (no timbrada) */}
          {estadoDocCP === 'activa' && cartaPorte && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID CCP</Label>
                  <p className="font-semibold">{cartaPorte.id_ccp || 'Pendiente'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge variant="secondary">{cartaPorte.status.toUpperCase()}</Badge>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/carta-porte/editor?carta=${cartaPorte.id}`)}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Editar Carta Porte
                </Button>
                <Button
                  onClick={async () => {
                    toast.info('Funcionalidad de timbrado de Carta Porte en desarrollo');
                  }}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Finalizar y Timbrar
                </Button>
              </div>
            </>
          )}

          {/* CASO 4: Carta Porte timbrada */}
          {estadoDocCP === 'timbrado' && cartaPorte && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID CCP</Label>
                  <p className="font-semibold">{cartaPorte.id_ccp}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge>TIMBRADO</Badge>
                </div>
              </div>
              
              {cartaPorte.uuid_fiscal && (
                <div className="bg-muted p-3 rounded-md">
                  <Label className="text-muted-foreground text-xs">UUID Fiscal</Label>
                  <p className="font-mono text-sm mt-1">{cartaPorte.uuid_fiscal}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/carta-porte/viewer?id=${cartaPorte.id}`)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  onClick={() => toast.info('Descarga de PDF en desarrollo')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button
                  onClick={() => toast.info('Descarga de XML en desarrollo')}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar XML
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
