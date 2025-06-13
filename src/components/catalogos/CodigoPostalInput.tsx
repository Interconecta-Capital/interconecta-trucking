
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, MapPin } from 'lucide-react';
import { useCatalogos } from '@/hooks/useCatalogos';

interface CodigoPostalInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onLocationUpdate?: (location: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function CodigoPostalInput({
  value = '',
  onChange,
  onLocationUpdate,
  label = 'Código Postal',
  required = false,
  error,
  disabled = false
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
      
      if (result && result.length > 0) {
        const codigoData = result[0];
        
        // Only update location data if callback is provided
        if (onLocationUpdate) {
          onLocationUpdate({
            estado: codigoData.estado || '',
            municipio: codigoData.municipio || '',
            localidad: codigoData.localidad || '',
            colonia: codigoData.colonias?.[0] || ''
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
    
    if (onChange) {
      onChange(newValue);
    }

    // Clear previous validation error
    setValidationError('');

    // Validate when complete
    if (newValue.length === 5) {
      validateCodigoPostal(newValue);
    } else if (onLocationUpdate) {
      // Clear location data when postal code is incomplete
      onLocationUpdate({
        estado: '',
        municipio: '',
        localidad: '',
        colonia: ''
      });
    }
  };

  const displayError = error || validationError;

  return (
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
