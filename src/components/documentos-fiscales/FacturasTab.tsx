// ============================================
// FASE 5: Tab de Facturas OPTIMIZADO
// ISO 27001 A.18.1: Cumplimiento legal
// Búsqueda avanzada + filtros + acciones completas
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Receipt, Download, Eye, FileText, Calendar, Send, 
  Search, Trash2, AlertCircle, Edit 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function FacturasTab() {
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [timbrandoIds, setTimbrandoIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ✅ Query optimizada: Solo facturas (no hay tabla de borradores de facturas)
  const { data: facturas, isLoading } = useQuery({
    queryKey: ['facturas', filtro],
    queryFn: async () => {
      console.log('[FacturasTab] Cargando facturas con filtro:', filtro);
      
      let query = supabase
        .from('facturas')
        .select(`
          id, serie, folio, uuid_fiscal, status, rfc_emisor, rfc_receptor,
          nombre_emisor, nombre_receptor, total, moneda, created_at, tiene_carta_porte,
          viaje:viajes!facturas_viaje_id_fkey(id, origen, destino)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Aplicar filtro si no es "todos"
      if (filtro !== 'todos') {
        query = query.eq('status', filtro);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[FacturasTab] Error cargando facturas:', error);
        throw error;
      }

      console.log('[FacturasTab] Facturas cargadas:', data?.length || 0);
      console.log('[FacturasTab] Primera factura:', data?.[0]);
      console.log('[FacturasTab] Facturas draft:', data?.filter(f => f.status === 'draft').length || 0);

      return (data || []).map((f: any) => ({
        ...f,
        tipo: 'factura' as const,
      }));
    },
    staleTime: 30000,
  });

  // ✅ Búsqueda en memoria (eficiente para los primeros 100 registros)
  const facturasFiltradas = useMemo(() => {
    if (!facturas) return [];
    if (!busqueda.trim()) return facturas;

    const termino = busqueda.toLowerCase().trim();
    return facturas.filter((factura: any) => {
      return (
        factura.serie?.toLowerCase().includes(termino) ||
        factura.folio?.toString().includes(termino) ||
        factura.rfc_emisor?.toLowerCase().includes(termino) ||
        factura.nombre_emisor?.toLowerCase().includes(termino) ||
        factura.rfc_receptor?.toLowerCase().includes(termino) ||
        factura.nombre_receptor?.toLowerCase().includes(termino) ||
        factura.uuid_fiscal?.toLowerCase().includes(termino) ||
        factura.nombre_borrador?.toLowerCase().includes(termino) ||
        factura.viaje?.origen?.toLowerCase().includes(termino) ||
        factura.viaje?.destino?.toLowerCase().includes(termino)
      );
    });
  }, [facturas, busqueda]);

  // ✅ Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // Solo permitir eliminar facturas en estado borrador o cancelada
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', id)
        .in('status', ['draft', 'cancelada']);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['documentos-fiscales-stats'] });
      toast.success('Factura eliminada correctamente');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Error eliminando:', error);
      toast.error('Error al eliminar la factura');
    },
  });

  // 🔧 FASE 3: Handler para timbrar factura con preview
  const handleTimbrarFactura = async (facturaId: string) => {
    try {
      toast.loading('Preparando factura para timbrado...', { id: `timbrar-${facturaId}` });
      
      // Cargar datos completos de la factura (especificando FK para evitar ambigüedad)
      const { data: factura, error } = await supabase
        .from('facturas')
        .select(`
          *,
          viaje:viajes!facturas_viaje_id_fkey(*)
        `)
        .eq('id', facturaId)
        .single();
      
      if (error) throw error;
      
      // Navegar a la página del viaje para usar el modal de preview
      const viajeId = factura.viaje_id;
      toast.dismiss(`timbrar-${facturaId}`);
      toast.info('Abriendo previsualización de factura...');
      navigate(`/viajes/${viajeId}`);
      
    } catch (error) {
      console.error('[FacturasTab] Error preparando factura:', error);
      toast.error('Error al preparar factura para timbrado', { id: `timbrar-${facturaId}` });
    }
  };

  // 🔧 FASE 3: Handler para editar factura
  const handleEditarFactura = (facturaId: string) => {
    navigate(`/factura/editar/${facturaId}`);
  };

  // 🔧 FASE 3: Handler para ver detalles
  const handleVerDetalles = (facturaId: string) => {
    navigate(`/factura/${facturaId}`);
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
    <>
      <div className="space-y-4">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por serie, folio, RFC, cliente, UUID, viaje..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="timbrada">Timbradas</SelectItem>
              <SelectItem value="cancelada">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="self-center whitespace-nowrap">
            {facturasFiltradas?.length || 0} resultados
          </Badge>
        </div>

        {/* Lista de facturas */}
        <div className="space-y-4">
          {!facturasFiltradas || facturasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay facturas que coincidan con tu búsqueda</p>
              </CardContent>
            </Card>
          ) : (
            facturasFiltradas.map((factura: any) => (
              <Card key={`${factura.tipo}-${factura.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        <span className="text-lg font-bold font-mono">
                          {/* FASE 5: Mostrar serie-folio o 'Borrador' si es draft */}
                          {factura.status === 'draft' 
                            ? `Borrador ${factura.serie ? `${factura.serie}-` : ''}${factura.folio || 'Sin Folio'}`
                            : `${factura.serie || ''}-${factura.folio || 'S/F'}`}
                        </span>
                        <Badge
                          variant={
                            factura.status === 'timbrada'
                              ? 'default'
                              : factura.status === 'cancelada'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
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
                          UUID: {factura.uuid_fiscal.substring(0, 30)}...
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
                      {factura.nombre_emisor && factura.nombre_emisor !== 'N/A' && (
                        <p className="text-xs text-muted-foreground">{factura.nombre_emisor}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">RFC Receptor</p>
                      <p className="font-mono">{factura.rfc_receptor || 'N/A'}</p>
                      {factura.nombre_receptor && factura.nombre_receptor !== 'N/A' && (
                        <p className="text-xs text-muted-foreground">{factura.nombre_receptor}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Fecha</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(factura.updated_at || factura.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {factura.viaje && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Viaje asociado:</p>
                      <p className="text-sm font-medium">
                        {factura.viaje.origen} → {factura.viaje.destino}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {factura.status === 'draft' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleTimbrarFactura(factura.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Timbrar Factura
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarFactura(factura.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerDetalles(factura.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    {(factura.status === 'draft' || factura.status === 'cancelada') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(factura.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              ¿Eliminar factura?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La factura será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate({ id: deleteId });
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
