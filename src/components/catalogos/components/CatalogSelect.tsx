
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CatalogSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  showLoading?: boolean;
  placeholder: string;
  options: Array<{
    value: string;
    label: string;
    descripcion?: string;
  }>;
  searchTerm: string;
  tipo: string;
}

export function CatalogSelect({
  value,
  onValueChange,
  disabled,
  showLoading,
  placeholder,
  options,
  searchTerm,
  tipo
}: CatalogSelectProps) {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled || showLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
        {showLoading && (
          <Loader2 className="h-4 w-4 animate-spin ml-2" />
        )}
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.descripcion && option.descripcion !== option.label && (
                  <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {option.descripcion}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-data" disabled>
            {tipo === 'materiales_peligrosos' && searchTerm.length < 2
              ? 'Escribe al menos 2 caracteres'
              : showLoading 
                ? 'Cargando...' 
                : 'No hay datos disponibles'
            }
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
