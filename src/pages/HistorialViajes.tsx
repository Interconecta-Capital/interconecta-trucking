import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, FileText, MapPin, Truck, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistorialViajes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    status: 'todos',
    busqueda: ''
  });

  const { data: cartasPorte, isLoading } = useQuery({
    queryKey: ['cartas-porte-historial', filtros, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('cartas_porte')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }

      if (filtros.fechaInicio) {
        query = query.gte('created_at', filtros.fechaInicio);
      }

      if (filtros.fechaFin) {
        query = query.lte('created_at', `${filtros.fechaFin}T23:59:59`);
      }

      if (filtros.busqueda) {
        query = query.or(`id_ccp.ilike.%${filtros.busqueda}%,rfc_emisor.ilike.%${filtros.busqueda}%,rfc_receptor.ilike.%${filtros.busqueda}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      borrador: { variant: 'secondary', label: 'Borrador' },
      generado: { variant: 'default', label: 'Generado' },
      timbrado: { variant: 'default', label: 'Timbrado' },
      cancelado: { variant: 'destructive', label: 'Cancelado' }
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-90">Historial de Viajes</h1>
            <p className="text-gray-60 mt-1">Consulta todas tus cartas porte creadas</p>
          </div>
          <Button
            onClick={() => navigate('/carta-porte/editor')}
            className="bg-gray-90 hover:bg-gray-80"
          >
            <FileText className="h-4 w-4 mr-2" />
            Nueva Carta Porte
          </Button>
        </div>

        {/* Filtros */}
        <Card className="border-gray-20 shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-70">Fecha Inicio</label>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  className="border-gray-20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-70">Fecha Fin</label>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                  className="border-gray-20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-70">Estado</label>
                <Select 
                  value={filtros.status} 
                  onValueChange={(v) => setFiltros({ ...filtros, status: v })}
                >
                  <SelectTrigger className="border-gray-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="borrador">Borradores</SelectItem>
                    <SelectItem value="generado">Generados</SelectItem>
                    <SelectItem value="timbrado">Timbrados</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-70">Buscar</label>
                <Input
                  placeholder="RFC, IdCCP..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="border-gray-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de cartas porte */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-90 mx-auto" />
              <p className="text-gray-60 mt-4">Cargando historial...</p>
            </div>
          ) : cartasPorte && cartasPorte.length > 0 ? (
            cartasPorte.map((cp) => (
              <Card key={cp.id} className="border-gray-20 shadow-xs hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Primera fila: IdCCP y Estado */}
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-60" />
                        <span className="font-mono font-semibold text-gray-90">
                          {cp.id_ccp || cp.id.substring(0, 8)}
                        </span>
                        {getStatusBadge(cp.status)}
                      </div>

                      {/* Segunda fila: Emisor → Receptor */}
                      <div className="flex items-center gap-2 text-sm text-gray-60">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">{cp.rfc_emisor}</span>
                        <MapPin className="h-4 w-4 mx-1" />
                        <span className="font-medium">{cp.rfc_receptor}</span>
                      </div>

                      {/* Tercera fila: Fecha */}
                      <div className="flex items-center gap-2 text-xs text-gray-50">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(cp.created_at), "PPP 'a las' p", { locale: es })}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/carta-porte/editor/${cp.id}`)}
                        className="border-gray-20"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {cp.xml_generado && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const blob = new Blob([cp.xml_generado], { type: 'application/xml' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `carta-porte-${cp.id_ccp || cp.id}.xml`;
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="border-gray-20"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          XML
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-gray-20 shadow-xs">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-30 mx-auto mb-4" />
                <p className="text-gray-60 mb-2">No se encontraron cartas porte</p>
                <p className="text-sm text-gray-50">
                  Intenta ajustar los filtros o crea tu primera carta porte
                </p>
                <Button
                  onClick={() => navigate('/carta-porte/editor')}
                  className="mt-4"
                  variant="outline"
                >
                  Crear Carta Porte
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
