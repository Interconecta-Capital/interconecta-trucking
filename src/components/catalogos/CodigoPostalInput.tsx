
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, CheckCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCodigoPostalOptimizado } from '@/hooks/useCodigoPostalOptimizado';

interface CodigoPostalInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onLocationUpdate?: (location: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  onInfoChange?: (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  onColoniaChange?: (colonia: string) => void;
  coloniaValue?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CodigoPostalInput({
  value = '',
  onChange,
  onValueChange,
  onLocationUpdate,
  onInfoChange,
  onColoniaChange,
  coloniaValue,
  label = 'Código Postal',
  required = false,
  error,
  disabled = false,
  className
}: CodigoPostalInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [selectedColonia, setSelectedColonia] = useState(coloniaValue || '');
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  // Hook optimizado para código postal
  const {
    isLoading,
    error: hookError,
    codigoPostalInfo,
    buscarConDebounce,
    resetear
  } = useCodigoPostalOptimizado({
    onSuccess: (info) => {
      console.log('[CP_INPUT] Éxito:', info);
      
      // Auto-seleccionar colonia si solo hay una
      if (info.colonias.length === 1) {
        const colonia = info.colonias[0];
        setSelectedColonia(colonia);
        
        const updateCallback = onInfoChange || onLocationUpdate;
        if (updateCallback) {
          updateCallback({
            estado: info.estado,
            municipio: info.municipio,
            localidad: info.localidad,
            colonia: colonia
          });
        }
        if (onColoniaChange) {
          onColoniaChange(colonia);
        }
      } else {
        // Múltiples colonias, resetear selección
        setSelectedColonia('');
        const updateCallback = onInfoChange || onLocationUpdate;
        if (updateCallback) {
          updateCallback({
            estado: info.estado,
            municipio: info.municipio,
            localidad: info.localidad,
            colonia: ''
          });
        }
      }
      
      // Limpiar sugerencias en éxito
      setSugerencias([]);
    },
    onError: (errorMsg, sugerenciasList = []) => {
      console.log('[CP_INPUT] Error:', errorMsg);
      setSugerencias(sugerenciasList);
      
      // Limpiar datos al fallar
      setSelectedColonia('');
      const updateCallback = onInfoChange || onLocationUpdate;
      if (updateCallback) {
        updateCallback({
          estado: '',
          municipio: '',
          localidad: '',
          colonia: ''
        });
      }
    }
  });

  // Sincronizar valores externos
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (coloniaValue !== selectedColonia) {
      setSelectedColonia(coloniaValue || '');
    }
  }, [coloniaValue]);

  // Manejador de cambios con validación inmediata
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    setLocalValue(newValue);
    
    // Llamar callback inmediatamente
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(newValue);
    }

    // Resetear estados
    setSugerencias([]);
    setSelectedColonia('');

    if (newValue.length === 5) {
      // Buscar con debounce
      buscarConDebounce(newValue);
    } else {
      // Limpiar si no son 5 dígitos
      resetear();
      const updateCallback = onInfoChange || onLocationUpdate;
      if (updateCallback) {
        updateCallback({
          estado: '',
          municipio: '',
          localidad: '',
          colonia: ''
        });
      }
    }
  }, [onChange, onValueChange, onInfoChange, onLocationUpdate, buscarConDebounce, resetear]);

  // Manejador para cambio de colonia
  const handleColoniaChange = useCallback((colonia: string) => {
    setSelectedColonia(colonia);
    
    const updateCallback = onInfoChange || onLocationUpdate;
    if (updateCallback && codigoPostalInfo) {
      updateCallback({
        estado: codigoPostalInfo.estado,
        municipio: codigoPostalInfo.municipio,
        localidad: codigoPostalInfo.localidad,
        colonia
      });
    }
    
    if (onColoniaChange) {
      onColoniaChange(colonia);
    }
  }, [codigoPostalInfo, onInfoChange, onLocationUpdate, onColoniaChange]);

  // Estados computados
  const displayError = useMemo(() => error || hookError, [error, hookError]);
  const isValid = useMemo(() => 
    localValue.length === 5 && !isLoading && !displayError && codigoPostalInfo,
    [localValue.length, isLoading, displayError, codigoPostalInfo]
  );

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Campo de Código Postal */}
      <div className="space-y-2">
        <Label htmlFor="codigo-postal" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            id="codigo-postal"
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder="Ej: 62577"
            maxLength={5}
            disabled={disabled || isLoading}
            className={`${
              displayError ? 'border-red-500' : isValid ? 'border-green-500' : ''
            } ${isLoading ? 'opacity-75' : ''}`}
          />
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          )}
          
          {isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>

        {/* Error con sugerencias */}
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <span>{displayError}</span>
                {sugerencias.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Códigos postales similares:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sugerencias.map((cp) => (
                        <button
                          key={cp}
                          type="button"
                          onClick={() => {
                            setLocalValue(cp);
                            const changeCallback = onValueChange || onChange;
                            if (changeCallback) {
                              changeCallback(cp);
                            }
                            buscarConDebounce(cp);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          {cp}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Información de éxito */}
        {isValid && codigoPostalInfo && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <div className="flex items-center justify-between">
                <span>✓ {codigoPostalInfo.municipio}, {codigoPostalInfo.estado}</span>
                <span className="text-xs opacity-75">
                  {codigoPostalInfo.fuente === 'local' ? '📱 Local' : 
                   codigoPostalInfo.fuente === 'api_interna' ? '🌐 API' : '💾 Cache'}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Selector de Colonia */}
      {codigoPostalInfo && codigoPostalInfo.colonias.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="colonia-select">
            Colonia
            {required && <span className="text-red-500">*</span>}
          </Label>
          
          <Select value={selectedColonia} onValueChange={handleColoniaChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecciona una colonia" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
              {codigoPostalInfo.colonias.map((colonia, index) => (
                <SelectItem 
                  key={`${colonia}-${index}`} 
                  value={colonia} 
                  className="cursor-pointer hover:bg-accent"
                >
                  {colonia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Información adicional si hay una sola colonia */}
      {codigoPostalInfo && codigoPostalInfo.colonias.length === 1 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Colonia asignada automáticamente: <strong>{codigoPostalInfo.colonias[0]}</strong>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
