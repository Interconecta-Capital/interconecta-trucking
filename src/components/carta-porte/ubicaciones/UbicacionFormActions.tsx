
import React from 'react';
import { Button } from '@/components/ui/button';
import { UbicacionFrecuente } from '@/types/ubicaciones';
import { DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';

interface UbicacionFormActionsProps {
  ubicacion?: any;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  rfcRemitenteDestinatario: string;
  nombreRemitenteDestinatario: string;
  domicilio: DomicilioUnificado;
}

export function UbicacionFormActions({
  ubicacion,
  onCancel,
  onSaveToFavorites,
  rfcRemitenteDestinatario,
  nombreRemitenteDestinatario,
  domicilio
}: UbicacionFormActionsProps) {
  return (
    <div className="flex justify-between pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200 shadow-sm"
      >
        Cancelar
      </Button>
      
      <div className="flex gap-2">
        {onSaveToFavorites && rfcRemitenteDestinatario && nombreRemitenteDestinatario && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSaveToFavorites({
              nombreUbicacion: nombreRemitenteDestinatario,
              rfcAsociado: rfcRemitenteDestinatario,
              domicilio: domicilio,
              fechaCreacion: new Date().toISOString(),
              vecesUsada: 1
            })}
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
          >
            Guardar en Favoritos
          </Button>
        )}
        
        <Button 
          type="submit" 
          className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
        >
          {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
        </Button>
      </div>
    </div>
  );
}
