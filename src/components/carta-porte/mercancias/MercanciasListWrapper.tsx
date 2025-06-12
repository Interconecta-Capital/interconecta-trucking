
import React from 'react';
import { MercanciasList } from './MercanciasList';
import { VirtualizedMercanciasList } from './VirtualizedMercanciasList';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciasListWrapperProps {
  mercancias: Mercancia[];
  onEdit: (mercancia: Mercancia) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  virtualizationThreshold?: number;
}

export const MercanciasListWrapper: React.FC<MercanciasListWrapperProps> = ({
  mercancias,
  onEdit,
  onDelete,
  isLoading = false,
  virtualizationThreshold = 50
}) => {
  // Usar virtualización cuando hay muchos elementos
  const shouldVirtualize = mercancias.length > virtualizationThreshold;

  if (shouldVirtualize) {
    return (
      <VirtualizedMercanciasList
        mercancias={mercancias}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    );
  }

  return (
    <MercanciasList
      mercancias={mercancias}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
};
