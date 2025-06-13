
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock } from 'lucide-react';
import type { Viaje } from '@/hooks/viajes/types';

interface ViajeCardProps {
  viaje: Viaje;
  onVerTracking: (viaje: Viaje) => void;
  debugMode?: boolean;
}

export function ViajeCard({ viaje, onVerTracking, debugMode }: ViajeCardProps) {
  console.log('[ViajeCard] Rendering viaje:', viaje.id);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Carta Porte: {viaje.carta_porte_id}</h3>
            <Badge variant={viaje.estado === 'en_transito' ? 'default' : 'secondary'}>
              {viaje.estado.replace('_', ' ')}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onVerTracking(viaje)}
          >
            Ver Tracking
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium">Origen:</span> {viaje.origen}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="font-medium">Destino:</span> {viaje.destino}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Inicio programado:</span> 
              {new Date(viaje.fecha_inicio_programada).toLocaleString('es-MX')}
            </div>
            {viaje.fecha_inicio_real && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-medium">Inicio real:</span> 
                {new Date(viaje.fecha_inicio_real).toLocaleString('es-MX')}
              </div>
            )}
          </div>
        </div>
        
        {viaje.observaciones && (
          <div className="mt-3 p-2 bg-muted rounded text-sm">
            <span className="font-medium">Observaciones:</span> {viaje.observaciones}
          </div>
        )}
        
        {debugMode && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <strong>Debug Info:</strong> ID: {viaje.id}, User: {viaje.user_id}, Created: {viaje.created_at}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
