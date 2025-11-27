import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Users, BarChart3, TrendingUp, Truck, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Socio {
  id: string;
  nombre_razon_social: string;
  rfc: string;
  email: string;
  estado: string;
  activo: boolean;
  tipo_persona?: string;
}

interface SociosTableProps {
  socios: Socio[];
  loading: boolean;
  onEdit?: (socio: Socio) => void;
  onView?: (socio: Socio) => void;
  onDelete?: (socio: Socio) => void;
}

interface AnalysisData {
  totalViajes: number;
  viajesCompletados: number;
  montoTotalFacturado: number;
  ultimoViaje: string | null;
}

export function SociosTable({ socios, loading, onEdit, onView, onDelete }: SociosTableProps) {
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Query para análisis de socio seleccionado
  const { data: analysisData, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['socio-analysis', selectedSocio?.id],
    queryFn: async (): Promise<AnalysisData> => {
      if (!selectedSocio) return { totalViajes: 0, viajesCompletados: 0, montoTotalFacturado: 0, ultimoViaje: null };

      // Obtener viajes asociados al socio
      const { data: viajes } = await supabase
        .from('viajes')
        .select('id, estado, precio_cobrado, created_at')
        .eq('socio_id', selectedSocio.id);

      const totalViajes = viajes?.length || 0;
      const viajesCompletados = viajes?.filter(v => v.estado === 'completado').length || 0;
      const montoTotalFacturado = viajes?.reduce((acc, v) => acc + (v.precio_cobrado || 0), 0) || 0;
      const ultimoViaje = viajes?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at || null;

      return {
        totalViajes,
        viajesCompletados,
        montoTotalFacturado,
        ultimoViaje
      };
    },
    enabled: !!selectedSocio && showAnalysis
  });

  const handleAnalizar = (socio: Socio) => {
    setSelectedSocio(socio);
    setShowAnalysis(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando socios...</div>
        </CardContent>
      </Card>
    );
  }

  if (socios.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay socios registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500 text-white';
      case 'inactivo':
        return 'bg-gray-500 text-white';
      case 'suspendido':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTipoPersonaBadge = (tipo: string | undefined) => {
    switch (tipo) {
      case 'fisica':
        return { label: 'Persona Física', variant: 'outline' as const };
      case 'moral':
        return { label: 'Persona Moral', variant: 'secondary' as const };
      default:
        return { label: 'No especificado', variant: 'outline' as const };
    }
  };

  return (
    <>
      <div className="space-y-4">
        {socios.map((socio) => {
          const tipoBadge = getTipoPersonaBadge(socio.tipo_persona);

          return (
            <Card key={socio.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{socio.nombre_razon_social}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getEstadoBadgeColor(socio.estado)}>
                      {socio.estado}
                    </Badge>
                    <Badge variant={tipoBadge.variant}>
                      {tipoBadge.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">RFC</p>
                    <p className="font-medium font-mono">{socio.rfc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{socio.email || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {onView && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onView(socio)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  )}
                  {onEdit && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEdit(socio)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAnalizar(socio)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analizar
                  </Button>
                  {onDelete && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDelete(socio)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de Análisis */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Análisis de {selectedSocio?.nombre_razon_social}
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingAnalysis ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Total Viajes
                </div>
                <div className="text-2xl font-bold">{analysisData?.totalViajes || 0}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Completados
                </div>
                <div className="text-2xl font-bold text-green-600">{analysisData?.viajesCompletados || 0}</div>
              </div>
              <div className="col-span-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Monto Total Facturado
                </div>
                <div className="text-2xl font-bold text-primary">
                  ${(analysisData?.montoTotalFacturado || 0).toLocaleString('es-MX')} MXN
                </div>
              </div>
              {analysisData?.ultimoViaje && (
                <div className="col-span-2 text-sm text-muted-foreground">
                  Último viaje: {new Date(analysisData.ultimoViaje).toLocaleDateString('es-MX')}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
