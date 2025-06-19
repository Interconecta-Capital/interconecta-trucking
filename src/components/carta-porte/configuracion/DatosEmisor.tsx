
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { RFCValidator, RFCValidationResult } from '@/utils/rfcValidation';

interface DatosEmisorProps {
  rfcEmisor: string;
  nombreEmisor: string;
  onRFCChange: (rfc: string) => void;
  onNombreChange: (nombre: string) => void;
}

export function DatosEmisor({ 
  rfcEmisor, 
  nombreEmisor, 
  onRFCChange, 
  onNombreChange 
}: DatosEmisorProps) {
  const [validacionEmisor, setValidacionEmisor] = React.useState<RFCValidationResult>({ 
    esValido: true, 
    errores: [] 
  });

  const handleRFCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    onRFCChange(rfc);
    
    if (rfc.length > 0) {
      const validation = RFCValidator.validarRFC(rfc);
      setValidacionEmisor({
        ...validation,
        errores: validation.errores || []
      });
    } else {
      setValidacionEmisor({ esValido: true, errores: [] });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Emisor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>RFC Emisor *</Label>
          <div className="relative">
            <Input
              value={rfcEmisor}
              onChange={handleRFCChange}
              placeholder="RFC del emisor"
              className={
                rfcEmisor && !validacionEmisor.esValido ? 'border-red-500' : 
                rfcEmisor && validacionEmisor.esValido ? 'border-green-500' : ''
              }
            />
            {rfcEmisor && validacionEmisor.esValido && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
          {rfcEmisor && !validacionEmisor.esValido && validacionEmisor.errores.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validacionEmisor.errores[0]}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label>Nombre/Razón Social Emisor *</Label>
          <Input
            value={nombreEmisor}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Nombre completo o razón social"
          />
        </div>
      </div>
    </div>
  );
}
