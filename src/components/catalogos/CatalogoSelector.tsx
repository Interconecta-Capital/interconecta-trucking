
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CatalogItem } from '@/services/catalogosSAT';

interface CatalogoSelectorProps {
  label: string;
  placeholder?: string;
  value?: string;
  onValueChange: (clave: string, item?: CatalogItem) => void;
  items: CatalogItem[];
  isLoading?: boolean;
  required?: boolean;
  className?: string;
  showClave?: boolean;
  error?: string;
}

export const CatalogoSelector: React.FC<CatalogoSelectorProps> = ({
  label,
  placeholder = "Buscar...",
  value,
  onValueChange,
  items,
  isLoading = false,
  required = false,
  className,
  showClave = true,
  error
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedItem = items.find(item => item.clave === value);

  const handleSelect = (clave: string) => {
    const item = items.find(item => item.clave === clave);
    onValueChange(clave === value ? '' : clave, item);
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            {selectedItem ? (
              <div className="flex items-center space-x-2 overflow-hidden">
                {showClave && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedItem.clave}
                  </Badge>
                )}
                <span className="truncate">
                  {selectedItem.nombre || selectedItem.descripcion}
                </span>
              </div>
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
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Cargando...</CommandEmpty>
              ) : items.length === 0 ? (
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.clave}
                      onSelect={handleSelect}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value === item.clave ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {showClave && (
                          <Badge variant="outline" className="text-xs">
                            {item.clave}
                          </Badge>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {item.nombre || item.descripcion}
                          </div>
                          {item.nombre && item.descripcion && (
                            <div className="text-sm text-muted-foreground truncate">
                              {item.descripcion}
                            </div>
                          )}
                          {item.simbolo && (
                            <div className="text-xs text-muted-foreground">
                              Símbolo: {item.simbolo}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
