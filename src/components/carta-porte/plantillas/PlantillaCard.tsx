
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MapPin, 
  Package, 
  Truck, 
  Calendar,
  Users,
  Globe,
  Star,
  MoreVertical,
  Copy,
  Trash2
} from 'lucide-react';
import { PlantillaData } from '@/types/cartaPorte';
import { usePlantillas } from '@/hooks/usePlantillas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface PlantillaCardProps {
  plantilla: PlantillaData;
  onSelect: (plantilla: PlantillaData) => void;
  showActions?: boolean;
  showUsageCount?: boolean;
  showDate?: boolean;
  isPublic?: boolean;
}

export function PlantillaCard({ 
  plantilla, 
  onSelect, 
  showActions = false,
  showUsageCount = false,
  showDate = false,
  isPublic = false
}: PlantillaCardProps) {
  const { eliminarPlantilla, duplicarPlantilla } = usePlantillas();

  const handleEliminar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      try {
        await eliminarPlantilla(plantilla.id);
        toast.success('Plantilla eliminada exitosamente');
      } catch (error) {
        toast.error('Error al eliminar la plantilla');
      }
    }
  };

  const handleDuplicar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await duplicarPlantilla(plantilla.id, `${plantilla.nombre} (Copia)`);
      toast.success('Plantilla duplicada exitosamente');
    } catch (error) {
      toast.error('Error al duplicar la plantilla');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getResumenPlantilla = () => {
    const data = plantilla.template_data;
    return {
      ubicaciones: data.ubicaciones?.length || 0,
      mercancias: data.mercancias?.length || 0,
      tieneTransporte: !!data.autotransporte?.placaVm,
      figuras: data.figuras?.length || 0
    };
  };

  const resumen = getResumenPlantilla();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="truncate">{plantilla.nombre}</span>
              {isPublic && <Globe className="h-4 w-4 text-blue-500" />}
            </CardTitle>
            {plantilla.descripcion && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {plantilla.descripcion}
              </p>
            )}
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicar}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEliminar} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent 
        className="space-y-4"
        onClick={() => onSelect(plantilla)}
      >
        {/* Información del CFDI */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tipo CFDI:</span>
          <Badge variant="secondary">
            {plantilla.template_data.tipoCfdi}
          </Badge>
        </div>

        {/* Resumen de contenido */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{resumen.ubicaciones} ubicaciones</span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-green-500" />
            <span>{resumen.mercancias} mercancías</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-orange-500" />
            <span>{resumen.tieneTransporte ? 'Con vehículo' : 'Sin vehículo'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>{resumen.figuras} figuras</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          {showUsageCount && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Usado {plantilla.uso_count} veces</span>
            </div>
          )}
          
          {showDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(plantilla.updated_at)}</span>
            </div>
          )}
          
          {isPublic && (
            <div className="text-blue-600">
              <span>Plantilla pública</span>
            </div>
          )}
        </div>

        {/* Botón de selección */}
        <Button 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(plantilla);
          }}
        >
          Usar esta Plantilla
        </Button>
      </CardContent>
    </Card>
  );
}
