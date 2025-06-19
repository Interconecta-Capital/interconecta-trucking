
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ubicacion } from '@/types/ubicaciones';

interface RouteControlsProps {
  origen?: Ubicacion;
  destino?: Ubicacion;
  intermedios: Ubicacion[];
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
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-gray-600">
          <strong>Ruta:</strong> {origen?.nombreRemitenteDestinatario || 'Origen'} → {destino?.nombreRemitenteDestinatario || 'Destino'}
          {intermedios.length > 0 && ` (${intermedios.length} parada${intermedios.length > 1 ? 's' : ''} intermedia${intermedios.length > 1 ? 's' : ''})`}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRecalculate}
          disabled={isCalculating}
          className="text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isCalculating ? 'animate-spin' : ''}`} />
          Recalcular
        </Button>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
        <strong>Nota:</strong> La distancia se calcula automáticamente usando rutas reales de Mapbox.
        Esta es la distancia que aparecerá en tu PDF de Carta Porte.
      </div>
    </div>
  );
}
