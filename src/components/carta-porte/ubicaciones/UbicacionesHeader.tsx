
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Calculator, Route } from 'lucide-react';

interface UbicacionesHeaderProps {
  showForm: boolean;
  ubicacionesCount: number;
  onAddUbicacion: (e: React.MouseEvent) => void;
  onCalcularDistancias: (e: React.MouseEvent) => void;
  onCalcularRuta: (e: React.MouseEvent) => void;
}

export function UbicacionesHeader({
  showForm,
  ubicacionesCount,
  onAddUbicacion,
  onCalcularDistancias,
  onCalcularRuta
}: UbicacionesHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Gestión de Ubicaciones</span>
        </CardTitle>
        
        {!showForm && (
          <div className="flex flex-wrap gap-2">
            {ubicacionesCount >= 2 && (
              <>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onCalcularDistancias}
                  className="flex items-center space-x-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calcular Distancias</span>
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onCalcularRuta}
                  className="flex items-center space-x-2"
                >
                  <Route className="h-4 w-4" />
                  <span>Ver Ruta</span>
                </Button>
              </>
            )}
            
            <Button 
              type="button"
              onClick={onAddUbicacion} 
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Ubicación</span>
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );
}
