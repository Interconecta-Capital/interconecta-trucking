
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { ConfiguracionPrincipal } from './configuracion/ConfiguracionPrincipal';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (config: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const isValid = () => {
    // Validación más permisiva para permitir continuar
    const hasBasicInfo = data.rfcEmisor && data.nombreEmisor && data.rfcReceptor && data.nombreReceptor;
    const hasTransportInfo = data.cartaPorteVersion;
    
    console.log('Validando configuración:', {
      hasBasicInfo,
      hasTransportInfo,
      rfcEmisor: data.rfcEmisor,
      nombreEmisor: data.nombreEmisor,
      rfcReceptor: data.rfcReceptor,
      nombreReceptor: data.nombreReceptor,
      cartaPorteVersion: data.cartaPorteVersion
    });

    return hasBasicInfo && hasTransportInfo;
  };

  const handleNext = () => {
    console.log('Intentando continuar con datos:', data);
    if (isValid()) {
      console.log('Validación exitosa, continuando...');
      onNext();
    } else {
      console.log('Validación fallida');
    }
  };

  const valid = isValid();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración Inicial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfiguracionPrincipal
            data={data}
            onChange={onChange}
          />

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleNext} 
              disabled={!valid}
              className="flex items-center gap-2"
            >
              Continuar a Ubicaciones
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Debug info */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p>Debug - Válido: {valid ? 'Sí' : 'No'}</p>
            <p>RFC Emisor: {data.rfcEmisor || 'Vacío'}</p>
            <p>RFC Receptor: {data.rfcReceptor || 'Vacío'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
