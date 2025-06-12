
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogItem {
  clave: string;
  descripcion: string;
}

interface CatalogoSelectorProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string, item?: CatalogItem) => void;
  items: CatalogItem[];
  isLoading?: boolean;
  required?: boolean;
  error?: string;
  onSearchChange?: (search: string) => void;
}

export function CatalogoSelector({
  label,
  placeholder,
  value,
  onValueChange,
  items = [],
  isLoading = false,
  required = false,
  error,
  onSearchChange
}: CatalogoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find(item => item.clave === value);

  useEffect(() => {
    if (onSearchChange) {
      const delayedSearch = setTimeout(() => {
        onSearchChange(search);
      }, 300);
      return () => clearTimeout(delayedSearch);
    }
  }, [search, onSearchChange]);

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-red-500",
              !value && "text-muted-foreground"
            )}
          >
            {selectedItem ? (
              <span className="truncate">
                {selectedItem.clave} - {selectedItem.descripcion}
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Buscando...</span>
                </div>
              ) : search.length < 2 ? (
                <div className="py-6 text-center text-sm">
                  Escribe al menos 2 caracteres para buscar
                </div>
              ) : (
                <div className="py-6 text-center text-sm">
                  No se encontraron resultados
                </div>
              )}
            </CommandEmpty>
            
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {items.map((item) => (
                <CommandItem
                  key={item.clave}
                  value={`${item.clave} ${item.descripcion}`}
                  onSelect={() => {
                    onValueChange(item.clave, item);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.clave ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.clave}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {item.descripcion}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
