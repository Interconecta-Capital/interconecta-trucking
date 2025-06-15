
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodigoPostalData {
  codigo_postal: string;
  estado: string;
  municipio: string;
  colonias: Array<{
    nombre: string;
    tipo: string;
  }>;
}

interface CodigoPostalSelectorProps {
  value?: string;
  onValueChange: (codigoPostal: string, data?: CodigoPostalData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CodigoPostalSelector({
  value,
  onValueChange,
  placeholder = 'Código postal',
  className,
  disabled = false
}: CodigoPostalSelectorProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const { data: sugerencias = [], isLoading } = useQuery({
    queryKey: ['codigos-postales', search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      
      const { data, error } = await supabase
        .rpc('buscar_codigo_postal_completo', { cp_input: search });
      
      if (error) throw error;
      return data || [];
    },
    enabled: search.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelect = (codigoPostal: string) => {
    const rawData = sugerencias.find(s => s.codigo_postal === codigoPostal);
    if (rawData) {
      // Transform the data to match CodigoPostalData interface
      const transformedData: CodigoPostalData = {
        codigo_postal: rawData.codigo_postal,
        estado: rawData.estado,
        municipio: rawData.municipio,
        colonias: Array.isArray(rawData.colonias) ? rawData.colonias : []
      };
      onValueChange(codigoPostal, transformedData);
    } else {
      onValueChange(codigoPostal);
    }
    setOpen(false);
  };

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
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {value || placeholder}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar código postal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 p-2 focus:ring-0"
              />
            </div>
            <CommandList>
              {isLoading && (
                <CommandEmpty>Buscando códigos postales...</CommandEmpty>
              )}
              
              {!isLoading && search.length >= 2 && sugerencias.length === 0 && (
                <CommandEmpty>No se encontraron códigos postales.</CommandEmpty>
              )}
              
              {!isLoading && sugerencias.length > 0 && (
                <CommandGroup>
                  {sugerencias.map((item) => (
                    <CommandItem
                      key={item.codigo_postal}
                      value={item.codigo_postal}
                      onSelect={() => handleSelect(item.codigo_postal)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.codigo_postal ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{item.codigo_postal}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.municipio}, {item.estado}
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
    </div>
  );
}
