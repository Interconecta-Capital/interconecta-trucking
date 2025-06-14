
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';
import { useCodigoPostal, useColoniasPorCP } from '@/hooks/useCatalogosReal';
import { useDebounce } from '@/hooks/useDebounce';

interface CodigoPostalSelectorProps {
  codigoPostal: string;
  colonia?: string;
  onCodigoPostalChange: (codigo: string) => void;
  onColoniaChange?: (colonia: string) => void;
  onDatosCompletos?: (datos: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CodigoPostalSelector({
  codigoPostal,
  colonia,
  onCodigoPostalChange,
  onColoniaChange,
  onDatosCompletos,
  error,
  required = false,
  disabled = false,
  className
}: CodigoPostalSelectorProps) {
  const [localCP, setLocalCP] = useState(codigoPostal || '');
  const [localError, setLocalError] = useState('');
  
  const debouncedCP = useDebounce(localCP, 500);
  
  const { 
    data: cpData, 
    isLoading: cpLoading, 
    error: cpError,
    refetch: refetchCP
  } = useCodigoPostal(debouncedCP, debouncedCP.length === 5);
  
  const { 
    data: colonias = [], 
    isLoading: coloniasLoading,
    error: coloniasError,
    refetch: refetchColonias
  } = useColoniasPorCP(debouncedCP, debouncedCP.length === 5);

  // Sincronizar con prop externa
  useEffect(() => {
    if (codigoPostal !== localCP) {
      setLocalCP(codigoPostal || '');
    }
  }, [codigoPostal]);

  // Manejar cambios en el código postal
  useEffect(() => {
    if (debouncedCP !== codigoPostal) {
      onCodigoPostalChange(debouncedCP);
    }
  }, [debouncedCP, onCodigoPostalChange]);

  // Manejar datos completos cuando se carga la información
  useEffect(() => {
    if (cpData && onDatosCompletos) {
      onDatosCompletos({
        codigoPostal: cpData.codigo_postal,
        estado: cpData.estado_descripcion,
        estadoClave: cpData.estado_clave,
        municipio: cpData.municipio_descripcion,
        municipioClave: cpData.municipio_clave,
        localidad: cpData.localidad_descripcion,
        localidadClave: cpData.localidad_clave
      });
    }
  }, [cpData, onDatosCompletos]);

  // Manejar errores
  useEffect(() => {
    if (cpError || coloniasError) {
      setLocalError('Error al validar código postal');
    } else if (debouncedCP.length === 5 && !cpData && !cpLoading) {
      setLocalError('Código postal no encontrado');
    } else {
      setLocalError('');
    }
  }, [cpError, coloniasError, cpData, cpLoading, debouncedCP]);

  const handleCPChange = (value: string) => {
    // Solo permitir números y máximo 5 dígitos
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setLocalCP(cleaned);
    setLocalError('');
    
    // Limpiar colonia al cambiar CP
    if (onColoniaChange) {
      onColoniaChange('');
    }
  };

  const handleRefresh = () => {
    refetchCP();
    refetchColonias();
    setLocalError('');
  };

  const displayError = error || localError;
  const isLoading = cpLoading || coloniasLoading;
  const isValidCP = localCP.length === 5 && /^\d{5}$/.test(localCP);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Código Postal */}
      <div className="space-y-2">
        <Label htmlFor="codigo_postal" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Código Postal
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex gap-2">
          <Input
            id="codigo_postal"
            type="text"
            inputMode="numeric"
            placeholder="12345"
            value={localCP}
            onChange={(e) => handleCPChange(e.target.value)}
            className={displayError ? 'border-red-500' : ''}
            disabled={disabled}
            maxLength={5}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={disabled || !isValidCP}
            title="Validar código postal"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Información del CP */}
      {cpData && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Estado:</span> {cpData.estado_descripcion}
            </div>
            <div>
              <span className="font-medium">Municipio:</span> {cpData.municipio_descripcion}
            </div>
            <div className="md:col-span-2">
              <span className="font-medium">Localidad:</span> {cpData.localidad_descripcion}
            </div>
          </div>
        </div>
      )}

      {/* Selector de Colonias */}
      {colonias.length > 0 && onColoniaChange && (
        <div className="space-y-2">
          <Label htmlFor="colonia">Colonia/Asentamiento</Label>
          <Select
            value={colonia || ''}
            onValueChange={onColoniaChange}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una colonia" />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </SelectTrigger>
            <SelectContent>
              {colonias.map((col, index) => (
                <SelectItem key={index} value={col.colonia}>
                  {col.colonia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && isValidCP && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validando código postal...
        </div>
      )}
    </div>
  );
}
