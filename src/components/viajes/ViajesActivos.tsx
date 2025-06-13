
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, MapPin, Clock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useViajesEstados } from '@/hooks/useViajesEstados';
import { TrackingModal } from './modals/TrackingModal';

export function ViajesActivos() {
  const { 
    viajesActivos, 
    isLoading, 
    error, 
    clearError,
    enableDebugMode,
    debugMode 
  } = useViajesEstados();
  
  const [trackingModal, setTrackingModal] = useState<{ open: boolean; viaje: any }>({
    open: false,
    viaje: null
  });

  // Log del estado del componente
  useEffect(() => {
    console.log('[ViajesActivos] Component state:', {
      viajesCount: viajesActivos.length,
      loading: isLoading,
      hasError: !!error,
      debugMode
    });
  }, [viajesActivos.length, isLoading, error, debugMode]);

  const handleVerTracking = (viaje: any) => {
    console.log('[ViajesActivos] Opening tracking modal for viaje:', viaje.id);
    setTrackingModal({ open: true, viaje });
  };

  const handleRetry = () => {
    console.log('[ViajesActivos] Retrying data load...');
    clearError();
    window.location.reload(); // Simple retry mechanism
  };

  const handleToggleDebug = () => {
    if (debugMode) {
      console.log('[ViajesActivos] Disabling debug mode');
    } else {
      console.log('[ViajesActivos] Enabling debug mode');
      enableDebugMode();
    }
  };

  // Mostrar error si existe
  if (error) {
    console.error('[ViajesActivos] Rendering error state:', error);
    
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
                Tipo: {error.type} | Detalles: {error.details?.code || 'N/A'}
              </small>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={handleToggleDebug}>
              {debugMode ? 'Desactivar' : 'Activar'} Debug
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar loading
  if (isLoading) {
    console.log('[ViajesActivos] Rendering loading state');
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando viajes activos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Obteniendo datos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('[ViajesActivos] Rendering viajes list with', viajesActivos.length, 'items');

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Viajes en Curso ({viajesActivos.length})
              </CardTitle>
              {debugMode && (
                <Badge variant="outline" className="text-xs">
                  Debug Mode ON
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {viajesActivos.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay viajes activos en este momento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Los viajes aparecerán aquí cuando estén programados o en tránsito
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {viajesActivos.map((viaje) => {
                  console.log('[ViajesActivos] Rendering viaje:', viaje.id);
                  
                  return (
                    <Card key={viaje.id} className="hover:shadow-md transition-shadow">
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
                            onClick={() => handleVerTracking(viaje)}
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
                })}
              </div>
            )}
            
            {debugMode && (
              <div className="mt-4 p-3 bg-gray-50 border rounded text-xs">
                <strong>Debug Panel:</strong>
                <br />
                - Total viajes: {viajesActivos.length}
                <br />
                - Loading: {isLoading.toString()}
                <br />
                - Error: {error ? error.message : 'None'}
                <br />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 text-xs h-6"
                  onClick={handleToggleDebug}
                >
                  Desactivar Debug
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TrackingModal
        open={trackingModal.open}
        onOpenChange={(open) => setTrackingModal({ open, viaje: trackingModal.viaje })}
        viaje={trackingModal.viaje}
      />
    </>
  );
}
