
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useCatalogos } from '@/hooks/useCatalogos';

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

// Cache local para códigos postales
const codigoPostalCache = new Map<string, {
  locationInfo: any;
  colonias: string[];
  timestamp: number;
}>();

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

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
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [locationInfo, setLocationInfo] = useState<{
    estado?: string;
    municipio?: string;
    localidad?: string;
  }>({});
  const [colonias, setColonias] = useState<string[]>([]);
  const [selectedColonia, setSelectedColonia] = useState(coloniaValue || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { buscarCodigoPostal, buscarColoniasPorCP } = useCatalogos();

  // Sincronizar valores externos
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setSelectedColonia(coloniaValue || '');
  }, [coloniaValue]);

  // Función para verificar cache
  const getCachedData = useCallback((codigo: string) => {
    const cached = codigoPostalCache.get(codigo);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, []);

  // Función para guardar en cache
  const setCachedData = useCallback((codigo: string, locationInfo: any, colonias: string[]) => {
    codigoPostalCache.set(codigo, {
      locationInfo,
      colonias,
      timestamp: Date.now()
    });
  }, []);

  // Función optimizada para validar código postal
  const validateCodigoPostal = useCallback(async (codigo: string) => {
    if (!codigo || codigo.length !== 5) {
      setValidationError('');
      setLocationInfo({});
      setColonias([]);
      setSelectedColonia('');
      return;
    }

    // Verificar cache primero
    const cachedData = getCachedData(codigo);
    if (cachedData) {
      setLocationInfo(cachedData.locationInfo);
      setColonias(cachedData.colonias);
      
      if (cachedData.colonias.length === 1) {
        setSelectedColonia(cachedData.colonias[0]);
        const updateCallback = onInfoChange || onLocationUpdate;
        if (updateCallback) {
          updateCallback({
            ...cachedData.locationInfo,
            colonia: cachedData.colonias[0]
          });
        }
        if (onColoniaChange) {
          onColoniaChange(cachedData.colonias[0]);
        }
      }
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Realizar búsquedas en paralelo para mejor rendimiento
      const [cpResult, coloniasResult] = await Promise.all([
        buscarCodigoPostal(codigo),
        buscarColoniasPorCP(codigo)
      ]);
      
      if (cpResult) {
        const newLocationInfo = {
          estado: cpResult.estado_descripcion || '',
          municipio: cpResult.municipio_descripcion || cpResult.municipio_clave || '',
          localidad: cpResult.localidad_descripcion || cpResult.localidad_clave || '',
        };
        
        setLocationInfo(newLocationInfo);
        
        // Procesar colonias disponibles
        const coloniasDisponibles = coloniasResult.map(col => col.colonia);
        setColonias(coloniasDisponibles);
        
        // Guardar en cache para futuras consultas
        setCachedData(codigo, newLocationInfo, coloniasDisponibles);
        
        // Auto-seleccionar colonia si solo hay una
        if (coloniasDisponibles.length === 1) {
          setSelectedColonia(coloniasDisponibles[0]);
          const updateCallback = onInfoChange || onLocationUpdate;
          if (updateCallback) {
            updateCallback({
              ...newLocationInfo,
              colonia: coloniasDisponibles[0]
            });
          }
          if (onColoniaChange) {
            onColoniaChange(coloniasDisponibles[0]);
          }
        } else {
          // Limpiar colonia seleccionada si hay múltiples opciones
          setSelectedColonia('');
          const updateCallback = onInfoChange || onLocationUpdate;
          if (updateCallback) {
            updateCallback({
              ...newLocationInfo,
              colonia: ''
            });
          }
        }
      } else {
        setValidationError('Código postal no encontrado');
        setLocationInfo({});
        setColonias([]);
        setSelectedColonia('');
      }
    } catch (error) {
      console.error('Error validating postal code:', error);
      setValidationError('Error al validar código postal');
      setLocationInfo({});
      setColonias([]);
      setSelectedColonia('');
    } finally {
      setIsValidating(false);
    }
  }, [buscarCodigoPostal, buscarColoniasPorCP, getCachedData, setCachedData, onInfoChange, onLocationUpdate, onColoniaChange]);

  // Manejador optimizado de cambios con debounce mejorado
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    setLocalValue(newValue);
    
    // Llamar callback inmediatamente
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(newValue);
    }

    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Limpiar estados inmediatamente
    setValidationError('');
    setLocationInfo({});
    setColonias([]);
    setSelectedColonia('');

    if (newValue.length === 5) {
      // Debounce optimizado para validación
      const timer = setTimeout(() => {
        validateCodigoPostal(newValue);
      }, 300); // Reducido de 1000ms a 300ms
      setDebounceTimer(timer);
    } else {
      // Limpiar callbacks si el código no está completo
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
  }, [onChange, onValueChange, onInfoChange, onLocationUpdate, validateCodigoPostal, debounceTimer]);

  // Manejador memoizado para cambio de colonia
  const handleColoniaChange = useCallback((colonia: string) => {
    setSelectedColonia(colonia);
    
    const updateCallback = onInfoChange || onLocationUpdate;
    if (updateCallback) {
      updateCallback({
        ...locationInfo,
        colonia
      });
    }
    
    if (onColoniaChange) {
      onColoniaChange(colonia);
    }
  }, [locationInfo, onInfoChange, onLocationUpdate, onColoniaChange]);

  // Estados computados memoizados
  const displayError = useMemo(() => error || validationError, [error, validationError]);
  const isValid = useMemo(() => 
    localValue.length === 5 && !isValidating && !displayError && locationInfo.estado,
    [localValue.length, isValidating, displayError, locationInfo.estado]
  );

  // Limpiar timer al desmontar componente
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

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
            placeholder="12345"
            maxLength={5}
            disabled={disabled || isValidating}
            className={`${
              displayError ? 'border-red-500' : isValid ? 'border-green-500' : ''
            } ${isValidating ? 'opacity-50' : ''}`}
          />
          
          {isValidating && (
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

        {displayError && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{displayError}</span>
          </div>
        )}
        
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Código postal válido</span>
          </div>
        )}
      </div>

      {/* Información Automática de Ubicación */}
      {locationInfo.estado && (
        <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Información de ubicación
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-600">Estado:</span>
              <p className="text-gray-800">{locationInfo.estado}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Municipio:</span>
              <p className="text-gray-800">{locationInfo.municipio}</p>
            </div>
            
            {locationInfo.localidad && (
              <div>
                <span className="font-medium text-gray-600">Localidad:</span>
                <p className="text-gray-800">{locationInfo.localidad}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selector de Colonia Optimizado */}
      {colonias.length > 1 && (
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
              {colonias.map((colonia, index) => (
                <SelectItem key={`${colonia}-${index}`} value={colonia} className="cursor-pointer hover:bg-accent">
                  {colonia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Colonia Única (Solo Mostrar) */}
      {colonias.length === 1 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Colonia
          </Label>
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-gray-700 font-medium">
            {colonias[0]}
          </div>
        </div>
      )}
    </div>
  );
}
