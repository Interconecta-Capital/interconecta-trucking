
import React from 'react';
import { Button } from '@/components/ui/button';

interface VehiculoSaveModalProps {
  showModal: boolean;
  nombrePerfil: string;
  onNombreChange: (nombre: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function VehiculoSaveModal({ 
  showModal, 
  nombrePerfil, 
  onNombreChange, 
  onSave, 
  onClose 
}: VehiculoSaveModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Guardar Vehículo</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre del perfil
            </label>
            <input
              type="text"
              value={nombrePerfil}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej: Truck Principal, Vehículo Local, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={onSave} className="flex-1">
              Guardar
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
