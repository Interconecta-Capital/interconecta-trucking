// ============================================
// FASE 5: Tab de Cartas Porte OPTIMIZADO
// ISO 27001 A.18.1: Cumplimiento legal
// Búsqueda avanzada + filtros + acciones completas
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Download, Eye, Truck, Calendar, FileEdit, 
  Search, Trash2, AlertCircle 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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

export function CartasPorteTab() {
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTipo, setDeleteTipo] = useState<'borrador' | 'timbrada' | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Query optimizada: Solo trae lo necesario según el filtro
  const { data: documentos, isLoading } = useQuery({
    queryKey: ['cartas-porte-completo', filtro],
    queryFn: async () => {
      console.log('📋 [CARTAS PORTE] Cargando documentos con filtro:', filtro); // ✅ FASE 5
      const promises: Promise<any>[] = [];

      // Solo traer borradores si el filtro lo requiere
      if (filtro === 'todos' || filtro === 'borrador' || filtro === 'auto_guardado') {
        promises.push(
          supabase
            .from('borradores_carta_porte')
            .select('id, nombre_borrador, datos_formulario, auto_saved, created_at, updated_at, viaje_id')
            .order('updated_at', { ascending: false })
            .limit(100) as any
        );
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      // ✅ CORREGIDO: Usar hint de relación específico para evitar ambigüedad
      // Solo traer cartas timbradas/canceladas si el filtro lo requiere
      if (filtro === 'todos' || filtro === 'timbrada' || filtro === 'cancelada') {
        promises.push(
          supabase
            .from('cartas_porte')
            .select(`
              id, id_ccp, uuid_fiscal, status, rfc_emisor, rfc_receptor, nombre_emisor, nombre_receptor,
              created_at, updated_at, distancia_total, transporte_internacional,
              viajes!fk_cartas_porte_viaje(id, origen, destino)
            `)
            .order('created_at', { ascending: false })
            .limit(100) as any
        );
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      const [borradoresResult, cartasPorteResult] = await Promise.all(promises);

      if (borradoresResult.error) {
        console.error('Error cargando borradores:', borradoresResult.error);
        throw borradoresResult.error;
      }

      if (cartasPorteResult.error) {
        console.error('Error cargando cartas porte:', cartasPorteResult.error);
        throw cartasPorteResult.error;
      }

      // 🔧 FASE 2: Mapear borradores con datos mejorados
      const borradoresFormateados = (borradoresResult.data || []).map((b: any) => {
        const datosForm = b.datos_formulario || {};
        const emisor = datosForm.emisor || datosForm.configuracion?.emisor || {};
        const receptor = datosForm.receptor || datosForm.configuracion?.receptor || {};
        
        const rfcEmisor = datosForm.rfcEmisor || datosForm.configuracion?.rfcEmisor || emisor.rfc || emisor.rfcEmisor || 'N/A';
        const rfcReceptor = datosForm.rfcReceptor || datosForm.configuracion?.rfcReceptor || receptor.rfc || receptor.rfcReceptor || 'N/A';
        
        return {
          id: b.id,
          tipo: 'borrador' as const,
          id_ccp: datosForm.cartaPorteId || datosForm.id_ccp || 'N/A',
          rfc_emisor: rfcEmisor,
          nombre_emisor: datosForm.nombreEmisor || datosForm.configuracion?.nombreEmisor || emisor.nombre || emisor.razonSocial || 'N/A',
          rfc_receptor: rfcReceptor,
          nombre_receptor: datosForm.nombreReceptor || datosForm.configuracion?.nombreReceptor || receptor.nombre || receptor.razonSocial || 'N/A',
          status: b.auto_saved ? 'auto_guardado' : 'borrador',
          created_at: b.created_at,
          updated_at: b.updated_at,
          nombre_borrador: b.nombre_borrador,
          distancia_total: datosForm.datosCalculoRuta?.distanciaTotal || datosForm.distanciaTotal || 0,
          viaje: null,
          viaje_id: b.viaje_id, // ✅ FASE 5: Exponer viaje_id
          uuid_fiscal: null,
          transporte_internacional: datosForm.transporteInternacional || false,
          // ✅ FASE 6: Detectar datos incompletos
          datos_incompletos: rfcEmisor === 'N/A' || rfcReceptor === 'N/A' || !rfcEmisor || !rfcReceptor
        };
      });

      // ✅ CORREGIDO: Mapear viajes correctamente (el resultado cambia con el hint)
      const cartasPorteFormateadas = (cartasPorteResult.data || []).map((cp: any) => ({
        ...cp,
        tipo: 'timbrada' as const,
        // Mapear el campo viajes al singular viaje (compatibilidad con rest del código)
        viaje: cp.viajes || null,
        datos_incompletos: false // Cartas timbradas siempre tienen datos completos
      }));

      // Combinar y ordenar por fecha
      const todosDocumentos = [...borradoresFormateados, ...cartasPorteFormateadas]
        .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

      // ✅ FASE 5: Log de resultados
      console.log('📊 [CARTAS PORTE] Documentos cargados:', {
        borradores: borradoresFormateados.length,
        timbradas: cartasPorteFormateadas.length,
        total: todosDocumentos.length,
        con_datos_incompletos: borradoresFormateados.filter((b: any) => b.datos_incompletos).length
      });

      return todosDocumentos;
    },
    staleTime: 30000,
  });

  // ✅ Búsqueda en memoria (eficiente para los primeros 100 registros)
  const documentosFiltrados = useMemo(() => {
    if (!documentos) return [];
    if (!busqueda.trim()) return documentos;

    const termino = busqueda.toLowerCase().trim();
    return documentos.filter((doc: any) => {
      // ✅ CORREGIDO: Usar doc.viaje que fue mapeado desde doc.viajes
      return (
        doc.id_ccp?.toLowerCase().includes(termino) ||
        doc.rfc_emisor?.toLowerCase().includes(termino) ||
        doc.nombre_emisor?.toLowerCase().includes(termino) ||
        doc.rfc_receptor?.toLowerCase().includes(termino) ||
        doc.nombre_receptor?.toLowerCase().includes(termino) ||
        doc.nombre_borrador?.toLowerCase().includes(termino) ||
        doc.uuid_fiscal?.toLowerCase().includes(termino) ||
        doc.viaje?.origen?.toLowerCase().includes(termino) ||
        doc.viaje?.destino?.toLowerCase().includes(termino)
      );
    });
  }, [documentos, busqueda]);

  // ✅ Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: 'borrador' | 'timbrada' }) => {
      if (tipo === 'borrador') {
        const { error } = await supabase
          .from('borradores_carta_porte')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        // Solo permitir eliminar cartas en estado borrador o cancelada
        const { error } = await supabase
          .from('cartas_porte')
          .delete()
          .eq('id', id)
          .in('status', ['borrador', 'cancelada']);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte-completo'] });
      queryClient.invalidateQueries({ queryKey: ['documentos-fiscales-stats'] });
      toast.success('Carta porte eliminada correctamente');
      setDeleteId(null);
      setDeleteTipo(null);
    },
    onError: (error: any) => {
      console.error('Error eliminando:', error);
      toast.error('Error al eliminar la carta porte');
    },
  });

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
              placeholder="Buscar por IdCCP, RFC, cliente, UUID, origen, destino..."
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
              <SelectItem value="borrador">Borradores</SelectItem>
              <SelectItem value="auto_guardado">Auto-guardados</SelectItem>
              <SelectItem value="timbrada">Timbradas</SelectItem>
              <SelectItem value="cancelada">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="self-center whitespace-nowrap">
            {documentosFiltrados?.length || 0} resultados
          </Badge>
        </div>

        {/* Lista de cartas porte */}
        <div className="space-y-4">
          {!documentosFiltrados || documentosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay cartas porte que coincidan con tu búsqueda</p>
              </CardContent>
            </Card>
          ) : (
            documentosFiltrados.map((doc: any) => (
              <Card key={`${doc.tipo}-${doc.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {doc.tipo === 'borrador' ? (
                          <FileEdit className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Truck className="h-5 w-5 text-green-600" />
                        )}
                        <span className="text-lg font-bold font-mono">
                          {doc.tipo === 'borrador' && doc.nombre_borrador
                            ? doc.nombre_borrador
                            : doc.id_ccp || 'N/A'}
                        </span>
                        <Badge
                          variant={
                            doc.status === 'timbrada'
                              ? 'default'
                              : doc.status === 'cancelada'
                              ? 'destructive'
                              : doc.status === 'auto_guardado'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {doc.status === 'auto_guardado' ? 'Auto-guardado' : doc.status}
                        </Badge>
                        {/* ✅ FASE 6: Badge de datos incompletos */}
                        {doc.datos_incompletos && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Datos incompletos
                          </Badge>
                        )}
                        {doc.transporte_internacional && (
                          <Badge variant="outline" className="text-xs">Internacional</Badge>
                        )}
                      </div>
                      {doc.uuid_fiscal && (
                        <p className="text-sm text-muted-foreground font-mono mb-2" title={doc.uuid_fiscal}>
                          UUID: {doc.uuid_fiscal.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        CFDI 4.0 - CP 3.1
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">RFC Emisor</p>
                      <p className="font-mono">{doc.rfc_emisor}</p>
                      {doc.nombre_emisor && doc.nombre_emisor !== 'N/A' && (
                        <p className="text-xs text-muted-foreground">{doc.nombre_emisor}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">RFC Receptor</p>
                      <p className="font-mono">{doc.rfc_receptor}</p>
                      {doc.nombre_receptor && doc.nombre_receptor !== 'N/A' && (
                        <p className="text-xs text-muted-foreground">{doc.nombre_receptor}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Fecha</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(doc.updated_at || doc.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {doc.distancia_total > 0 && (
                    <div className="mt-3">
                      <p className="text-sm">
                        <span className="font-medium">Distancia total:</span> {doc.distancia_total} km
                      </p>
                    </div>
                  )}

                  {doc.viaje && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Viaje asociado:</p>
                      <p className="text-sm font-medium">
                        {doc.viaje.origen} → {doc.viaje.destino}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {doc.status === 'timbrada' && (
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
                    {doc.tipo === 'borrador' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/borrador-carta-porte/${doc.id}`)}
                      >
                        <FileEdit className="h-4 w-4 mr-2" />
                        Continuar Editando
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(doc.tipo === 'borrador' ? `/borrador-carta-porte/${doc.id}` : `/carta-porte/${doc.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    {(doc.tipo === 'borrador' || doc.status === 'cancelada') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteId(doc.id);
                          setDeleteTipo(doc.tipo);
                        }}
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
              ¿Eliminar carta porte?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La carta porte será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId && deleteTipo) {
                  deleteMutation.mutate({ id: deleteId, tipo: deleteTipo });
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
