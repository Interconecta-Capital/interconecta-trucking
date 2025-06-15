
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Check, Loader2 } from 'lucide-react';
import { useMapas } from '@/hooks/useMapas';
import { GeocodeResult } from '@/services/mapService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (result: GeocodeResult) => void;
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

    // Aumentar el mínimo de caracteres para mejor precisión
    if (value.length < 5) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Buscando direcciones con Mapbox:', value);
        const results = await buscarDirecciones(value);
        
        // Filtrar y mejorar resultados para México
        const filteredResults = results
          .filter(result => 
            result.formattedAddress.toLowerCase().includes('mexico') ||
            result.formattedAddress.toLowerCase().includes('méxico')
          )
          .slice(0, 6); // Limitar a 6 resultados

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
    }, 400); // Reducir debounce para mejor UX

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
    onChange(suggestion.formattedAddress);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      // Crear estructura compatible con el hook
      const mapboxData = {
        place_name: suggestion.formattedAddress,
        center: suggestion.coordinates ? [suggestion.coordinates.lng, suggestion.coordinates.lat] : null,
        ...suggestion
      };
      onAddressSelect(mapboxData);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions para permitir clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={className}
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Sugerencias mejoradas */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto border shadow-lg">
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
                      <span>📍 Confianza: {Math.round(suggestion.confidence * 100)}%</span>
                      {suggestion.coordinates && (
                        <span>🗺️ Coordenadas disponibles</span>
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

      {/* Estado sin resultados */}
      {value.length >= 5 && !isSearching && suggestions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
          <CardContent className="p-4 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No se encontraron direcciones</p>
            <p className="text-xs mt-1">Intenta con más detalles de la dirección</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
