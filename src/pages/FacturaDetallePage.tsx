import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function FacturaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: factura, isLoading } = useQuery({
    queryKey: ['factura-detalle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facturas')
        .select('*, viaje:viajes(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'timbrada':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Timbrada</Badge>;
      case 'borrador':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'cancelada':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Factura {factura.folio || factura.id.substring(0, 8)}</h1>
            <p className="text-muted-foreground mt-1">Detalles completos de la factura</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(factura.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Folio</label>
              <p className="text-lg font-semibold">{factura.folio || 'Sin folio'}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">UUID Fiscal</label>
              <p className="text-sm font-mono break-all">{factura.uuid_fiscal || 'Sin UUID (no timbrada)'}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">RFC Emisor</label>
              <p className="text-lg">{factura.rfc_emisor || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">RFC Receptor</label>
              <p className="text-lg">{factura.rfc_receptor || 'N/A'}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total</label>
              <p className="text-2xl font-bold">
                ${parseFloat(String(factura.total || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Detalles CFDI */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles CFDI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo CFDI</label>
              <p className="text-lg">{(factura as any).tipo_cfdi || 'I - Ingreso'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Uso CFDI</label>
              <p className="text-lg">{factura.uso_cfdi || 'G03 - Gastos en general'}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Moneda</label>
              <p className="text-lg">{factura.moneda || 'MXN'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Forma de Pago</label>
              <p className="text-lg">{(factura as any).forma_pago || '01 - Efectivo'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Método de Pago</label>
              <p className="text-lg">{(factura as any).metodo_pago || 'PUE - Pago en una sola exhibición'}</p>
            </div>
            {factura.fecha_timbrado && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Timbrado</label>
                  <p className="text-lg">{new Date(factura.fecha_timbrado).toLocaleString('es-MX')}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Documentos */}
        {factura.status === 'timbrada' && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Documentos Generados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {(factura as any).xml_path && (
                  <Button variant="outline" asChild>
                    <a href={(factura as any).xml_path} download>
                      <FileText className="h-4 w-4 mr-2" />
                      Descargar XML
                    </a>
                  </Button>
                )}
                {(factura as any).pdf_path && (
                  <Button variant="outline" asChild>
                    <a href={(factura as any).pdf_path} download>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </a>
                  </Button>
                )}
                {!(factura as any).xml_path && !(factura as any).pdf_path && (
                  <p className="text-muted-foreground">No hay documentos disponibles para descargar</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {factura.status === 'borrador' && (
          <Button onClick={() => navigate(`/factura/editar/${factura.id}`)}>
            Editar Factura
          </Button>
        )}
        {factura.viaje_id && (
          <Button variant="outline" onClick={() => navigate(`/viaje/${factura.viaje_id}`)}>
            Ver Viaje
          </Button>
        )}
      </div>
    </div>
  );
}
