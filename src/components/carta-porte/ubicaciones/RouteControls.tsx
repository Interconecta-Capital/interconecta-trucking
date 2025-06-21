
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, MapPin, Navigation } from 'lucide-react';

interface RouteControlsProps {
  origen?: any;
  destino?: any;
  intermedios: any[];
  isCalculating: boolean;
  onRecalculate: () => void;
}

export function RouteControls({ 
  origen, 
  destino, 
  intermedios, 
  isCalculating, 
  onRecalculate 
}: RouteControlsProps) {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Ubicaciones:</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {origen && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Origen</span>
                </div>
              )}
              
              {intermedios.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{intermedios.length} intermedio{intermedios.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {destino && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Destino</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRecalculate}
              disabled={isCalculating || !origen || !destino}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isCalculating ? 'animate-spin' : ''}`} />
              Recalcular
            </Button>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Navigation className="h-3 w-3" />
              <span>Auto-cálculo activo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
