
import React from 'react';
import { SmartUbicacionFormV2 } from './SmartUbicacionFormV2';
import { UbicacionFrecuente } from '@/types/ubicaciones';

interface UbicacionesFormSectionProps {
  formErrors: string[];
  editingIndex: number | null;
  ubicaciones: any[];
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  onSaveToFavorites: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes: UbicacionFrecuente[];
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
  const ubicacionActual = editingIndex !== null ? ubicaciones[editingIndex] : undefined;

  return (
    <div className="space-y-4">
      {formErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Errores en el formulario:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {formErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <SmartUbicacionFormV2
        ubicacion={ubicacionActual}
        onSave={onSave}
        onCancel={onCancel}
        onSaveToFavorites={onSaveToFavorites}
        generarId={generarId}
        ubicacionesFrecuentes={ubicacionesFrecuentes}
      />
    </div>
  );
}
