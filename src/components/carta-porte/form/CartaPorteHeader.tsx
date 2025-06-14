
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, InfoIcon } from 'lucide-react';

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
  onLimpiarBorrador 
}: CartaPorteHeaderProps) {
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
            onClick={onGuardarBorrador}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
        </div>
      </div>

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
