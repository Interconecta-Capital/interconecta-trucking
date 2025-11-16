import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, Download, FileText, Eye, Printer, 
  Building2, User, Receipt, Package 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FacturaViewerProps {
  factura: {
    id: string;
    uuid_fiscal: string | null;
    tipo_comprobante: string;
    serie: string | null;
    folio: string | null;
    fecha_expedicion: string;
    rfc_emisor: string;
    nombre_emisor: string;
    rfc_receptor: string;
    nombre_receptor: string;
    subtotal: number;
    total: number;
    status: 'draft' | 'timbrado' | 'cancelado';
    tiene_carta_porte: boolean;
    carta_porte_id: string | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    xml_generado?: string | null;
  };
  onClose: () => void;
  onDescargarPDF?: () => void;
  onDescargarXML?: () => void;
}

export function FacturaViewer({ 
  factura, 
  onClose, 
  onDescargarPDF,
  onDescargarXML 
}: FacturaViewerProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      timbrado: { label: 'Timbrado', variant: 'default' as const },
      draft: { label: 'Borrador', variant: 'secondary' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detalle de Factura
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Información Fiscal</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Serie-Folio:</span>
                  <span className="font-mono text-sm">
                    {factura.serie || 'N/A'}-{factura.folio || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">UUID:</span>
                  <span className="font-mono text-xs truncate max-w-[200px]">
                    {factura.uuid_fiscal || 'Sin timbrar'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tipo:</span>
                  <span className="text-sm">{factura.tipo_comprobante}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado:</span>
                  {getStatusBadge(factura.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fecha:</span>
                  <span className="text-sm">
                    {format(new Date(factura.fecha_expedicion), "dd 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Importes</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(factura.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IVA (16%):</span>
                  <span className="font-medium">
                    {formatCurrency(factura.total - factura.subtotal)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(factura.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Emisor y Receptor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Emisor
              </h3>
              <div className="space-y-1">
                <p className="font-medium">{factura.nombre_emisor}</p>
                <p className="text-sm text-muted-foreground">RFC: {factura.rfc_emisor}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Receptor
              </h3>
              <div className="space-y-1">
                <p className="font-medium">{factura.nombre_receptor}</p>
                <p className="text-sm text-muted-foreground">RFC: {factura.rfc_receptor}</p>
              </div>
            </div>
          </div>

          {/* Complemento Carta Porte */}
          {factura.tiene_carta_porte && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Complemento Carta Porte
                </h3>
                <Badge variant="outline" className="text-xs">
                  Factura con Carta Porte adjunta
                </Badge>
                {factura.carta_porte_id && (
                  <p className="text-xs text-muted-foreground">
                    ID: {factura.carta_porte_id}
                  </p>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            {factura.pdf_url && (
              <>
                <Button 
                  variant="default" 
                  onClick={onDescargarPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(factura.pdf_url!, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver PDF
                </Button>
              </>
            )}
            
            {(factura.xml_url || factura.xml_generado) && (
              <Button 
                variant="outline"
                onClick={onDescargarXML}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Descargar XML
              </Button>
            )}

            {factura.uuid_fiscal && (
              <Button 
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            )}
          </div>

          {/* Vista previa del PDF embebido */}
          {factura.pdf_url && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Vista Previa</h3>
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={factura.pdf_url}
                  className="w-full h-full"
                  title="Preview PDF"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
