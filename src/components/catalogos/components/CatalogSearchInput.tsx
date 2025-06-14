
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CatalogSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  tipo: string;
  disabled?: boolean;
}

export function CatalogSearchInput({ 
  searchTerm, 
  onSearchChange, 
  onClose, 
  tipo, 
  disabled 
}: CatalogSearchInputProps) {
  return (
    <div className="flex gap-1">
      <Input
        type="text"
        placeholder={`Buscar ${tipo}...`}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
        autoFocus
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
