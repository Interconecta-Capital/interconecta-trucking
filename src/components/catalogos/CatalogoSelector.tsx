
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatalogItem } from '@/utils/catalogAdapters';

interface CatalogoSelectorProps {
  items: CatalogItem[];
  loading?: boolean;
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  allowManualInput?: boolean;
  manualInputPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CatalogoSelector({
  items,
  loading = false,
  placeholder = 'Seleccionar...',
  value,
  onValueChange,
  onSearchChange,
  searchValue = '',
  allowManualInput = false,
  manualInputPlaceholder = 'Escribir valor',
  className,
  disabled = false
}: CatalogoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const selectedItem = items.find(item => item.value === value);

  useEffect(() => {
    if (value && !selectedItem && !manualMode) {
      setManualMode(true);
      setManualValue(value);
    }
  }, [value, selectedItem, manualMode]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setManualMode(false);
  };

  const handleManualSubmit = () => {
    if (manualValue.trim()) {
      onValueChange(manualValue.trim());
      setManualMode(false);
    }
  };

  const handleSearchChange = (search: string) => {
    if (onSearchChange) {
      onSearchChange(search);
    }
  };

  if (manualMode) {
    return (
      <div className={cn("flex gap-2", className)}>
        <Input
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder={manualInputPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleManualSubmit();
            } else if (e.key === 'Escape') {
              setManualMode(false);
              setManualValue('');
            }
          }}
          disabled={disabled}
        />
        <Button 
          type="button" 
          onClick={handleManualSubmit}
          disabled={disabled || !manualValue.trim()}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setManualMode(false);
            setManualValue('');
          }}
          disabled={disabled}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedItem ? selectedItem.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Buscar...`}
              value={searchValue}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {loading && (
                <CommandEmpty>
                  <div className="flex items-center justify-center p-4">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Cargando...
                  </div>
                </CommandEmpty>
              )}
              
              {!loading && items.length === 0 && (
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              )}
              
              {!loading && items.length > 0 && (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {allowManualInput && (
                <CommandGroup>
                  <CommandItem onSelect={() => setManualMode(true)}>
                    <Search className="mr-2 h-4 w-4" />
                    Escribir valor manualmente
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
