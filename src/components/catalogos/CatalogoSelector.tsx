
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CatalogItem {
  id: string;
  clave: string;
  descripcion: string;
  nombre?: string;
  simbolo?: string;
}

interface CatalogoSelectorProps {
  items: CatalogItem[];
  loading?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  className?: string;
  disabled?: boolean;
  allowManualInput?: boolean;
  manualInputPlaceholder?: string;
}

export function CatalogoSelector({
  items = [],
  loading = false,
  placeholder = "Seleccionar...",
  label,
  required = false,
  value,
  onValueChange,
  onSearchChange,
  searchValue = "",
  className,
  disabled = false,
  allowManualInput = false,
  manualInputPlaceholder = "Escribir manualmente"
}: CatalogoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Prevent navigation on button click
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleSearchChange = (search: string) => {
    setInternalSearch(search);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(search);
      }
    }, 300);
  };

  const handleSelect = (item: CatalogItem) => {
    const selectedValue = `${item.clave} - ${item.descripcion}`;
    if (onValueChange) {
      onValueChange(selectedValue);
    }
    setOpen(false);
    setShowManualInput(false);
  };

  const handleManualInput = () => {
    setShowManualInput(true);
    setOpen(false);
  };

  const handleManualSave = () => {
    if (manualValue.trim() && onValueChange) {
      onValueChange(manualValue.trim());
      setShowManualInput(false);
      setManualValue("");
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (!value) return "";
    
    // Try to find exact match first
    const exactMatch = items.find(item => 
      `${item.clave} - ${item.descripcion}` === value ||
      item.clave === value ||
      item.descripcion === value
    );
    
    if (exactMatch) {
      return `${exactMatch.clave} - ${exactMatch.descripcion}`;
    }
    
    return value;
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (showManualInput) {
    return (
      <div className={cn("grid w-full gap-1.5", className)}>
        {label && (
          <Label htmlFor="manual-input">
            {label} {required && "*"}
          </Label>
        )}
        <div className="flex gap-2">
          <Input
            id="manual-input"
            placeholder={manualInputPlaceholder}
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualSave();
              }
              if (e.key === 'Escape') {
                setShowManualInput(false);
                setManualValue("");
              }
            }}
            autoFocus
          />
          <Button 
            type="button"
            onClick={handleManualSave}
            size="sm"
            disabled={!manualValue.trim()}
          >
            Guardar
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => {
              setShowManualInput(false);
              setManualValue("");
            }}
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid w-full gap-1.5", className)}>
      {label && (
        <Label htmlFor="catalog-selector">
          {label} {required && "*"}
        </Label>
      )}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="catalog-selector"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between text-left font-normal"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleOpenChange(!open);
            }}
          >
            <span className="truncate">
              {getDisplayValue() || placeholder}
            </span>
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar..."
              value={internalSearch}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Cargando...</span>
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <p>No se encontraron resultados</p>
                    {allowManualInput && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleManualInput}
                      >
                        Escribir manualmente
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.clave} ${item.descripcion}`}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          getDisplayValue() === `${item.clave} - ${item.descripcion}` 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-muted px-1 rounded">
                            {item.clave}
                          </span>
                          {item.simbolo && (
                            <span className="text-xs text-muted-foreground">
                              ({item.simbolo})
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground truncate">
                          {item.nombre || item.descripcion}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                  {allowManualInput && items.length > 0 && (
                    <CommandItem onSelect={handleManualInput}>
                      <Search className="mr-2 h-4 w-4" />
                      <span>Escribir manualmente</span>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
