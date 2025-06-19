
import React from 'react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { MercanciaCard } from './MercanciaCard';

interface MercanciasListWrapperProps {
  mercancias: MercanciaCompleta[];
  onEdit: (mercancia: MercanciaCompleta) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function MercanciasListWrapper({ 
  mercancias, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: MercanciasListWrapperProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (mercancias.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay mercancías registradas</p>
        <p className="text-sm">Utiliza los botones de arriba para agregar mercancías</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mercancias.map((mercancia, index) => (
        <MercanciaCard
          key={mercancia.id}
          mercancia={mercancia}
          index={index}
          onEdit={() => onEdit(mercancia)}
          onDelete={() => onDelete(mercancia.id)}
        />
      ))}
    </div>
  );
}
