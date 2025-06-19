
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';
import { AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface EliminarBorradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrador: BorradorCartaPorte | null;
  onConfirmar: () => Promise<void>;
}

export function EliminarBorradorDialog({
  open,
  onOpenChange,
  borrador,
  onConfirmar
}: EliminarBorradorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmar = async () => {
    setIsLoading(true);
    try {
      await onConfirmar();
    } finally {
      setIsLoading(false);
    }
  };

  if (!borrador) return null;

  const ultimaEdicion = formatDistanceToNow(new Date(borrador.ultima_edicion), { 
    addSuffix: true, 
    locale: es 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Borrador</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El borrador será eliminado permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del borrador */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <p className="font-medium text-sm">{borrador.nombre_borrador}</p>
              <p className="text-xs text-muted-foreground">
                Versión {borrador.version_formulario} • Editado {ultimaEdicion}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Mercancías: </span>
                <span className="font-medium">
                  {borrador.datos_formulario?.mercancias?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Ubicaciones: </span>
                <span className="font-medium">
                  {borrador.datos_formulario?.ubicaciones?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-1">
                <p className="font-medium">¿Estás seguro?</p>
                <p className="text-sm">
                  Se perderá toda la información ingresada en este borrador.
                  {borrador.auto_saved && (
                    <span className="block mt-1 text-xs">
                      Este borrador fue guardado automáticamente, por lo que podría contener trabajo importante.
                    </span>
                  )}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Alternativas */}
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="font-medium mb-1 text-blue-900">Alternativas:</p>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• Puedes convertir el borrador a Carta Porte oficial</li>
              <li>• O duplicarlo para conservar una copia antes de eliminar</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirmar}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </>
            ) : (
              'Eliminar Borrador'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
