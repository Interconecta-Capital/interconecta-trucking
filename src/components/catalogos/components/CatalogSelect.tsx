
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';

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
        <mark key={index} className="bg-yellow-200 text-yellow-900 font-medium px-1 rounded">{part}</mark>
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
  }).slice(0, 100); // Aumentar límite para mejor UX

  const selectedOption = options.find(opt => opt.value === value);

  const renderOptionContent = (option: any) => (
    <div className="w-full py-2 px-1">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-sm font-semibold text-blue-700">
          {internalSearch ? highlightText(option.clave || '', internalSearch) : option.clave}
        </span>
        {option.simbolo && (
          <Badge variant="outline" className="text-xs ml-2 bg-blue-50 text-blue-700 border-blue-300">
            {option.simbolo}
          </Badge>
        )}
      </div>
      <div className="text-sm text-gray-800 leading-relaxed font-medium">
        {internalSearch ? highlightText(option.descripcion || '', internalSearch) : option.descripcion}
      </div>
      {(option.clase_division || option.grupo_embalaje) && (
        <div className="flex gap-2 mt-2">
          {option.clase_division && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
              Clase: {option.clase_division}
            </Badge>
          )}
          {option.grupo_embalaje && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
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
      <SelectTrigger className="h-auto min-h-[48px] bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm">
        <SelectValue placeholder={placeholder}>
          {selectedOption ? (
            <div className="text-left py-1">
              <div className="font-mono text-sm font-semibold text-blue-700">
                {selectedOption.clave}
              </div>
              <div className="text-sm text-gray-700 truncate font-medium">
                {selectedOption.descripcion}
              </div>
            </div>
          ) : null}
        </SelectValue>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectTrigger>
      
      <SelectContent className="max-h-[420px] w-full min-w-[450px] bg-white border border-gray-200 shadow-xl rounded-lg z-50">
        {/* Search input */}
        <div className="sticky top-0 p-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por clave o descripción..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Loading indicator */}
        {showLoading && (
          <div className="px-4 py-6 text-sm text-gray-500 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
            <span className="font-medium">Cargando catálogo...</span>
          </div>
        )}

        {/* Options */}
        {!showLoading && filteredOptions.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500 text-center">
            <div className="font-medium">
              {internalSearch ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
            </div>
            {internalSearch && (
              <div className="text-xs mt-1">
                Intenta con términos diferentes
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            {filteredOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="h-auto py-3 px-4 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 border-b border-gray-100 last:border-b-0"
              >
                {renderOptionContent(option)}
              </SelectItem>
            ))}
          </div>
        )}

        {/* Show count if there are more results */}
        {!showLoading && options.length > 100 && (
          <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50 font-medium">
            Mostrando {Math.min(filteredOptions.length, 100)} de {options.length} resultados
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
