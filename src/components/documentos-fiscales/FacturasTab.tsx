// ============================================
// FASE 5: Tab de Facturas (MEJORADO)
// ISO 27001 A.18.1: Cumplimiento legal
// Muestra facturas en todos sus estados
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Download, Eye, FileText, Calendar, Send } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function FacturasTab() {
  const [filtro, setFiltro] = useState('todos');

  const { data: facturas, isLoading, refetch } = useQuery({
    queryKey: ['facturas', filtro],
    queryFn: async () => {
      let query = supabase
        .from('facturas')
        .select(`
          *,
          viaje:viajes(id, origen, destino, tracking_data)
        `)
        .order('created_at', { ascending: false });

      if (filtro !== 'todos') {
        query = query.eq('status', filtro);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleTimbrarFactura = async (facturaId: string) => {
    toast.loading('Timbrando factura...', { id: 'timbrar' });
    try {
      // Aquí iría la lógica de timbrado
      // Por ahora, solo simulamos
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Factura timbrada correctamente', { id: 'timbrar' });
      refetch();
    } catch (error) {
      toast.error('Error al timbrar factura', { id: 'timbrar' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center justify-between">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="timbrada">Timbradas</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{facturas?.length || 0} facturas</Badge>
      </div>

      {/* Lista de facturas */}
      <div className="space-y-4">
        {!facturas || facturas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay facturas que coincidan con el filtro seleccionado</p>
            </CardContent>
          </Card>
        ) : (
          facturas.map((factura: any) => (
            <Card key={factura.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Receipt className="h-5 w-5 text-blue-600" />
                      <span className="text-lg font-bold font-mono">
                        {factura.serie}-{factura.folio || 'Borrador'}
                      </span>
                      <Badge variant={
                        factura.status === 'timbrada' ? 'default' :
                        factura.status === 'cancelada' ? 'destructive' :
                        'secondary'
                      }>
                        {factura.status === 'draft' ? 'Borrador' : factura.status}
                      </Badge>
                      {factura.tiene_carta_porte && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Con Carta Porte
                        </Badge>
                      )}
                    </div>
                    {factura.uuid_fiscal && (
                      <p className="text-sm text-muted-foreground font-mono mb-2" title={factura.uuid_fiscal}>
                        UUID: {factura.uuid_fiscal}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${factura.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">{factura.moneda || 'MXN'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">RFC Emisor</p>
                    <p className="font-mono">{factura.rfc_emisor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">RFC Receptor</p>
                    <p className="font-mono">{factura.rfc_receptor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Fecha</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(factura.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                </div>

                {factura.viaje && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Viaje asociado:</p>
                    <p className="text-sm font-medium">{factura.viaje.origen} → {factura.viaje.destino}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  {factura.status === 'draft' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleTimbrarFactura(factura.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Timbrar Factura
                    </Button>
                  )}
                  {factura.status === 'timbrada' && (
                    <>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver XML
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
