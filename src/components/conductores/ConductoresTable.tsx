import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conductor } from '@/types/cartaPorte';
import { MoreHorizontal, Eye, Edit, Trash2, User, IdCard, Phone, AlertTriangle, BarChart3, Truck, Star, Route } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConductoresTableProps {
  conductores: Conductor[];
  onEdit: (conductor: Conductor) => void;
  onDelete: (conductor: Conductor) => void;
  onView: (conductor: Conductor) => void;
}

interface AnalysisData {
  totalViajes: number;
  viajesCompletados: number;
  calificacionPromedio: number;
  distanciaTotal: number;
  ultimoViaje: string | null;
}

export function ConductoresTable({ conductores, onEdit, onDelete, onView }: ConductoresTableProps) {
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Query para análisis de conductor seleccionado
  const { data: analysisData, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['conductor-analysis', selectedConductor?.id],
    queryFn: async (): Promise<AnalysisData> => {
      if (!selectedConductor) return { totalViajes: 0, viajesCompletados: 0, calificacionPromedio: 0, distanciaTotal: 0, ultimoViaje: null };

      // Obtener viajes asociados al conductor
      const { data: viajes } = await supabase
        .from('viajes')
        .select('id, estado, distancia_km, created_at')
        .eq('conductor_id', selectedConductor.id);

      // Obtener calificaciones del conductor
      const { data: calificaciones } = await supabase
        .from('calificaciones_conductores')
        .select('calificacion')
        .eq('conductor_id', selectedConductor.id);

      const totalViajes = viajes?.length || 0;
      const viajesCompletados = viajes?.filter(v => v.estado === 'completado').length || 0;
      const distanciaTotal = viajes?.reduce((acc, v) => acc + (v.distancia_km || 0), 0) || 0;
      const ultimoViaje = viajes?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at || null;
      
      const calificacionPromedio = calificaciones?.length 
        ? calificaciones.reduce((acc, c) => acc + (c.calificacion || 0), 0) / calificaciones.length
        : 0;

      return {
        totalViajes,
        viajesCompletados,
        calificacionPromedio,
        distanciaTotal,
        ultimoViaje
      };
    },
    enabled: !!selectedConductor && showAnalysis
  });

  const handleAnalizar = (conductor: Conductor) => {
    setSelectedConductor(conductor);
    setShowAnalysis(true);
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      disponible: 'bg-green-50 text-green-700 border-green-200',
      en_viaje: 'bg-blue-50 text-blue-700 border-blue-200',
      descanso: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      inactivo: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return variants[estado as keyof typeof variants] || variants.inactivo;
  };

  const isLicenseExpiringSoon = (vigencia: string | null) => {
    if (!vigencia) return false;
    const today = new Date();
    const expiryDate = new Date(vigencia);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  if (conductores.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay conductores registrados</h3>
          <p className="text-muted-foreground">Comienza agregando el primer conductor al sistema.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conductores.map((conductor) => (
          <Card key={conductor.id} className="group hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {conductor.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {conductor.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {conductor.rfc || 'Sin RFC'}
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(conductor)} className="cursor-pointer">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(conductor)} className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAnalizar(conductor)} className="cursor-pointer">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analizar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(conductor)} 
                      className="cursor-pointer text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <Badge className={getEstadoBadge(conductor.estado)}>
                    {conductor.estado?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {conductor.num_licencia && (
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Licencia: {conductor.num_licencia}
                      {conductor.tipo_licencia && ` (${conductor.tipo_licencia})`}
                    </span>
                  </div>
                )}

                {conductor.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{conductor.telefono}</span>
                  </div>
                )}

                {isLicenseExpiringSoon(conductor.vigencia_licencia) && (
                  <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm text-warning">Licencia próxima a vencer</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onView(conductor)}
                    className="flex-1"
                  >
                    Ver Detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAnalizar(conductor)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Análisis */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Análisis de {selectedConductor?.nombre}
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
                  <Route className="h-4 w-4" />
                  Completados
                </div>
                <div className="text-2xl font-bold text-green-600">{analysisData?.viajesCompletados || 0}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Calificación
                </div>
                <div className="text-2xl font-bold text-amber-500">
                  {analysisData?.calificacionPromedio ? analysisData.calificacionPromedio.toFixed(1) : 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Distancia
                </div>
                <div className="text-xl font-bold text-primary">
                  {(analysisData?.distanciaTotal || 0).toLocaleString('es-MX')} km
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
