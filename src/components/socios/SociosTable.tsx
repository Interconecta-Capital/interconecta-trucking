
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, BarChart3, Activity, TrendingUp, Users, Clock } from 'lucide-react';
import { SocioDetailPanel } from './SocioDetailPanel';

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

export function SociosTable({ socios, loading, onEdit, onView, onDelete }: SociosTableProps) {
  const [selectedSocio, setSelectedSocio] = useState<any>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const handleAnalyze = (socio: any) => {
    setSelectedSocio(socio);
    setIsDetailPanelOpen(true);
  };

  const getActivityIndicator = (socio: any) => {
    // Simulamos un indicador de actividad basado en el ID
    const isActive = socio.id.slice(-1) !== '0';
    return isActive ? (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600">Activo</span>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-xs text-muted-foreground">Inactivo</span>
      </div>
    );
  };

  const getPerformanceMetrics = (socio: any) => {
    // Simulamos métricas básicas
    const cartasPorte = Math.floor(Math.random() * 50) + 10;
    const eficiencia = Math.floor(Math.random() * 30) + 70;
    return { cartasPorte, eficiencia };
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
          const metrics = getPerformanceMetrics(socio);

          return (
            <Card key={socio.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{socio.nombre_razon_social}</CardTitle>
                    </div>
                    {getActivityIndicator(socio)}
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
                
                {/* Métricas rápidas */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span>{metrics.cartasPorte} CP</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{metrics.eficiencia}% eficiencia</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Última actividad: 2 días</span>
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
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleAnalyze(socio)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analizar
                </Button>
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
      
      {/* Panel de análisis detallado */}
      <SocioDetailPanel
        socio={selectedSocio}
        open={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
      />
    </>
  );
}
