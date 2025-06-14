
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface CatalogActionsProps {
  allowSearch: boolean;
  showRefresh: boolean;
  showSearch: boolean;
  disabled: boolean;
  showLoading: boolean;
  onSearchToggle: () => void;
  onRefresh: () => void;
}

export function CatalogActions({
  allowSearch,
  showRefresh,
  showSearch,
  disabled,
  showLoading,
  onSearchToggle,
  onRefresh
}: CatalogActionsProps) {
  return (
    <>
      {allowSearch && !showSearch && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSearchToggle}
          disabled={disabled}
          title="Buscar"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
      
      {showRefresh && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={disabled || showLoading}
          title="Actualizar catálogo"
        >
          <RefreshCw className={`h-4 w-4 ${showLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </>
  );
}
