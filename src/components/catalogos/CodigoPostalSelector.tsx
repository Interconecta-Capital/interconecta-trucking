
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { useCodigoPostalMexicanoNacional } from '@/hooks/useCodigoPostalMexicanoNacional';

interface CodigoPostalSelectorProps {
  value?: string;
  onCodigoChange?: (codigo: string) => void;
  onDatosChange?: (datos: any) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export function CodigoPostalSelector({
  value = '',
  onCodigoChange,
  onDatosChange,
  label = 'Código Postal',
  required = false,
  error
}: CodigoPostalSelectorProps) {
  const [codigoPostal, setCodigoPostal] = useState(value);
  const [coloniaSeleccionada, setColoniaSeleccionada] = useState('');
  
  const {
    direccionInfo,
    loading, 
    error: errorCodigo, 
    consultarCodigoPostal 
  } = useCodigoPostalMexicanoNacional();

  const [datosCodigo, setDatosCodigo] = useState<any>(null);
  const [colonias, setColonias] = useState<any[]>([]);

  useEffect(() => {
    if (codigoPostal && codigoPostal.length === 5) {
      handleBuscarCodigo();
    }
  }, [codigoPostal]);

  const handleBuscarCodigo = async () => {
    try {
      const datos = await consultarCodigoPostal(codigoPostal);
      if (datos) {
        setDatosCodigo(datos);
        
        // For now, use mock colonias data
        const mockColonias = [
          { colonia: 'Centro', descripcion: 'Centro' },
          { colonia: 'Norte', descripcion: 'Norte' },
          { colonia: 'Sur', descripcion: 'Sur' }
        ];
        setColonias(mockColonias);
        
        if (onDatosChange) {
          onDatosChange({
            codigo_postal: codigoPostal,
            estado: datos.estado || direccionInfo.estado,
            municipio: datos.municipio || direccionInfo.municipio,
            ...datos
          });
        }
      }
    } catch (error) {
      console.error('Error al buscar código postal:', error);
    }
  };

  const handleCodigoChange = (newCodigo: string) => {
    setCodigoPostal(newCodigo);
    if (onCodigoChange) {
      onCodigoChange(newCodigo);
    }
  };

  const handleColoniaChange = (colonia: string) => {
    setColoniaSeleccionada(colonia);
    if (onDatosChange && datosCodigo) {
      onDatosChange({
        codigo_postal: codigoPostal,
        estado: datosCodigo.estado || direccionInfo.estado,
        municipio: datosCodigo.municipio || direccionInfo.municipio,
        colonia: colonia,
        ...datosCodigo
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigo-postal">
          {label} {required && '*'}
        </Label>
        <div className="flex gap-2">
          <Input
            id="codigo-postal"
            value={codigoPostal}
            onChange={(e) => handleCodigoChange(e.target.value)}
            placeholder="12345"
            maxLength={5}
            className={error ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleBuscarCodigo}
            disabled={loading || codigoPostal.length !== 5}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {errorCodigo && (
          <p className="text-sm text-red-600">Error al buscar código postal</p>
        )}
      </div>

      {(datosCodigo || direccionInfo.estado) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Estado</Label>
            <Input value={datosCodigo?.estado || direccionInfo.estado || ''} readOnly className="bg-gray-50" />
          </div>
          <div>
            <Label>Municipio</Label>
            <Input value={datosCodigo?.municipio || direccionInfo.municipio || ''} readOnly className="bg-gray-50" />
          </div>
        </div>
      )}

      {colonias.length > 0 && (
        <div>
          <Label>Colonia</Label>
          <Select value={coloniaSeleccionada} onValueChange={handleColoniaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una colonia..." />
            </SelectTrigger>
            <SelectContent>
              {colonias.map((colonia: any, index: number) => (
                <SelectItem key={index} value={colonia.colonia || colonia.descripcion}>
                  {colonia.colonia || colonia.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
