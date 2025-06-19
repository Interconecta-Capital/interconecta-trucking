
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Download, 
  Copy, 
  Clock, 
  FileText,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BorradorCardProps {
  borrador: BorradorCartaPorte;
  onEditar: () => void;
  onConvertir: () => void;
  onEliminar: () => void;
  onDuplicar: () => void;
}

export function BorradorCard({ 
  borrador, 
  onEditar, 
  onConvertir, 
  onEliminar, 
  onDuplicar 
}: BorradorCardProps) {
  
  const getCompletitudBorrador = () => {
    const datos = borrador.datos_formulario || {};
    let completitud = 0;
    let total = 5; // Total de secciones principales

    // Verificar configuración básica
    if (datos.configuracion?.emisor?.rfc && datos.configuracion?.receptor?.rfc) {
      completitud++;
    }

    // Verificar ubicaciones
    if (datos.ubicaciones?.length >= 2) {
      completitud++;
    }

    // Verificar mercancías
    if (datos.mercancias?.length > 0) {
      completitud++;
    }

    // Verificar autotransporte
    if (datos.autotransporte?.placa_vm) {
      completitud++;
    }

    // Verificar figuras
    if (datos.figuras?.length > 0) {
      completitud++;
    }

    return { completitud, total, porcentaje: Math.round((completitud / total) * 100) };
  };

  const { completitud, total, porcentaje } = getCompletitudBorrador();
  const ultimaEdicion = formatDistanceToNow(new Date(borrador.ultima_edicion), { 
    addSuffix: true, 
    locale: es 
  });

  const getBadgeColor = (porcentaje: number) => {
    if (porcentaje >= 80) return 'bg-green-100 text-green-800';
    if (porcentaje >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (porcentaje: number) => {
    if (porcentaje >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (porcentaje >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" title={borrador.nombre_borrador}>
              {borrador.nombre_borrador}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                v{borrador.version_formulario}
              </Badge>
              {borrador.auto_saved && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="h-3 w-3" />
                        Auto
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Guardado automáticamente</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          {getStatusIcon(porcentaje)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Indicador de completitud */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completitud</span>
            <span className={`font-medium ${porcentaje >= 80 ? 'text-green-600' : porcentaje >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {completitud}/{total} ({porcentaje}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                porcentaje >= 80 ? 'bg-green-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Información de contenido */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{borrador.datos_formulario?.mercancias?.length || 0} mercancías</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{ultimaEdicion}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEditar}
                  className="flex-1 gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Continuar editando el borrador</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onConvertir}
                  disabled={porcentaje < 50}
                  className="flex-1 gap-1"
                >
                  <Download className="h-3 w-3" />
                  Convertir
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {porcentaje >= 50 
                    ? 'Convertir a Carta Porte oficial' 
                    : 'Completa más información para convertir'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Acciones secundarias */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDuplicar}
                  className="flex-1 gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Duplicar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Crear una copia de este borrador</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onEliminar}
                  className="flex-1 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar este borrador permanentemente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
