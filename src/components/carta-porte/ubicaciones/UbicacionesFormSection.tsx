
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UbicacionFormOptimizado } from './UbicacionFormOptimizado';
import { AlertCircle } from 'lucide-react';

interface UbicacionesFormSectionProps {
  formErrors: string[];
  editingIndex: number | null;
  ubicaciones: any[];
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  onSaveToFavorites: (ubicacion: any) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes: any[];
}

export function UbicacionesFormSection({
  formErrors,
  editingIndex,
  ubicaciones,
  onSave,
  onCancel,
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes
}: UbicacionesFormSectionProps) {
  return (
    <div className="space-y-4">
      {formErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Corrija los siguientes errores:</p>
              <ul className="list-disc list-inside">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <UbicacionFormOptimizado
        ubicacion={editingIndex !== null ? ubicaciones[editingIndex] : undefined}
        onSave={onSave}
        onCancel={onCancel}
        onSaveToFavorites={onSaveToFavorites}
        generarId={generarId}
        ubicacionesFrecuentes={ubicacionesFrecuentes}
      />
    </div>
  );
}
