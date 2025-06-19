
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CatalogSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  showLoading: boolean;
  placeholder: string;
  options: Array<{
    value: string;
    label: string;
    descripcion?: string;
    clave?: string;
    simbolo?: string;
    clase_division?: string;
    grupo_embalaje?: string;
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
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200">{part}</mark>
      ) : part
    );
  };

  const formatOptionLabel = (option: any) => {
    const parts = [option.clave, option.descripcion].filter(Boolean);
    return parts.join(' - ');
  };

  const renderOptionContent = (option: any) => (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-sm text-blue-600">{option.clave}</span>
        {option.simbolo && (
          <Badge variant="outline" className="text-xs">
            {option.simbolo}
          </Badge>
        )}
      </div>
      <div className="text-sm text-gray-700">
        {searchTerm ? highlightText(option.descripcion || '', searchTerm) : option.descripcion}
      </div>
      {(option.clase_division || option.grupo_embalaje) && (
        <div className="flex gap-2 mt-1">
          {option.clase_division && (
            <Badge variant="secondary" className="text-xs">
              Clase: {option.clase_division}
            </Badge>
          )}
          {option.grupo_embalaje && (
            <Badge variant="secondary" className="text-xs">
              Grupo: {option.grupo_embalaje}
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || showLoading}
    >
      <SelectTrigger className="h-auto min-h-[40px]">
        <SelectValue placeholder={placeholder}>
          {value && options.length > 0 && (() => {
            const selectedOption = options.find(opt => opt.value === value);
            return selectedOption ? (
              <div className="text-left py-1">
                <div className="font-mono text-sm text-blue-600">{selectedOption.clave}</div>
                <div className="text-sm text-gray-700 truncate">{selectedOption.descripcion}</div>
              </div>
            ) : value;
          })()}
        </SelectValue>
      </SelectTrigger>
      
      <SelectContent className="max-h-[300px]">
        {options.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 text-center">
            {showLoading ? 'Cargando opciones...' : 'No hay opciones disponibles'}
          </div>
        ) : (
          options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="h-auto py-2 px-3"
            >
              {renderOptionContent(option)}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
