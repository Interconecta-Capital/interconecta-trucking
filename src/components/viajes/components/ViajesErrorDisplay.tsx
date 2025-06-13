
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ViajesError } from '@/hooks/viajes/useViajesErrors';

interface ViajesErrorDisplayProps {
  error: ViajesError;
  onRetry: () => void;
  onToggleDebug: () => void;
  debugMode: boolean;
}

export function ViajesErrorDisplay({ 
  error, 
  onRetry, 
  onToggleDebug, 
  debugMode 
}: ViajesErrorDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          Error al Cargar Viajes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error.message}
            <br />
            <small className="text-muted-foreground">
              Tipo: {error.type} | Contexto: {error.context || 'N/A'}
            </small>
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button variant="outline" onClick={onToggleDebug}>
            {debugMode ? 'Desactivar' : 'Activar'} Debug
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
