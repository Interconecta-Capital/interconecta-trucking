
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';
import { Ubicacion, UbicacionFrecuente } from '@/hooks/useUbicaciones';

interface UbicacionFormHeaderProps {
  ubicacion?: Ubicacion;
  ubicacionesFrecuentes: UbicacionFrecuente[];
  onToggleFrecuentes: () => void;
}

export function UbicacionFormHeader({ 
  ubicacion, 
  ubicacionesFrecuentes, 
  onToggleFrecuentes 
}: UbicacionFormHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>{ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}</span>
        </CardTitle>
        
        <div className="flex space-x-2">
          {ubicacionesFrecuentes.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleFrecuentes}
            >
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
