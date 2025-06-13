
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useViajesEstados } from '@/hooks/useViajesEstados';
import { TrackingModal } from './modals/TrackingModal';
import { ViajesHeader } from './components/ViajesHeader';
import { ViajesErrorDisplay } from './components/ViajesErrorDisplay';
import { ViajesLoadingState } from './components/ViajesLoadingState';
import { ViajesEmptyState } from './components/ViajesEmptyState';
import { ViajeCard } from './components/ViajeCard';
import { ViajesDebugPanel } from './components/ViajesDebugPanel';

export function ViajesActivos() {
  const { 
    viajesActivos, 
    isLoading, 
    error, 
    clearError,
    enableDebugMode,
    debugMode,
    logInfo,
    logError
  } = useViajesEstados();
  
  const [trackingModal, setTrackingModal] = useState<{ open: boolean; viaje: any }>({
    open: false,
    viaje: null
  });

  // Log del estado del componente
  useEffect(() => {
    logInfo('ViajesActivos', 'Component state:', {
      viajesCount: viajesActivos.length,
      loading: isLoading,
      hasError: !!error,
      debugMode
    });
  }, [viajesActivos.length, isLoading, error, debugMode, logInfo]);

  const handleVerTracking = (viaje: any) => {
    logInfo('ViajesActivos', 'Opening tracking modal for viaje:', viaje.id);
    setTrackingModal({ open: true, viaje });
  };

  const handleRetry = () => {
    logInfo('ViajesActivos', 'Retrying data load...');
    clearError();
    window.location.reload();
  };

  const handleToggleDebug = () => {
    if (debugMode) {
      logInfo('ViajesActivos', 'Disabling debug mode');
    } else {
      logInfo('ViajesActivos', 'Enabling debug mode');
      enableDebugMode();
    }
  };

  // Mostrar error si existe
  if (error) {
    logError('ViajesActivos', 'Rendering error state:', error);
    
    return (
      <ViajesErrorDisplay
        error={error}
        onRetry={handleRetry}
        onToggleDebug={handleToggleDebug}
        debugMode={debugMode}
      />
    );
  }

  // Mostrar loading
  if (isLoading) {
    logInfo('ViajesActivos', 'Rendering loading state');
    return <ViajesLoadingState />;
  }

  logInfo('ViajesActivos', 'Rendering viajes list with', viajesActivos.length, 'items');

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <ViajesHeader 
              viajesCount={viajesActivos.length} 
              debugMode={debugMode} 
            />
          </CardHeader>
          <CardContent>
            {viajesActivos.length === 0 ? (
              <ViajesEmptyState />
            ) : (
              <div className="grid gap-4">
                {viajesActivos.map((viaje) => (
                  <ViajeCard
                    key={viaje.id}
                    viaje={viaje}
                    onVerTracking={handleVerTracking}
                    debugMode={debugMode}
                  />
                ))}
              </div>
            )}
            
            {debugMode && (
              <ViajesDebugPanel
                viajesCount={viajesActivos.length}
                isLoading={isLoading}
                error={error?.message || null}
                onToggleDebug={handleToggleDebug}
              />
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
