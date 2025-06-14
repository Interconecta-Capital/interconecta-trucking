
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Route } from 'lucide-react';

interface UbicacionesRouteInfoProps {
  rutaCalculada: any;
  showForm: boolean;
  showMap: boolean;
  onToggleMap: () => void;
}

export function UbicacionesRouteInfo({
  rutaCalculada,
  showForm,
  showMap,
  onToggleMap
}: UbicacionesRouteInfoProps) {
  if (!rutaCalculada || showForm) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Información de Ruta</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-muted-foreground">Distancia: </span>
              <span className="font-medium">{rutaCalculada.distance} km</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tiempo: </span>
              <span className="font-medium">{rutaCalculada.duration} min</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleMap}
            >
              {showMap ? 'Ocultar' : 'Ver'} Mapa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
