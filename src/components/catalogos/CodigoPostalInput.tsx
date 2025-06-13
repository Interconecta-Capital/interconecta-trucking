
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, MapPin } from 'lucide-react';
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
  const { buscarCodigoPostal } = useCatalogos();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateCodigoPostal = async (codigo: string) => {
    if (!codigo || codigo.length !== 5) {
      setValidationError('');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      const result = await buscarCodigoPostal(codigo);
      
      if (result) {
        // Usar onInfoChange si está disponible (nueva interfaz)
        const updateCallback = onInfoChange || onLocationUpdate;
        if (updateCallback) {
          updateCallback({
            estado: result.estado_descripcion || '',
            municipio: result.municipio_clave || '',
            localidad: result.localidad_clave || '',
            colonia: ''
          });
        }
      } else {
        setValidationError('Código postal no encontrado');
      }
    } catch (error) {
      console.error('Error validating postal code:', error);
      setValidationError('Error al validar código postal');
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    setLocalValue(newValue);
    
    // Usar onChange o onValueChange según lo que esté disponible
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(newValue);
    }

    setValidationError('');

    if (newValue.length === 5) {
      validateCodigoPostal(newValue);
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
  };

  const displayError = error || validationError;

  return (
    <div className={`space-y-2 ${className || ''}`}>
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
          className={`${displayError ? 'border-red-500' : ''} ${isValidating ? 'opacity-50' : ''}`}
        />
        
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}
      
      {localValue.length === 5 && !isValidating && !displayError && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <MapPin className="h-4 w-4" />
          <span>Código postal válido</span>
        </div>
      )}
    </div>
  );
}
