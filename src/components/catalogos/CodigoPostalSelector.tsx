
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { consultarCodigoPostal } from '@/services/catalogosSAT';

interface CodigoPostalSelectorProps {
  value: string;
  onChange: (codigoPostal: string, datos?: any) => void;
  placeholder?: string;
  required?: boolean;
}

interface DatosCodigoPostal {
  estado: string;
  municipio: string;
  ciudad?: string;
  asentamientos?: Array<{
    nombre: string;
    tipo: string;
  }>;
}

export function CodigoPostalSelector({ 
  value, 
  onChange, 
  placeholder = "Código Postal", 
  required = false 
}: CodigoPostalSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [datos, setDatos] = useState<DatosCodigoPostal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultarCP = async (cp: string) => {
    if (!cp || cp.length !== 5) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await consultarCodigoPostal(cp);
      
      if (resultado && typeof resultado === 'object') {
        const datosCP: DatosCodigoPostal = {
          estado: resultado.estado || '',
          municipio: resultado.municipio || '',
          ciudad: resultado.ciudad,
          asentamientos: resultado.asentamientos || []
        };
        
        setDatos(datosCP);
        onChange(cp, datosCP);
      } else {
        setError('Código postal no encontrado');
        setDatos(null);
      }
    } catch (err) {
      console.error('Error consultando código postal:', err);
      setError('Error al consultar el código postal');
      setDatos(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    onChange(newValue);
    
    if (newValue.length === 5) {
      consultarCP(newValue);
    } else {
      setDatos(null);
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={5}
          required={required}
          className={`pr-10 ${error ? 'border-red-500' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {datos && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <p><strong>Estado:</strong> {datos.estado}</p>
          <p><strong>Municipio:</strong> {datos.municipio}</p>
          {datos.ciudad && <p><strong>Ciudad:</strong> {datos.ciudad}</p>}
        </div>
      )}
    </div>
  );
}
