import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Download, Eye, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Factura {
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
}

export default function Facturas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const { data: facturas, isLoading, refetch } = useQuery({
    queryKey: ['facturas', filtroTipo, filtroStatus],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No autenticado');

      let query = supabase
        .from('facturas')
        .select('*')
        .eq('user_id', user.user.id)
        .order('fecha_expedicion', { ascending: false });

      if (filtroTipo !== 'todos') {
        query = query.eq('tipo_comprobante', filtroTipo);
      }

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Factura[];
    }
  });

  const facturasFiltradas = facturas?.filter(factura => {
    const matchesSearch = !searchTerm ||
      factura.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.rfc_receptor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.nombre_receptor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'Borrador', variant: 'secondary' as const },
      timbrado: { label: 'Timbrado', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const }
    };
    return <Badge variant={config[status as keyof typeof config]?.variant}>{config[status as keyof typeof config]?.label}</Badge>;
  };

  const getTipoComprobanteBadge = (tipo: string) => {
    const config = {
      I: { label: 'Ingreso', color: 'bg-green-100 text-green-800' },
      E: { label: 'Egreso', color: 'bg-red-100 text-red-800' },
      T: { label: 'Traslado', color: 'bg-blue-100 text-blue-800' },
      N: { label: 'Nómina', color: 'bg-purple-100 text-purple-800' },
      P: { label: 'Pago', color: 'bg-yellow-100 text-yellow-800' }
    };
    const cfg = config[tipo as keyof typeof config] || { label: tipo, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={cfg.color}>{cfg.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Facturas</h1>
        </div>
        <Button onClick={() => navigate('/administracion/fiscal/facturas/nuevo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por folio, RFC o nombre del receptor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-input rounded-md px-3 py-2 bg-background"
          >
            <option value="todos">Todos los tipos</option>
            <option value="I">Ingreso</option>
            <option value="E">Egreso</option>
            <option value="T">Traslado</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-input rounded-md px-3 py-2 bg-background"
          >
            <option value="todos">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="timbrado">Timbrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Receptor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>CP</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : facturasFiltradas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No hay facturas. <Button variant="link" onClick={() => navigate('/administracion/fiscal/facturas/nuevo')}>Crear primera factura</Button>
                  </TableCell>
                </TableRow>
              ) : (
                facturasFiltradas?.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell className="font-medium">
                      {factura.serie && factura.folio ? `${factura.serie}-${factura.folio}` : factura.uuid_fiscal?.slice(0, 8) || 'Sin folio'}
                    </TableCell>
                    <TableCell>{getTipoComprobanteBadge(factura.tipo_comprobante)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{factura.nombre_receptor}</div>
                        <div className="text-sm text-muted-foreground">{factura.rfc_receptor}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${factura.total.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(factura.fecha_expedicion), 'dd/MM/yyyy', { locale: es })}</TableCell>
                    <TableCell>{getStatusBadge(factura.status)}</TableCell>
                    <TableCell>
                      {factura.tiene_carta_porte ? (
                        <Badge variant="outline" className="bg-green-50">
                          ✓ Vinculada
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/administracion/fiscal/facturas/${factura.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {factura.status === 'timbrado' && (
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {factura.status === 'draft' && (
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
