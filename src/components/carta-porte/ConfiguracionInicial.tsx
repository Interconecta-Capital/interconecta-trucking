
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
    const hasBasicInfo = data.rfcEmisor && data.nombreEmisor && data.rfcReceptor && data.nombreReceptor;
    const hasTransportInfo = data.cartaPorteVersion && data.uso_cfdi;
    
    // Convertir a boolean para comparación consistente
    const transporteInt = typeof data.transporteInternacional === 'string' 
      ? data.transporteInternacional === 'true' || data.transporteInternacional === 'Sí'
      : Boolean(data.transporteInternacional);
    
    const registroIstmo = typeof data.registroIstmo === 'string'
      ? data.registroIstmo === 'true' || data.registroIstmo === 'Sí'
      : Boolean(data.registroIstmo);

    return hasBasicInfo && hasTransportInfo;
  };

  const handleNext = () => {
    if (isValid()) {
      onNext();
    }
  };

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
              disabled={!isValid()}
              className="flex items-center gap-2"
            >
              Continuar a Ubicaciones
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
