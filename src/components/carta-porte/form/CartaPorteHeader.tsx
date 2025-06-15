
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, InfoIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartaPorteHeaderProps {
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  onGuardarBorrador: () => Promise<void>;
  onLimpiarBorrador: () => Promise<void>;
  onGuardarYSalir?: () => Promise<void>;
  isGuardando?: boolean;
}

export function CartaPorteHeader({ 
  borradorCargado, 
  ultimoGuardado, 
  onGuardarBorrador, 
  onLimpiarBorrador,
  onGuardarYSalir,
  isGuardando = false
}: CartaPorteHeaderProps) {
  const [showSaved, setShowSaved] = useState(false);

  const handleGuardar = async () => {
    try {
      await onGuardarBorrador();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleGuardarYSalir = async () => {
    if (onGuardarYSalir) {
      await onGuardarYSalir();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Carta Porte</h1>
          <p className="text-gray-600 mt-2">
            Crea un nuevo comprobante fiscal digital de carta porte
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {ultimoGuardado && (
            <div className="text-sm text-gray-500 flex items-center space-x-1">
              <Save className="h-4 w-4" />
              <span>Guardado: {formatTime(ultimoGuardado)}</span>
            </div>
          )}
          
          {isGuardando && (
            <div className="text-sm text-blue-600 flex items-center space-x-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando...</span>
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGuardar}
            disabled={isGuardando}
          >
            {isGuardando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Borrador
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGuardarYSalir}
            disabled={isGuardando}
          >
            {isGuardando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar y salir
          </Button>
        </div>
      </div>
      
      {showSaved && (
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>¡Borrador guardado correctamente!</span>
          </AlertDescription>
        </Alert>
      )}
      
      {borradorCargado && (
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Se ha cargado un borrador previo. Los datos han sido restaurados.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLimpiarBorrador}
              disabled={isGuardando}
            >
              Eliminar Borrador
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
