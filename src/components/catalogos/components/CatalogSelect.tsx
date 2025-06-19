
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw } from 'lucide-react';

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
  const [internalSearch, setInternalSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-medium">{part}</mark>
      ) : part
    );
  };

  const filteredOptions = options.filter(option => {
    if (!internalSearch) return true;
    const searchLower = internalSearch.toLowerCase();
    return (
      option.clave?.toLowerCase().includes(searchLower) ||
      option.descripcion?.toLowerCase().includes(searchLower) ||
      option.label?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 50); // Limit to 50 results for performance

  const selectedOption = options.find(opt => opt.value === value);

  const renderOptionContent = (option: any) => (
    <div className="w-full py-1">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-sm font-medium text-blue-600">
          {internalSearch ? highlightText(option.clave || '', internalSearch) : option.clave}
        </span>
        {option.simbolo && (
          <Badge variant="outline" className="text-xs ml-2">
            {option.simbolo}
          </Badge>
        )}
      </div>
      <div className="text-sm text-gray-700 leading-tight">
        {internalSearch ? highlightText(option.descripcion || '', internalSearch) : option.descripcion}
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
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="h-auto min-h-[40px] bg-white">
        <SelectValue placeholder={placeholder}>
          {selectedOption ? (
            <div className="text-left py-1">
              <div className="font-mono text-sm font-medium text-blue-600">
                {selectedOption.clave}
              </div>
              <div className="text-sm text-gray-700 truncate">
                {selectedOption.descripcion}
              </div>
            </div>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      
      <SelectContent className="max-h-[400px] w-full min-w-[400px] bg-white border shadow-lg">
        {/* Search input */}
        <div className="sticky top-0 p-2 bg-white border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por clave o descripción..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Loading indicator */}
        {showLoading && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
            Cargando catálogo...
          </div>
        )}

        {/* Options */}
        {!showLoading && filteredOptions.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            {internalSearch ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="h-auto py-2 px-3 cursor-pointer hover:bg-gray-50 focus:bg-blue-50"
              >
                {renderOptionContent(option)}
              </SelectItem>
            ))}
          </div>
        )}

        {/* Show count if there are more results */}
        {!showLoading && options.length > 50 && (
          <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
            Mostrando {Math.min(filteredOptions.length, 50)} de {options.length} resultados
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
