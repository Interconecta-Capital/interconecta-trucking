
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionesSectionHeaderProps {
  ubicaciones: UbicacionCompleta[];
  showMap: boolean;
  onAddUbicacion: () => void;
  onToggleMap: () => void;
}

export function UbicacionesSectionHeader({ 
  ubicaciones, 
  showMap, 
  onAddUbicacion, 
  onToggleMap 
}: UbicacionesSectionHeaderProps) {
  return (
    <CardTitle className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Ubicaciones de Transporte
        <Badge variant="outline">{ubicaciones.length} ubicación(es)</Badge>
      </div>
      <div className="flex gap-2">
        <Button onClick={onAddUbicacion} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Ubicación
        </Button>
        {ubicaciones.length > 0 && (
          <Button
            variant="outline"
            onClick={onToggleMap}
          >
            {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
          </Button>
        )}
      </div>
    </CardTitle>
  );
}
