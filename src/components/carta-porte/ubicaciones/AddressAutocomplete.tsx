
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Check, Loader2, Search, Star } from 'lucide-react';
import { MapboxDistanceService } from '@/services/mapboxDistanceService';

interface GeocodeResult {
  coordinates: { lat: number; lng: number };
  formattedAddress: string;
  addressComponents: {
    codigoPostal?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    calle?: string;
    pais?: string;
  };
  confidence: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
  showConfidence?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Buscar dirección...",
  className = "",
  showConfidence = true
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<GeocodeResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load recent addresses from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentAddresses(parsed.slice(0, 3)); // Últimas 3 direcciones
      }
    } catch (error) {
      console.error('Error loading recent addresses:', error);
    }
  }, []);

  // Buscar direcciones con Mapbox
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
        console.log('🔍 Buscando direcciones con Mapbox:', value);
        
        const result = await MapboxDistanceService.geocodeAddress(value);
        
        if (result) {
          setSuggestions([result]);
          setShowSuggestions(true);
          console.log('✅ Dirección encontrada con Mapbox');
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('❌ Error buscando direcciones:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce optimizado

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const saveToRecent = (address: GeocodeResult) => {
    try {
      const existing = recentAddresses.filter(addr => 
        addr.formattedAddress !== address.formattedAddress
      );
      
      const updated = [address, ...existing].slice(0, 5);
      setRecentAddresses(updated);
      localStorage.setItem('recent_addresses', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent address:', error);
    }
  };

  const handleSuggestionSelect = (suggestion: GeocodeResult) => {
    console.log('📍 Dirección seleccionada:', suggestion);
    
    setShowSuggestions(false);
    setSuggestions([]);
    onChange('');
    
    // Guardar en direcciones recientes
    saveToRecent(suggestion);
    
    if (onAddressSelect) {
      // Crear estructura compatible con parsing de Mapbox
      const mapboxData = {
        place_name: suggestion.formattedAddress,
        center: [suggestion.coordinates.lng, suggestion.coordinates.lat],
        text: suggestion.addressComponents.calle || suggestion.formattedAddress.split(',')[0],
        context: [
          { id: 'postcode', text: suggestion.addressComponents.codigoPostal || '' },
          { id: 'place', text: suggestion.addressComponents.municipio || '' },
          { id: 'region', text: suggestion.addressComponents.estado || '' },
          { id: 'country', text: suggestion.addressComponents.pais || 'México' }
        ].filter(item => item.text),
        properties: {
          address: suggestion.formattedAddress,
          confidence: suggestion.confidence
        },
        originalData: suggestion
      };
      
      console.log('📤 Enviando datos de dirección:', mapboxData);
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
    if (value.length === 0 && recentAddresses.length > 0) {
      // Mostrar direcciones recientes cuando el campo está vacío
      setShowSuggestions(true);
    } else if (suggestions.length > 0 && value.length >= 4) {
      setShowSuggestions(true);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  // Limpiar sugerencias cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setSuggestions([]);
      setShowSuggestions(false);
    };
  }, []);

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
          autoComplete="off"
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Sugerencias de búsqueda */}
      {showSuggestions && (value.length >= 4 ? suggestions.length > 0 : recentAddresses.length > 0) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto border shadow-lg bg-white">
          <CardContent className="p-0">
            {/* Direcciones recientes cuando el campo está vacío */}
            {value.length === 0 && recentAddresses.length > 0 && (
              <>
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Star className="h-4 w-4" />
                    Direcciones recientes
                  </div>
                </div>
                {recentAddresses.map((address, index) => (
                  <Button
                    key={`recent-${index}`}
                    type="button"
                    variant="ghost"
                    className="w-full text-left justify-start h-auto p-4 rounded-none border-b last:border-b-0 hover:bg-blue-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionSelect(address);
                    }}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <MapPin className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight mb-1">
                          {address.formattedAddress}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Reciente
                          </Badge>
                          {showConfidence && (
                            <Badge className={`text-xs ${getConfidenceColor(address.confidence)}`}>
                              {getConfidenceText(address.confidence)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </>
            )}

            {/* Resultados de búsqueda */}
            {value.length >= 4 && suggestions.map((suggestion, index) => (
              <Button
                key={`suggestion-${index}`}
                type="button"
                variant="ghost"
                className="w-full text-left justify-start h-auto p-4 rounded-none border-b last:border-b-0 hover:bg-blue-50"
                onMouseDown={(e) => {
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
                      <Badge variant="outline" className="text-xs">
                        📍 Mapbox
                      </Badge>
                      {showConfidence && (
                        <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                          Confianza: {getConfidenceText(suggestion.confidence)}
                        </Badge>
                      )}
                      {suggestion.coordinates && (
                        <Badge variant="secondary" className="text-xs">
                          Coordenadas
                        </Badge>
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
          Escribe al menos 4 caracteres para buscar direcciones con Mapbox
        </p>
      )}
    </div>
  );
}
