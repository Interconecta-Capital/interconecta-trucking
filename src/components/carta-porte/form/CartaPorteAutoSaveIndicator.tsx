
import React from 'react';

export function CartaPorteAutoSaveIndicator() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Guardado automático activo</span>
        </div>
      </div>
    </div>
  );
}
