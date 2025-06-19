
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionesValidationPanelProps {
  ubicaciones: UbicacionCompleta[];
  distanciaTotal: number;
}

export function UbicacionesValidationPanel({ ubicaciones, distanciaTotal }: UbicacionesValidationPanelProps) {
  const tieneOrigen = ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
  const tieneDestino = ubicaciones.some(u => u.tipo_ubicacion === 'Destino');

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-800 mb-2">Validaciones SAT v3.1:</h4>
      <div className="space-y-1 text-sm text-blue-700">
        <div className="flex items-center gap-2">
          {tieneOrigen ? '✅' : '❌'} Al menos una ubicación de origen
        </div>
        <div className="flex items-center gap-2">
          {tieneDestino ? '✅' : '❌'} Al menos una ubicación de destino
        </div>
        <div className="flex items-center gap-2">
          {distanciaTotal > 0 ? '✅' : '❌'} Distancia total calculada (obligatorio SAT)
        </div>
        <div className="flex items-center gap-2">
          {ubicaciones.every(u => u.domicilio.codigo_postal && u.domicilio.municipio) ? '✅' : '❌'} 
          Domicilios completos en todas las ubicaciones
        </div>
      </div>
    </div>
  );
}
