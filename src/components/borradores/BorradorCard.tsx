
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy, ArrowRight, Clock, Save } from 'lucide-react';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';

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
  const fechaEdicion = new Date(borrador.ultima_edicion);
  const esReciente = Date.now() - fechaEdicion.getTime() < 24 * 60 * 60 * 1000;

  const getDatosResumen = () => {
    const datos = borrador.datos_formulario;
    const configuracion = datos?.configuracion || {};
    const emisor = configuracion.emisor || {};
    const receptor = configuracion.receptor || {};
    
    return {
      emisor: emisor.nombre || 'Sin definir',
      receptor: receptor.nombre || 'Sin definir',
      ubicaciones: datos?.ubicaciones?.length || 0,
      mercancias: datos?.mercancias?.length || 0
    };
  };

  const resumen = getDatosResumen();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" title={borrador.nombre_borrador}>
              {borrador.nombre_borrador}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {borrador.auto_saved && (
                <Badge variant="outline" className="text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Auto
                </Badge>
              )}
              {esReciente && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Reciente
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Resumen de datos */}
        <div className="text-xs space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Emisor:</span>
              <p className="truncate" title={resumen.emisor}>{resumen.emisor}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Receptor:</span>
              <p className="truncate" title={resumen.receptor}>{resumen.receptor}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Ubicaciones:</span>
              <p>{resumen.ubicaciones}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Mercancías:</span>
              <p>{resumen.mercancias}</p>
            </div>
          </div>
        </div>

        {/* Fecha de última edición */}
        <div className="text-xs text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          {fechaEdicion.toLocaleDateString()} {fechaEdicion.toLocaleTimeString()}
        </div>

        {/* Acciones */}
        <div className="flex gap-1 pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={onEditar}
            className="flex-1 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onConvertir}
            className="flex-1 text-xs"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            Finalizar
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDuplicar}
            className="flex-1 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEliminar}
            className="flex-1 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
