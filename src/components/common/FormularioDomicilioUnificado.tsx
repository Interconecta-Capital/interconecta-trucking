import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, CheckCircle, Loader2, Info } from 'lucide-react';
import { useCodigoPostalMexicanoNacional } from '@/hooks/useCodigoPostalMexicanoNacional';

export interface DomicilioUnificado {
  pais: string;
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  ciudad?: string;
  colonia: string;
  calle: string;
  numExterior: string;
  numInterior?: string;
  referencia?: string;
}

interface FormularioDomicilioUnificadoProps {
  domicilio: DomicilioUnificado;
  onDomicilioChange: (campo: keyof DomicilioUnificado, valor: string) => void;
  onDireccionCompleta?: (direccion: DomicilioUnificado) => void;
  mostrarDistancia?: boolean;
  distanciaRecorrida?: number;
  onDistanciaChange?: (distancia: number) => void;
  camposOpcionales?: Array<keyof DomicilioUnificado>;
  readonly?: boolean;
  className?: string;
  usarAPIMexicana?: boolean;
}

export function FormularioDomicilioUnificado({
  domicilio,
  onDomicilioChange,
  onDireccionCompleta,
  mostrarDistancia = false,
  distanciaRecorrida = 0,
  onDistanciaChange,
  camposOpcionales = ['numInterior', 'referencia', 'localidad'],
  readonly = false,
  className = '',
  usarAPIMexicana = false
}: FormularioDomicilioUnificadoProps) {
  const [coloniaSeleccionada, setColoniaSeleccionada] = useState(domicilio.colonia);
  const [sugerenciasCP, setSugerenciasCP] = useState<Array<{codigo: string, ubicacion: string}>>([]);

  const {
    direccionInfo,
    loading: isLoading,
    error,
    sugerencias,
    buscarConDebounce,
    usarSugerencia
  } = useCodigoPostalMexicanoNacional();

  // Usar las sugerencias del hook nacional
  React.useEffect(() => {
    if (sugerencias && sugerencias.length > 0) {
      const sugerenciasFormateadas = sugerencias.map(s => ({
        codigo: s.codigo,
        ubicacion: s.ubicacion
      }));
      setSugerenciasCP(sugerenciasFormateadas);
    } else {
      setSugerenciasCP([]);
    }
  }, [sugerencias]);

  // Manejar éxito en la búsqueda
  React.useEffect(() => {
    if (direccionInfo && !isLoading && !error) {
      console.log('[FORM_DOMICILIO] Dirección encontrada:', direccionInfo);
      
      // Llenar automáticamente todos los campos
      onDomicilioChange('estado', direccionInfo.estado);
      onDomicilioChange('municipio', direccionInfo.municipio);
      if (direccionInfo.localidad) onDomicilioChange('localidad', direccionInfo.localidad);
      if (direccionInfo.localidad) onDomicilioChange('ciudad', direccionInfo.localidad);
      
      // Resetear colonia para que usuario seleccione
      setColoniaSeleccionada('');
      onDomicilioChange('colonia', '');
    }
  }, [direccionInfo, isLoading, error, onDomicilioChange]);

  // Manejar error
  React.useEffect(() => {
    if (error) {
      console.log('[FORM_DOMICILIO] Error:', error);
      
      // Limpiar campos al fallar
      setColoniaSeleccionada('');
      onDomicilioChange('estado', '');
      onDomicilioChange('municipio', '');
      onDomicilioChange('localidad', '');
      onDomicilioChange('colonia', '');
    }
  }, [error, onDomicilioChange]);

  const handleCPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    onDomicilioChange('codigoPostal', newValue);
    
    if (newValue.length === 5) {
      buscarConDebounce(newValue);
    }
  }, [onDomicilioChange, buscarConDebounce]);

  const handleColoniaChange = useCallback((colonia: string) => {
    setColoniaSeleccionada(colonia);
    onDomicilioChange('colonia', colonia);
    
    if (domicilio.calle && domicilio.numExterior && colonia) {
      onDireccionCompleta?.({
        ...domicilio,
        colonia
      });
    }
  }, [domicilio, onDomicilioChange, onDireccionCompleta]);

  const handleSugerenciaClick = useCallback((cp: string) => {
    onDomicilioChange('codigoPostal', cp);
    usarSugerencia(cp);
  }, [onDomicilioChange, usarSugerencia]);

  const isValid = useMemo(() =>
    domicilio.codigoPostal.length === 5 && !isLoading && !error && direccionInfo,
    [domicilio.codigoPostal, isLoading, error, direccionInfo]
  );

  const status = useMemo(() => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (direccionInfo) return 'success';
    return 'initial';
  }, [isLoading, error, direccionInfo]);

  const esOpcional = useCallback((campo: keyof DomicilioUnificado) => 
    camposOpcionales.includes(campo), [camposOpcionales]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* País y Código Postal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>País *</Label>
          <Select 
            value={domicilio.pais} 
            onValueChange={(value) => onDomicilioChange('pais', value)}
            disabled={readonly}
          >
            <SelectTrigger className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="México">México</SelectItem>
              <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
              <SelectItem value="Canadá">Canadá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo-postal" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Código Postal *
          </Label>
          
          <div className="relative">
            <Input
              id="codigo-postal"
              type="text"
              value={domicilio.codigoPostal}
              onChange={handleCPChange}
              placeholder="Ej: 06600"
              maxLength={5}
              disabled={readonly || isLoading}
              className={`border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm ${
                error ? 'border-red-500' : isValid ? 'border-green-500' : ''
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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <span>{error}</span>
                  {sugerenciasCP.length > 0 && (
                    <div>
                      <p className="text-xs mb-1">Códigos similares:</p>
                      <div className="flex flex-wrap gap-1">
                        {sugerenciasCP.map((sugerencia) => (
                          <button
                            key={sugerencia.codigo}
                            type="button"
                            onClick={() => handleSugerenciaClick(sugerencia.codigo)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                            title={sugerencia.ubicacion}
                          >
                            {sugerencia.codigo}
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
          {isValid && direccionInfo && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                ✓ {direccionInfo.municipio}, {direccionInfo.estado}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Estado y Municipio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 relative">
          <Label>Estado *</Label>
          <Input
            value={domicilio.estado}
            onChange={(e) => onDomicilioChange('estado', e.target.value)}
            placeholder={status === 'initial' ? 'Se autocompleta con el C.P.' : 'Estado'}
            className="bg-white border-gray-100 text-gray-900 shadow-sm pr-10"
            readOnly
          />
          {status === 'loading' && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
          )}
        </div>

        <div className="space-y-2 relative">
          <Label>Municipio *</Label>
          <Input
            value={domicilio.municipio}
            onChange={(e) => onDomicilioChange('municipio', e.target.value)}
            placeholder={status === 'initial' ? 'Se autocompleta con el C.P.' : 'Municipio'}
            className="bg-white border-gray-100 text-gray-900 shadow-sm pr-10"
            readOnly
          />
          {status === 'loading' && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
          )}
        </div>
      </div>

      {/* Localidad y Colonia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!esOpcional('localidad') && (
          <div className="space-y-2">
            <Label>Localidad{esOpcional('localidad') ? '' : ' *'}</Label>
            <Input
              value={domicilio.localidad || ''}
              onChange={(e) => onDomicilioChange('localidad', e.target.value)}
              placeholder={status === 'initial' ? 'Se autocompleta con el C.P.' : 'Localidad'}
              className="bg-white border-gray-100 text-gray-900 shadow-sm"
              readOnly={readonly}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>
            Colonia *
            {direccionInfo && (
              <span className="text-sm text-muted-foreground ml-2">
                ({direccionInfo.colonias.length} disponibles)
              </span>
            )}
          </Label>

          <Select
            value={coloniaSeleccionada}
            onValueChange={handleColoniaChange}
            disabled={readonly || !direccionInfo}
          >
            <SelectTrigger className="bg-white border-gray-100 text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm">
              <SelectValue placeholder={direccionInfo ? 'Selecciona una colonia' : 'Se autocompleta con el C.P.'} />
            </SelectTrigger>
            {direccionInfo && (
              <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
                {direccionInfo.colonias.map((coloniaObj, index) => (
                  <SelectItem
                    key={`${coloniaObj.nombre}-${index}`}
                    value={coloniaObj.nombre}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <div className="flex flex-col">
                      <span>{coloniaObj.nombre}</span>
                      {coloniaObj.tipo && (
                        <span className="text-xs text-muted-foreground">
                          {coloniaObj.tipo}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </Select>
        </div>
      </div>

      {/* Calle y Números */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Calle *</Label>
          <Input
            value={domicilio.calle}
            onChange={(e) => onDomicilioChange('calle', e.target.value)}
            placeholder="Nombre de la calle"
            disabled={readonly}
            className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>Número Exterior *</Label>
          <Input
            value={domicilio.numExterior}
            onChange={(e) => onDomicilioChange('numExterior', e.target.value)}
            placeholder="123"
            disabled={readonly}
            className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
          />
        </div>

        {!esOpcional('numInterior') && (
          <div className="space-y-2">
            <Label>Número Interior{esOpcional('numInterior') ? '' : ' *'}</Label>
            <Input
              value={domicilio.numInterior || ''}
              onChange={(e) => onDomicilioChange('numInterior', e.target.value)}
              placeholder="A, B, 1, 2..."
              disabled={readonly}
              className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Referencias */}
      {!esOpcional('referencia') && (
        <div className="space-y-2">
          <Label>Referencia{esOpcional('referencia') ? '' : ' *'}</Label>
          <Input
            value={domicilio.referencia || ''}
            onChange={(e) => onDomicilioChange('referencia', e.target.value)}
            placeholder="Entre calles, cerca de..."
            disabled={readonly}
            className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
          />
        </div>
      )}

      {/* Distancia Recorrida */}
      {mostrarDistancia && (
        <div className="space-y-2">
          <Label>Distancia Recorrida (km)</Label>
          <Input
            type="number"
            value={distanciaRecorrida}
            onChange={(e) => onDistanciaChange?.(parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="0.1"
            disabled={readonly}
            className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
