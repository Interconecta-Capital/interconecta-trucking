
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Check, Loader2, Search } from 'lucide-react';
import { useMapas } from '@/hooks/useMapas';
import { GeocodeResult } from '@/services/mapService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Buscar dirección...",
  className = ""
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { buscarDirecciones } = useMapas();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Buscar direcciones con debounce optimizado
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Mínimo 4 caracteres para mejor precisión
    if (value.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Buscando direcciones con Mapbox:', value);
        
        // Mejorar query agregando país México para mejor precisión
        const queryWithCountry = `${value}, México`;
        const results = await buscarDirecciones(queryWithCountry);
        
        // Filtrar resultados para México únicamente
        const filteredResults = results
          .filter(result => 
            result.formattedAddress.toLowerCase().includes('mexico') ||
            result.formattedAddress.toLowerCase().includes('méxico') ||
            result.formattedAddress.toLowerCase().includes('mx')
          )
          .slice(0, 5); // Limitar a 5 resultados más relevantes

        setSuggestions(filteredResults);
        setShowSuggestions(filteredResults.length > 0);
        console.log(`Encontradas ${filteredResults.length} direcciones`);
      } catch (error) {
        console.error('Error buscando direcciones:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce más rápido para mejor UX

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, buscarDirecciones]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(e.target.value);
  };

  const handleSuggestionSelect = (suggestion: GeocodeResult) => {
    console.log('Dirección seleccionada:', suggestion);
    
    // Actualizar el campo de búsqueda con la dirección seleccionada
    onChange(suggestion.formattedAddress);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      // Crear estructura compatible con el componente padre
      const mapboxData = {
        place_name: suggestion.formattedAddress,
        center: suggestion.coordinates ? [suggestion.coordinates.lng, suggestion.coordinates.lat] : null,
        text: suggestion.formattedAddress.split(',')[0], // Primera parte como texto principal
        properties: {
          address: suggestion.formattedAddress
        },
        ...suggestion
      };
      onAddressSelect(mapboxData);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Sugerencias mejoradas */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto border shadow-lg bg-white">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                className="w-full text-left justify-start h-auto p-4 rounded-none border-b last:border-b-0 hover:bg-blue-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSuggestionSelect(suggestion);
                }}
              >
                <div className="flex items-start space-x-3 w-full">
                  <MapPin className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight mb-1">
                      {suggestion.formattedAddress}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Confianza: {Math.round(suggestion.confidence * 100)}%
                      </span>
                      {suggestion.coordinates && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          📍 Coordenadas
                        </span>
                      )}
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-green-600 opacity-60" />
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Estado cuando no hay resultados */}
      {value.length >= 4 && !isSearching && suggestions.length === 0 && showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg bg-white">
          <CardContent className="p-4 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No se encontraron direcciones</p>
            <p className="text-xs mt-1">Intenta con más detalles: calle, número, colonia, ciudad</p>
          </CardContent>
        </Card>
      )}

      {/* Ayuda para el usuario */}
      {value.length > 0 && value.length < 4 && (
        <p className="text-xs text-muted-foreground mt-1">
          Escribe al menos 4 caracteres para buscar direcciones
        </p>
      )}
    </div>
  );
}
