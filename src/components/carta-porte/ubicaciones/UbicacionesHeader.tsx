
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Navigation, Map } from 'lucide-react';

interface UbicacionesHeaderProps {
  ubicacionesCount: number;
  canCalculateDistances: boolean;
  onAgregarUbicacion: () => void;
  onCalcularDistancias: () => void;
  onCalcularRuta: () => void;
}

export function UbicacionesHeader({
  ubicacionesCount,
  canCalculateDistances,
  onAgregarUbicacion,
  onCalcularDistancias,
  onCalcularRuta,
}: UbicacionesHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Ubicaciones de Carga y Descarga</span>
          {ubicacionesCount > 0 && (
            <Badge variant="secondary">
              {ubicacionesCount} ubicación(es)
            </Badge>
          )}
        </CardTitle>
        
        <div className="flex space-x-2">
          {canCalculateDistances && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCalcularDistancias}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Calcular Distancias
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCalcularRuta}
              >
                <Map className="h-4 w-4 mr-2" />
                Ver Ruta
              </Button>
            </>
          )}
          
          <Button
            type="button"
            onClick={onAgregarUbicacion}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ubicación
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
