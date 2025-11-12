import { MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UbicacionDistanciaDisplayProps {
  ubicacion: any;
  distanciaTotal?: number;
}

export function UbicacionDistanciaDisplay({ 
  ubicacion, 
  distanciaTotal 
}: UbicacionDistanciaDisplayProps) {
  const tipoUbicacion = ubicacion.tipo_ubicacion || ubicacion.tipoUbicacion;
  const coordenadas = ubicacion.coordenadas;
  const distancia = ubicacion.distancia_recorrida || ubicacion.distanciaRecorrida;
  
  // Solo mostrar para destinos
  if (tipoUbicacion !== 'Destino') return null;
  
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
      {/* Coordenadas */}
      {coordenadas && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">Coordenadas:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {coordenadas.latitud?.toFixed(6)}, {coordenadas.longitud?.toFixed(6)}
          </Badge>
        </div>
      )}
      
      {/* Distancia */}
      <div className="flex items-center gap-2 text-sm">
        <Navigation className="h-4 w-4 text-green-600" />
        <span className="font-medium text-blue-900">Distancia:</span>
        {distancia > 0 ? (
          <Badge className="bg-green-100 text-green-800">
            ✅ {distancia.toFixed(2)} km
          </Badge>
        ) : distanciaTotal > 0 ? (
          <Badge className="bg-yellow-100 text-yellow-800">
            ⚠️ {distanciaTotal.toFixed(2)} km (calculada, no guardada)
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-600">
            ⚠️ Sin calcular
          </Badge>
        )}
      </div>
      
      {/* Mensaje de ayuda */}
      {(!distancia || distancia === 0) && distanciaTotal > 0 && (
        <p className="text-xs text-yellow-700 mt-2">
          ⚠️ La distancia fue calculada pero no se guardó correctamente. 
          Haz clic en "Recalcular" para intentar de nuevo.
        </p>
      )}
    </div>
  );
}
