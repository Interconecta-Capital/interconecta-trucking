import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface CartaPorteHeaderProps {
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  onGuardarBorrador: () => void;
  onLimpiarBorrador: () => void;
}

export function CartaPorteHeader({ 
  borradorCargado, 
  ultimoGuardado, 
  onGuardarBorrador, 
  onLimpiarBorrador,
  onGuardarYSalir?: () => void
}: CartaPorteHeaderProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleGuardarYSalir = async () => {
    setLoading(true);
    if (typeof onGuardarBorrador === 'function') await onGuardarBorrador();
    setShowSaved(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/cartas-porte');
    }, 1000);
  };

  const handleGuardar = async () => {
    setLoading(true);
    if (typeof onGuardarBorrador === 'function') await onGuardarBorrador();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setLoading(false);
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
            <div className="text-sm text-gray-500">
              <Save className="h-4 w-4 inline mr-1" />
              Guardado: {ultimoGuardado.toLocaleTimeString()}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGuardar}
            disabled={loading}
          >
            <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Guardar Borrador
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGuardarYSalir}
            disabled={loading}
          >
            <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
            >
              Eliminar Borrador
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
