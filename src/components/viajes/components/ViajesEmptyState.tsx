
import { Truck } from 'lucide-react';

export function ViajesEmptyState() {
  return (
    <div className="text-center py-8">
      <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No hay viajes activos en este momento</p>
      <p className="text-sm text-muted-foreground mt-2">
        Los viajes aparecerán aquí cuando estén programados o en tránsito
      </p>
    </div>
  );
}
