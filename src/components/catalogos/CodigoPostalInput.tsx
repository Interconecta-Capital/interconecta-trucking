
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCodigoPostal, useColoniasPorCP } from '@/hooks/useCatalogos';
import { CatalogoSelector } from './CatalogoSelector';

interface CodigoPostalInputProps {
  label?: string;
  value?: string;
  onValueChange: (codigoPostal: string) => void;
  onInfoChange?: (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  required?: boolean;
  className?: string;
  showInfo?: boolean;
  coloniaValue?: string;
  onColoniaChange?: (colonia: string) => void;
}

export const CodigoPostalInput: React.FC<CodigoPostalInputProps> = ({
  label = "Código Postal",
  value = '',
  onValueChange,
  onInfoChange,
  required = false,
  className,
  showInfo = true,
  coloniaValue,
  onColoniaChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualInfo, setManualInfo] = useState({
    estado: '',
    municipio: '',
    colonia: ''
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Queries para código postal y colonias - solo buscar si el CP es válido
  const shouldSearch = debouncedValue.length === 5 && /^\d{5}$/.test(debouncedValue);
  
  const { data: cpInfo, isLoading: loadingCP, error: errorCP } = useCodigoPostal(
    debouncedValue,
    shouldSearch
  );

  const { data: colonias = [], isLoading: loadingColonias } = useColoniasPorCP(
    debouncedValue,
    shouldSearch && !!cpInfo
  );

  // Actualizar información cuando cambie cpInfo
  useEffect(() => {
    if (cpInfo && onInfoChange) {
      onInfoChange({
        estado: cpInfo.estado_descripcion,
        municipio: cpInfo.municipio_clave,
        localidad: cpInfo.localidad_clave || undefined
      });
      setShowManualEntry(false);
    } else if (shouldSearch && !cpInfo && !loadingCP && onInfoChange) {
      // Si no se encuentra el CP, mostrar opción de entrada manual
      setShowManualEntry(true);
      if (manualInfo.estado || manualInfo.municipio || manualInfo.colonia) {
        onInfoChange({
          estado: manualInfo.estado,
          municipio: manualInfo.municipio,
          colonia: manualInfo.colonia
        });
      }
    }
  }, [cpInfo, onInfoChange, shouldSearch, loadingCP, manualInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    setInputValue(newValue);
    onValueChange(newValue);
    
    // Reset manual entry when CP changes
    if (newValue !== debouncedValue) {
      setShowManualEntry(false);
      setManualInfo({ estado: '', municipio: '', colonia: '' });
    }
  };

  const handleColoniaSelect = (clave: string) => {
    if (onColoniaChange) {
      onColoniaChange(clave);
      if (onInfoChange) {
        const colonia = colonias.find(c => c.clave_colonia === clave);
        onInfoChange({
          estado: cpInfo?.estado_descripcion,
          municipio: cpInfo?.municipio_clave,
          localidad: cpInfo?.localidad_clave || undefined,
          colonia: colonia?.descripcion
        });
      }
    }
  };

  const handleManualInfoChange = (field: string, value: string) => {
    const newManualInfo = { ...manualInfo, [field]: value };
    setManualInfo(newManualInfo);
    
    if (onInfoChange) {
      onInfoChange({
        estado: newManualInfo.estado,
        municipio: newManualInfo.municipio,
        colonia: newManualInfo.colonia
      });
    }
  };

  const isValid = shouldSearch && cpInfo && !errorCP;
  const isWarning = shouldSearch && !cpInfo && !errorCP && !loadingCP;
  const isInvalid = !shouldSearch && inputValue.length > 0 && inputValue.length < 5;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="12345"
            maxLength={5}
            className={cn(
              "pr-10",
              isValid && "border-green-500",
              isWarning && "border-yellow-500",
              isInvalid && "border-red-500"
            )}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loadingCP ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : isValid ? (
              <MapPin className="h-4 w-4 text-green-500" />
            ) : isWarning ? (
              <Info className="h-4 w-4 text-yellow-500" />
            ) : isInvalid ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
        </div>

        {isInvalid && (
          <p className="text-sm text-red-500">
            El código postal debe tener 5 dígitos
          </p>
        )}

        {isWarning && (
          <p className="text-sm text-yellow-600">
            Código postal válido pero no encontrado en catálogos. Puede continuar ingresando la información manualmente.
          </p>
        )}
      </div>

      {/* Información del código postal */}
      {showInfo && isValid && cpInfo && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Información del CP
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="secondary">{cpInfo.estado_descripcion}</Badge>
              </div>
              
              {cpInfo.estimulo_frontera && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Estímulo Frontera
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entrada manual cuando no se encuentra el CP */}
      {showInfo && showManualEntry && shouldSearch && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Información Manual
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Estado</Label>
                <Input
                  value={manualInfo.estado}
                  onChange={(e) => handleManualInfoChange('estado', e.target.value)}
                  placeholder="Nombre del estado"
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Municipio</Label>
                <Input
                  value={manualInfo.municipio}
                  onChange={(e) => handleManualInfoChange('municipio', e.target.value)}
                  placeholder="Nombre del municipio"
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Colonia</Label>
                <Input
                  value={manualInfo.colonia}
                  onChange={(e) => handleManualInfoChange('colonia', e.target.value)}
                  placeholder="Nombre de la colonia"
                  className="h-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selector de colonia automático */}
      {isValid && colonias.length > 0 && onColoniaChange && (
        <CatalogoSelector
          label="Colonia"
          placeholder="Seleccionar colonia..."
          value={coloniaValue || ''}
          onValueChange={handleColoniaSelect}
          items={colonias.map(c => ({
            id: c.clave_colonia,
            clave: c.clave_colonia,
            descripcion: c.descripcion
          }))}
          loading={loadingColonias}
        />
      )}
    </div>
  );
};
