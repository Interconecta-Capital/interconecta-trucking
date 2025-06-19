
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { DistanceCalculationService } from '@/services/distanceCalculationService';

interface MapboxStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function MapboxStatusIndicator({ 
  showDetails = false, 
  className = "" 
}: MapboxStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkMapboxStatus = async () => {
      setStatus('checking');
      
      try {
        const isAvailable = await DistanceCalculationService.validarDisponibilidadMapbox();
        
        if (isAvailable) {
          setStatus('available');
          setErrorMessage('');
        } else {
          setStatus('unavailable');
          setErrorMessage('Mapbox no está disponible. Se usarán estimaciones por código postal.');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Error validando Mapbox');
      }
    };

    checkMapboxStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'available':
        return <CheckCircle className="h-3 w-3" />;
      case 'unavailable':
        return <AlertTriangle className="h-3 w-3" />;
      case 'error':
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'unavailable':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Verificando Mapbox...';
      case 'available':
        return 'Mapbox Activo';
      case 'unavailable':
        return 'Mapbox No Disponible';
      case 'error':
        return 'Error Mapbox';
    }
  };

  return (
    <div className={className}>
      <Badge variant="outline" className={`${getStatusColor()} border-current`}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
      
      {showDetails && (status === 'unavailable' || status === 'error') && errorMessage && (
        <Alert variant={status === 'error' ? 'destructive' : 'default'} className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {errorMessage}
            {status === 'unavailable' && (
              <div className="mt-1">
                <strong>Nota:</strong> Las distancias se calcularán usando estimaciones por código postal.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
