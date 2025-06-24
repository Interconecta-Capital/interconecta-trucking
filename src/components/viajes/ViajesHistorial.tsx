
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useViajes } from '@/hooks/useViajes';

interface ViajesHistorialProps {
  searchTerm: string;
}

export function ViajesHistorial({ searchTerm }: ViajesHistorialProps) {
  const { viajes } = useViajes();
  
  const viajesCompletados = viajes.filter(v => 
    ['completado', 'cancelado'].includes(v.estado) &&
    (v.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     v.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     v.carta_porte_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {viajesCompletados.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No hay viajes en el historial</p>
          </CardContent>
        </Card>
      ) : (
        viajesCompletados.map((viaje) => (
          <Card key={viaje.id}>
            <CardHeader>
              <CardTitle className="text-lg">{viaje.origen} → {viaje.destino}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Estado:</span> {viaje.estado}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {new Date(viaje.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
