
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { codigosPostalesService, DireccionCompleta } from '@/services/codigosPostalesService';

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
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [direccionInfo, setDireccionInfo] = useState<DireccionCompleta | null>(null);
  const [selectedColonia, setSelectedColonia] = useState(coloniaValue || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Función para validar código postal con API real
  const validateCodigoPostal = useCallback(async (codigo: string) => {
    if (!codigo || codigo.length !== 5) {
      setValidationError('');
      setDireccionInfo(null);
      setSelectedColonia('');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      const direccion = await codigosPostalesService.buscarDireccionPorCP(codigo);
      
      if (direccion) {
        setDireccionInfo(direccion);
        
        // Auto-seleccionar colonia si solo hay una
        if (direccion.colonias.length === 1) {
          setSelectedColonia(direccion.colonias[0]);
          const updateCallback = onInfoChange || onLocationUpdate;
          if (updateCallback) {
            updateCallback({
              estado: direccion.estado,
              municipio: direccion.municipio,
              localidad: direccion.localidad,
              colonia: direccion.colonias[0]
            });
          }
          if (onColoniaChange) {
            onColoniaChange(direccion.colonias[0]);
          }
        } else {
          setSelectedColonia('');
          const updateCallback = onInfoChange || onLocationUpdate;
          if (updateCallback) {
            updateCallback({
              estado: direccion.estado,
              municipio: direccion.municipio,
              localidad: direccion.localidad,
              colonia: ''
            });
          }
        }
      } else {
        setValidationError('Código postal no encontrado');
        setDireccionInfo(null);
        setSelectedColonia('');
      }
    } catch (error) {
      console.error('Error validating postal code:', error);
      setValidationError('Error al consultar código postal');
      setDireccionInfo(null);
      setSelectedColonia('');
    } finally {
      setIsValidating(false);
    }
  }, [onInfoChange, onLocationUpdate, onColoniaChange]);

  // Sincronizar valores externos
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setSelectedColonia(coloniaValue || '');
  }, [coloniaValue]);

  // Manejador de cambios con debounce
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
    setDireccionInfo(null);
    setSelectedColonia('');

    if (newValue.length === 5) {
      const timer = setTimeout(() => {
        validateCodigoPostal(newValue);
      }, 500);
      setDebounceTimer(timer);
    } else {
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

  // Manejador para cambio de colonia
  const handleColoniaChange = useCallback((colonia: string) => {
    setSelectedColonia(colonia);
    
    const updateCallback = onInfoChange || onLocationUpdate;
    if (updateCallback && direccionInfo) {
      updateCallback({
        estado: direccionInfo.estado,
        municipio: direccionInfo.municipio,
        localidad: direccionInfo.localidad,
        colonia
      });
    }
    
    if (onColoniaChange) {
      onColoniaChange(colonia);
    }
  }, [direccionInfo, onInfoChange, onLocationUpdate, onColoniaChange]);

  // Estados computados
  const displayError = useMemo(() => error || validationError, [error, validationError]);
  const isValid = useMemo(() => 
    localValue.length === 5 && !isValidating && !displayError && direccionInfo,
    [localValue.length, isValidating, displayError, direccionInfo]
  );

  // Limpiar timer al desmontar
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
            placeholder="Ej: 62574"
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
        
        {isValid && direccionInfo && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>✓ {direccionInfo.municipio}, {direccionInfo.estado}</span>
          </div>
        )}
      </div>

      {/* Selector de Colonia (solo si hay múltiples) */}
      {direccionInfo && direccionInfo.colonias.length > 1 && (
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
              {direccionInfo.colonias.map((colonia, index) => (
                <SelectItem key={`${colonia}-${index}`} value={colonia} className="cursor-pointer hover:bg-accent">
                  {colonia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
