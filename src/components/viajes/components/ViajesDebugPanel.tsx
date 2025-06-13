
import { Button } from '@/components/ui/button';

interface ViajesDebugPanelProps {
  viajesCount: number;
  isLoading: boolean;
  error: string | null;
  onToggleDebug: () => void;
}

export function ViajesDebugPanel({ 
  viajesCount, 
  isLoading, 
  error, 
  onToggleDebug 
}: ViajesDebugPanelProps) {
  return (
    <div className="mt-4 p-3 bg-gray-50 border rounded text-xs">
      <strong>Debug Panel:</strong>
      <br />
      - Total viajes: {viajesCount}
      <br />
      - Loading: {isLoading.toString()}
      <br />
      - Error: {error || 'None'}
      <br />
      <Button 
        size="sm" 
        variant="outline" 
        className="mt-2 text-xs h-6"
        onClick={onToggleDebug}
      >
        Desactivar Debug
      </Button>
    </div>
  );
}
