// ============================================
// FASE 5: Tab de Cartas Porte (MEJORADO)
// ISO 27001 A.18.1: Cumplimiento legal
// Incluye borradores y cartas porte timbradas
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Truck, Calendar, FileEdit } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CartasPorteTab() {
  const [filtro, setFiltro] = useState('todos');

  // ✅ Consulta unificada: borradores + cartas porte timbradas
  const { data: documentos, isLoading } = useQuery({
    queryKey: ['cartas-porte-completo', filtro],
    queryFn: async () => {
      // 1. Obtener borradores (solo campos necesarios)
      const { data: borradores, error: errorBorradores } = await supabase
        .from('borradores_carta_porte')
        .select(`
          id,
          nombre_borrador,
          datos_formulario,
          auto_saved,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (errorBorradores) {
        console.error('Error cargando borradores:', errorBorradores);
        throw errorBorradores;
      }

      // 2. Obtener cartas porte timbradas/canceladas (solo campos necesarios)
      const { data: cartasPorte, error: errorCP } = await supabase
        .from('cartas_porte')
        .select(`
          id, id_ccp, uuid_fiscal, status, rfc_emisor, rfc_receptor,
          created_at, updated_at, distancia_total,
          viaje:viajes(id, origen, destino)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (errorCP) {
        console.error('Error cargando cartas porte:', errorCP);
        throw errorCP;
      }

      // 3. Unificar y mapear
      const borradoresFormateados = (borradores || []).map(b => {
        const datosForm = (b.datos_formulario as any) || {};
        return {
          id: b.id,
          tipo: 'borrador' as const,
          id_ccp: datosForm.cartaPorteId || 'N/A',
          rfc_emisor: datosForm.rfcEmisor || 'N/A',
          rfc_receptor: datosForm.rfcReceptor || 'N/A',
          status: b.auto_saved ? 'auto_guardado' : 'borrador',
          created_at: b.created_at,
          updated_at: b.updated_at,
          nombre_borrador: b.nombre_borrador,
          distancia_total: datosForm.datosCalculoRuta?.distanciaTotal || 0,
          viaje: null,
          uuid_fiscal: null
        };
      });

      const cartasPorteFormateadas = (cartasPorte || []).map(cp => ({
        ...cp,
        tipo: 'timbrada' as const
      }));

      // 4. Combinar y ordenar
      const todosDocumentos = [...borradoresFormateados, ...cartasPorteFormateadas];

      // 5. Aplicar filtros
      if (filtro === 'todos') return todosDocumentos;
      if (filtro === 'borrador') return todosDocumentos.filter(d => d.status === 'borrador' || d.status === 'auto_guardado');
      if (filtro === 'timbrada') return todosDocumentos.filter(d => d.status === 'timbrada');
      if (filtro === 'cancelada') return todosDocumentos.filter(d => d.status === 'cancelada');

      return todosDocumentos;
    },
    staleTime: 30000,
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
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center justify-between">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="borrador">Borradores</SelectItem>
            <SelectItem value="timbrada">Timbradas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{documentos?.length || 0} documentos</Badge>
      </div>

      {/* Lista de cartas porte */}
      <div className="space-y-4">
        {!documentos || documentos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay cartas porte que coincidan con el filtro seleccionado</p>
            </CardContent>
          </Card>
        ) : (
          documentos.map((doc: any) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {doc.tipo === 'borrador' ? (
                        <FileEdit className="h-5 w-5 text-orange-600" />
                      ) : (
                        <Truck className="h-5 w-5 text-green-600" />
                      )}
                      <span className="text-lg font-bold font-mono">
                        {doc.tipo === 'borrador' && doc.nombre_borrador ? (
                          doc.nombre_borrador
                        ) : (
                          doc.id_ccp || 'N/A'
                        )}
                      </span>
                      <Badge variant={
                        doc.status === 'timbrada' ? 'default' :
                        doc.status === 'cancelada' ? 'destructive' :
                        doc.status === 'auto_guardado' ? 'outline' :
                        'secondary'
                      }>
                        {doc.status === 'auto_guardado' ? 'Auto-guardado' : doc.status}
                      </Badge>
                    </div>
                    {doc.uuid_fiscal && (
                      <p className="text-sm text-muted-foreground font-mono mb-2" title={doc.uuid_fiscal}>
                        UUID: {doc.uuid_fiscal}
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
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">RFC Receptor</p>
                    <p className="font-mono">{doc.rfc_receptor}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Fecha</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(doc.updated_at || doc.created_at).toLocaleDateString('es-MX')}</span>
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
                    <p className="text-sm font-medium">{doc.viaje.origen} → {doc.viaje.destino}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
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
                  {(doc.status === 'borrador' || doc.status === 'auto_guardado') && (
                    <Button variant="outline" size="sm">
                      <FileEdit className="h-4 w-4 mr-2" />
                      Continuar Editando
                    </Button>
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
