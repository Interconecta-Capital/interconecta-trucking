
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';

interface ViajesHeaderProps {
  viajesCount: number;
  debugMode: boolean;
}

export function ViajesHeader({ viajesCount, debugMode }: ViajesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Viajes en Curso ({viajesCount})
      </CardTitle>
      {debugMode && (
        <Badge variant="outline" className="text-xs">
          Debug Mode ON
        </Badge>
      )}
    </div>
  );
}
