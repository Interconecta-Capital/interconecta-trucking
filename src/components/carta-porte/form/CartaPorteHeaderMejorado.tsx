
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Save, InfoIcon, ChevronDown, Loader2, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CartaPorteHeaderMejoradoProps {
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  isSaving?: boolean;
  onGuardarBorrador: () => Promise<void>;
  onGuardarYSalir: () => Promise<void>;
  onLimpiarBorrador: () => void;
  currentCartaPorteId?: string;
}

export function CartaPorteHeaderMejorado({ 
  borradorCargado, 
  ultimoGuardado, 
  isSaving = false,
  onGuardarBorrador,
  onGuardarYSalir,
  onLimpiarBorrador,
  currentCartaPorteId
}: CartaPorteHeaderMejoradoProps) {
  const navigate = useNavigate();
  const [isLocalSaving, setIsLocalSaving] = useState(false);

  const handleGuardarYContinuar = async () => {
    setIsLocalSaving(true);
    try {
      await onGuardarBorrador();
      toast.success('Borrador guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar el borrador');
    } finally {
      setIsLocalSaving(false);
    }
  };

  const handleGuardarYSalir = async () => {
    setIsLocalSaving(true);
    try {
      await onGuardarYSalir();
      toast.success('Borrador guardado. Regresando a la lista...');
      navigate('/cartas-porte');
    } catch (error) {
      toast.error('Error al guardar el borrador');
      setIsLocalSaving(false);
    }
  };

  const isLoadingState = isSaving || isLocalSaving;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentCartaPorteId ? 'Editar Carta Porte' : 'Nueva Carta Porte'}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentCartaPorteId 
              ? 'Continúa editando tu carta porte existente'
              : 'Crea un nuevo comprobante fiscal digital de carta porte'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {ultimoGuardado && (
            <div className="text-sm text-gray-500 flex items-center">
              <Save className="h-4 w-4 mr-1" />
              <span>Guardado: {ultimoGuardado.toLocaleTimeString()}</span>
              {isLoadingState && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={isLoadingState}
                className="flex items-center"
              >
                {isLoadingState ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Borrador
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleGuardarYContinuar} disabled={isLoadingState}>
                <FileText className="h-4 w-4 mr-2" />
                Guardar y continuar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleGuardarYSalir} disabled={isLoadingState}>
                <LogOut className="h-4 w-4 mr-2" />
                Guardar y salir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              disabled={isLoadingState}
            >
              Eliminar Borrador
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
