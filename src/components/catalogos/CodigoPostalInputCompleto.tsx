
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, CheckCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCodigoPostalCompleto } from '@/hooks/useCodigoPostalCompleto';

interface CodigoPostalInputCompletoProps {
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onLocationUpdate?: (location: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    ciudad?: string;
    zona?: string;
    colonia?: string;
  }) => void;
  onInfoChange?: (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    ciudad?: string;
    zona?: string;
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

export function CodigoPostalInputCompleto({
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
}: CodigoPostalInputCompletoProps) {
  const [localValue, setLocalValue] = useState(value);
  const [selectedColonia, setSelectedColonia] = useState(coloniaValue || '');
  const [sugerencias, setSugerencias] = useState<Array<{codigo_postal: string, ubicacion: string}>>([]);

  // Hook completo para código postal con debounce optimizado
  const {
    isLoading,
    error: hookError,
    codigoPostalInfo,
    buscarConDebounce,
    resetear
  } = useCodigoPostalCompleto({
    debounceMs: 300,
    onSuccess: (info) => {
      console.log('[CP_INPUT_COMPLETO] Información encontrada:', info);
      
      // Resetear colonia para que usuario seleccione
      setSelectedColonia('');
      
      // Llenar TODOS los campos del domicilio automáticamente
      const updateCallback = onInfoChange || onLocationUpdate;
      if (updateCallback) {
        updateCallback({
          estado: info.estado,
          municipio: info.municipio,
          localidad: info.localidad || info.ciudad,
          ciudad: info.ciudad,
          zona: info.zona,
          colonia: '' // No asignar automáticamente
        });
      }
      
      // Limpiar sugerencias en éxito
      setSugerencias([]);
    },
    onError: (errorMsg, sugerenciasList = []) => {
      console.log('[CP_INPUT_COMPLETO] Error:', errorMsg);
      setSugerencias(sugerenciasList);
      
      // Limpiar datos al fallar
      setSelectedColonia('');
      const updateCallback = onInfoChange || onLocationUpdate;
      if (updateCallback) {
        updateCallback({
          estado: '',
          municipio: '',
          localidad: '',
          ciudad: '',
          zona: '',
          colonia: ''
        });
      }
    }
  });

  // Sincronización de valores
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  useEffect(() => {
    if (coloniaValue !== selectedColonia && coloniaValue) {
      setSelectedColonia(coloniaValue);
    }
  }, [coloniaValue, selectedColonia]);

  // Manejador optimizado de cambios
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    
    if (newValue === localValue) return;
    
    setLocalValue(newValue);
    console.log(`[CP_INPUT_COMPLETO] Valor cambiado a: ${newValue}`);
    
    // Llamar callback inmediatamente
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(newValue);
    }

    // Resetear estados
    setSugerencias([]);
    setSelectedColonia('');

    if (newValue.length === 5) {
      buscarConDebounce(newValue);
    } else {
      resetear();
      const updateCallback = onInfoChange || onLocationUpdate;
      if (updateCallback) {
        updateCallback({
          estado: '',
          municipio: '',
          localidad: '',
          ciudad: '',
          zona: '',
          colonia: ''
        });
      }
    }
  }, [localValue, onChange, onValueChange, onInfoChange, onLocationUpdate, buscarConDebounce, resetear]);

  // Manejador de cambio de colonia
  const handleColoniaChange = useCallback((colonia: string) => {
    if (colonia === selectedColonia) return;
    
    setSelectedColonia(colonia);
    
    const updateCallback = onInfoChange || onLocationUpdate;
    if (updateCallback && codigoPostalInfo) {
      updateCallback({
        estado: codigoPostalInfo.estado,
        municipio: codigoPostalInfo.municipio,
        localidad: codigoPostalInfo.localidad || codigoPostalInfo.ciudad,
        ciudad: codigoPostalInfo.ciudad,
        zona: codigoPostalInfo.zona,
        colonia
      });
    }
    
    if (onColoniaChange) {
      onColoniaChange(colonia);
    }
  }, [selectedColonia, codigoPostalInfo, onInfoChange, onLocationUpdate, onColoniaChange]);

  // Estados computados
  const displayError = useMemo(() => error || hookError, [error, hookError]);
  const isValid = useMemo(() => 
    localValue.length === 5 && !isLoading && !displayError && codigoPostalInfo,
    [localValue.length, isLoading, displayError, codigoPostalInfo]
  );

  // Manejador de sugerencias
  const handleSugerenciaClick = useCallback((cp: string) => {
    console.log(`[CP_INPUT_COMPLETO] Sugerencia seleccionada: ${cp}`);
    setLocalValue(cp);
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(cp);
    }
    buscarConDebounce(cp);
  }, [onChange, onValueChange, buscarConDebounce]);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Campo de Código Postal */}
      <div className="space-y-2">
        <Label htmlFor="codigo-postal-completo" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            id="codigo-postal-completo"
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder="Ej: 06600"
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

        {/* Error con sugerencias mejoradas */}
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <span>{displayError}</span>
                {sugerencias.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sugerencias.map((sugerencia) => (
                        <button
                          key={sugerencia.codigo_postal}
                          type="button"
                          onClick={() => handleSugerenciaClick(sugerencia.codigo_postal)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                          title={sugerencia.ubicacion}
                        >
                          {sugerencia.codigo_postal}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Información de éxito mejorada */}
        {isValid && codigoPostalInfo && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <div className="flex items-center justify-between">
                <span>✓ {codigoPostalInfo.municipio}, {codigoPostalInfo.estado}</span>
                <span className="text-xs opacity-75">
                  {codigoPostalInfo.fuente === 'database' ? '🗄️ BD' : 
                   codigoPostalInfo.fuente === 'api_externa' ? '🌐 API' : '💾 Cache'}
                </span>
              </div>
              {codigoPostalInfo.localidad && codigoPostalInfo.localidad !== codigoPostalInfo.municipio && (
                <div className="text-xs mt-1">
                  📍 {codigoPostalInfo.localidad}
                  {codigoPostalInfo.zona && ` • ${codigoPostalInfo.zona}`}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Selector de Colonia COMPLETO (sin auto-selección) */}
      {codigoPostalInfo && codigoPostalInfo.colonias.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="colonia-select-completo">
            Colonia *
            <span className="text-sm text-muted-foreground ml-2">
              ({codigoPostalInfo.colonias.length} disponibles)
            </span>
          </Label>
          
          <Select value={selectedColonia} onValueChange={handleColoniaChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecciona una colonia" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
              {codigoPostalInfo.colonias.map((coloniaObj, index) => (
                <SelectItem 
                  key={`${coloniaObj.colonia}-${index}`} 
                  value={coloniaObj.colonia} 
                  className="cursor-pointer hover:bg-accent"
                >
                  <div className="flex flex-col">
                    <span>{coloniaObj.colonia}</span>
                    {coloniaObj.tipo_asentamiento && (
                      <span className="text-xs text-muted-foreground">
                        {coloniaObj.tipo_asentamiento}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {codigoPostalInfo.colonias.length === 1 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm text-muted-foreground">
                Solo hay una colonia disponible para este código postal
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
