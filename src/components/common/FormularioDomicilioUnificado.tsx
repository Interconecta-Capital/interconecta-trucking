import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, CheckCircle, Loader2, Info } from 'lucide-react';
import { useCodigoPostalUnificado } from '@/hooks/useCodigoPostalUnificado';
import { CodigoPostalMexicanoOptimizado } from '@/components/catalogos/CodigoPostalMexicanoOptimizado';
import { DatosDomicilio } from '@/hooks/useCodigoPostalMexicano';

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
  usarAPIMexicana?: boolean; // Nueva opción para usar APIs reales mexicanas
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
  const [sugerenciasCP, setSugerenciasCP] = useState<Array<{codigo_postal: string, ubicacion: string}>>([]);

  const {
    isLoading,
    error,
    direccionInfo,
    buscarConDebounce
  } = useCodigoPostalUnificado({
    onSuccess: (info) => {
      console.log('[FORM_DOMICILIO] Dirección encontrada:', info);
      
      // Llenar automáticamente todos los campos
      onDomicilioChange('estado', info.estado);
      onDomicilioChange('municipio', info.municipio);
      if (info.localidad) onDomicilioChange('localidad', info.localidad);
      if (info.ciudad) onDomicilioChange('ciudad', info.ciudad);
      
      // Resetear colonia para que usuario seleccione
      setColoniaSeleccionada('');
      onDomicilioChange('colonia', '');
      
      setSugerenciasCP([]);
    },
    onError: (errorMsg, sugerencias = []) => {
      console.log('[FORM_DOMICILIO] Error:', errorMsg);
      setSugerenciasCP(sugerencias);
      
      // Limpiar campos al fallar
      setColoniaSeleccionada('');
      onDomicilioChange('estado', '');
      onDomicilioChange('municipio', '');
      onDomicilioChange('localidad', '');
      onDomicilioChange('colonia', '');
    }
  });

  // Manejar domicilio completo desde el componente mexicano
  const handleDomicilioMexicanoCompleto = useCallback((datosMexicanos: DatosDomicilio) => {
    console.log('[DOMICILIO_MEXICANO_INTEGRADO]', datosMexicanos);
    
    // Mapear datos mexicanos al formato unificado
    const domicilioUnificado: DomicilioUnificado = {
      pais: domicilio.pais,
      codigoPostal: datosMexicanos.codigoPostal,
      estado: datosMexicanos.estado,
      municipio: datosMexicanos.municipio,
      localidad: datosMexicanos.localidad,
      colonia: datosMexicanos.colonia,
      calle: datosMexicanos.calle,
      numExterior: datosMexicanos.numeroExterior,
      numInterior: datosMexicanos.numeroInterior,
      referencia: datosMexicanos.referencia
    };
    
    onDireccionCompleta?.(domicilioUnificado);
  }, [domicilio.pais, onDireccionCompleta]);

  // Si se está usando la API mexicana y el país es México
  if (usarAPIMexicana && domicilio.pais === 'México') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* País */}
        <div className="space-y-2">
          <Label>País *</Label>
          <Select 
            value={domicilio.pais} 
            onValueChange={(value) => onDomicilioChange('pais', value)}
            disabled={readonly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="México">México</SelectItem>
              <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
              <SelectItem value="Canadá">Canadá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Componente mexicano optimizado */}
        <CodigoPostalMexicanoOptimizado
          value={domicilio.codigoPostal}
          onChange={(cp) => onDomicilioChange('codigoPostal', cp)}
          onLocationUpdate={(location) => {
            if (location.estado) onDomicilioChange('estado', location.estado);
            if (location.municipio) onDomicilioChange('municipio', location.municipio);
            if (location.localidad) onDomicilioChange('localidad', location.localidad);
            if (location.colonia) onDomicilioChange('colonia', location.colonia);
          }}
          onDomicilioCompleto={handleDomicilioMexicanoCompleto}
          valorInicial={{
            codigoPostal: domicilio.codigoPostal,
            estado: domicilio.estado,
            municipio: domicilio.municipio,
            localidad: domicilio.localidad,
            colonia: domicilio.colonia,
            calle: domicilio.calle,
            numeroExterior: domicilio.numExterior,
            numeroInterior: domicilio.numInterior,
            referencia: domicilio.referencia
          }}
          mostrarPreview={true}
        />

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
            />
          </div>
        )}
      </div>
    );
  }

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
    
    // Notificar dirección completa si está llena
    if (domicilio.calle && domicilio.numExterior && colonia) {
      onDireccionCompleta?.({
        ...domicilio,
        colonia
      });
    }
  }, [domicilio, onDomicilioChange, onDireccionCompleta]);

  const handleSugerenciaClick = useCallback((cp: string) => {
    onDomicilioChange('codigoPostal', cp);
    buscarConDebounce(cp);
  }, [onDomicilioChange, buscarConDebounce]);

  const isValid = useMemo(() => 
    domicilio.codigoPostal.length === 5 && !isLoading && !error && direccionInfo,
    [domicilio.codigoPostal, isLoading, error, direccionInfo]
  );

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
            <SelectTrigger>
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
              className={`${
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

          {/* Sugerencia para usar API mexicana */}
          {domicilio.pais === 'México' && !usarAPIMexicana && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                💡 Para direcciones mexicanas, considera usar el modo avanzado con APIs oficiales SEPOMEX
              </AlertDescription>
            </Alert>
          )}

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
        <div className="space-y-2">
          <Label>Estado *</Label>
          <Input
            value={domicilio.estado}
            onChange={(e) => onDomicilioChange('estado', e.target.value)}
            placeholder="Estado"
            className="bg-gray-50"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label>Municipio *</Label>
          <Input
            value={domicilio.municipio}
            onChange={(e) => onDomicilioChange('municipio', e.target.value)}
            placeholder="Municipio"
            className="bg-gray-50"
            readOnly
          />
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
              placeholder="Localidad"
              className="bg-gray-50"
              readOnly={readonly}
            />
          </div>
        )}

        {/* Selector de Colonia */}
        {direccionInfo && direccionInfo.colonias.length > 0 && (
          <div className="space-y-2">
            <Label>
              Colonia *
              <span className="text-sm text-muted-foreground ml-2">
                ({direccionInfo.colonias.length} disponibles)
              </span>
            </Label>
            
            <Select value={coloniaSeleccionada} onValueChange={handleColoniaChange} disabled={readonly}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona una colonia" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
                {direccionInfo.colonias.map((coloniaObj, index) => (
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
          </div>
        )}
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
          />
        </div>

        <div className="space-y-2">
          <Label>Número Exterior *</Label>
          <Input
            value={domicilio.numExterior}
            onChange={(e) => onDomicilioChange('numExterior', e.target.value)}
            placeholder="123"
            disabled={readonly}
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
          />
        </div>
      )}
    </div>
  );
}
