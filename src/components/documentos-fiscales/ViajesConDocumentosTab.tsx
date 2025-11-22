// ============================================
// FASE 5: Tab de Viajes con Documentos
// ISO 27001 A.18.1: Cumplimiento legal
// ============================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route, FileText, Receipt, Eye, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ViajesConDocumentosTab() {
  const [filtro, setFiltro] = useState('todos');

  const { data: viajes, isLoading } = useQuery({
    queryKey: ['viajes-con-documentos', filtro],
    queryFn: async () => {
      let query = supabase
        .from('viajes')
        .select(`
          id, origen, destino, fecha_inicio_programada, estado,
          facturas:facturas(id, status, serie, folio, uuid_fiscal, total),
          cartas_porte:cartas_porte(id, status, id_ccp, uuid_fiscal)
        `)
        .order('fecha_inicio_programada', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) {
        console.error('Error cargando viajes:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 30000,
  });

  const viajesFiltrados = viajes?.filter(viaje => {
    const facturas = Array.isArray(viaje.facturas) ? viaje.facturas : [];
    const cartasPorte = Array.isArray(viaje.cartas_porte) ? viaje.cartas_porte : [];
    
    if (filtro === 'todos') return true;
    if (filtro === 'con_factura') return facturas.length > 0;
    if (filtro === 'con_carta_porte') return cartasPorte.length > 0;
    if (filtro === 'sin_documentos') return facturas.length === 0 && cartasPorte.length === 0;
    return true;
  }) || [];

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
            <SelectItem value="todos">Todos los viajes</SelectItem>
            <SelectItem value="con_factura">Con factura</SelectItem>
            <SelectItem value="con_carta_porte">Con carta porte</SelectItem>
            <SelectItem value="sin_documentos">Sin documentos</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{viajesFiltrados.length} viajes</Badge>
      </div>

      {/* Lista de viajes */}
      <div className="space-y-4">
        {viajesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay viajes que coincidan con el filtro seleccionado</p>
            </CardContent>
          </Card>
        ) : (
          viajesFiltrados.map((viaje: any) => (
            <Card key={viaje.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    {viaje.origen} → {viaje.destino}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(viaje.fecha_inicio_programada).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Factura */}
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Factura</span>
                    </div>
                    {Array.isArray(viaje.facturas) && viaje.facturas.length > 0 ? (
                      viaje.facturas.map((factura: any) => (
                        <div key={factura.id} className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{factura.serie}-{factura.folio}</span>
                            <Badge variant={factura.status === 'timbrada' ? 'default' : 'secondary'} className="text-xs">
                              {factura.status}
                            </Badge>
                          </div>
                          {factura.uuid_fiscal && (
                            <p className="text-muted-foreground truncate" title={factura.uuid_fiscal}>
                              UUID: {factura.uuid_fiscal}
                            </p>
                          )}
                          {factura.total && (
                            <p className="font-medium">${factura.total.toLocaleString('es-MX')} MXN</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin factura</p>
                    )}
                  </div>

                  {/* Carta Porte */}
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Carta Porte</span>
                    </div>
                    {Array.isArray(viaje.cartas_porte) && viaje.cartas_porte.length > 0 ? (
                      viaje.cartas_porte.map((cp: any) => (
                        <div key={cp.id} className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{cp.id_ccp || 'N/A'}</span>
                            <Badge variant={cp.status === 'timbrada' ? 'default' : 'secondary'} className="text-xs">
                              {cp.status}
                            </Badge>
                          </div>
                          {cp.uuid_fiscal && (
                            <p className="text-muted-foreground truncate" title={cp.uuid_fiscal}>
                              UUID: {cp.uuid_fiscal}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin carta porte</p>
                    )}
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Viaje
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
