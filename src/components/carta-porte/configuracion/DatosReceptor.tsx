
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { RFCValidator, RFCValidationResult } from '@/utils/rfcValidation';

interface DatosReceptorProps {
  rfcReceptor: string;
  nombreReceptor: string;
  onRFCChange: (rfc: string) => void;
  onNombreChange: (nombre: string) => void;
}

export function DatosReceptor({ 
  rfcReceptor, 
  nombreReceptor, 
  onRFCChange, 
  onNombreChange 
}: DatosReceptorProps) {
  const [validacionReceptor, setValidacionReceptor] = React.useState<RFCValidationResult>({ 
    esValido: true, 
    errores: [] 
  });

  const handleRFCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    onRFCChange(rfc);
    
    if (rfc.length > 0) {
      const validation = RFCValidator.validarRFC(rfc);
      setValidacionReceptor({
        ...validation,
        errores: validation.errores || []
      });
    } else {
      setValidacionReceptor({ esValido: true, errores: [] });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Receptor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>RFC Receptor *</Label>
          <div className="relative">
            <Input
              value={rfcReceptor}
              onChange={handleRFCChange}
              placeholder="RFC del receptor"
              className={
                rfcReceptor && !validacionReceptor.esValido ? 'border-red-500' : 
                rfcReceptor && validacionReceptor.esValido ? 'border-green-500' : ''
              }
            />
            {rfcReceptor && validacionReceptor.esValido && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
          {rfcReceptor && !validacionReceptor.esValido && validacionReceptor.errores.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validacionReceptor.errores[0]}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label>Nombre/Razón Social Receptor *</Label>
          <Input
            value={nombreReceptor}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Nombre completo o razón social"
          />
        </div>
      </div>
    </div>
  );
}
