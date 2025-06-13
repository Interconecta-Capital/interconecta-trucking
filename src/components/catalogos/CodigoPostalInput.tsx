
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, CheckCircle } from 'lucide-react';
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
  const [locationInfo, setLocationInfo] = useState<{
    estado?: string;
    municipio?: string;
    localidad?: string;
  }>({});
  const [colonias, setColonias] = useState<string[]>([]);
  const [selectedColonia, setSelectedColonia] = useState(coloniaValue || '');
  const { buscarCodigoPostal, buscarColoniasPorCP } = useCatalogos();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setSelectedColonia(coloniaValue || '');
  }, [coloniaValue]);

  const validateCodigoPostal = async (codigo: string) => {
    if (!codigo || codigo.length !== 5) {
      setValidationError('');
      setLocationInfo({});
      setColonias([]);
      setSelectedColonia('');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Buscar información del código postal
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
        
        // Actualizar colonias disponibles
        const coloniasDisponibles = coloniasResult.map(col => col.colonia);
        setColonias(coloniasDisponibles);
        
        // Si solo hay una colonia, seleccionarla automáticamente
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
          // Si hay múltiples colonias, actualizar sin colonia
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
    setLocationInfo({});
    setColonias([]);
    setSelectedColonia('');

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

  const handleColoniaChange = (colonia: string) => {
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
  };

  const displayError = error || validationError;
  const isValid = localValue.length === 5 && !isValidating && !displayError && locationInfo.estado;

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
            className={`${displayError ? 'border-red-500' : isValid ? 'border-green-500' : ''} ${isValidating ? 'opacity-50' : ''}`}
          />
          
          {isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
          <h4 className="text-sm font-medium text-green-800">Información de ubicación</h4>
          
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

      {/* Selector de Colonia */}
      {colonias.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="colonia-select">
            Colonia
            {required && <span className="text-red-500">*</span>}
          </Label>
          
          <Select value={selectedColonia} onValueChange={handleColoniaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una colonia" />
            </SelectTrigger>
            <SelectContent>
              {colonias.map((colonia, index) => (
                <SelectItem key={index} value={colonia}>
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
          <Label>Colonia</Label>
          <div className="p-2 bg-gray-50 border rounded-md text-sm text-gray-700">
            {colonias[0]}
          </div>
        </div>
      )}
    </div>
  );
}
