
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';
import type { RFCValidationResult } from '@/utils/rfcValidation';

interface DatosReceptorProps {
  data: {
    rfcReceptor?: string;
    nombreReceptor?: string;
    usoCfdi?: string;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DatosReceptor({ data, onChange, onNext, onPrev }: DatosReceptorProps) {
  const [validacionRFC, setValidacionRFC] = useState<RFCValidationResult>({ 
    esValido: true, 
    mensaje: '',
    errores: []
  });

  // Validar RFC cuando cambie
  useEffect(() => {
    if (data.rfcReceptor) {
      const resultado = RFCValidator.validarRFC(data.rfcReceptor);
      setValidacionRFC(resultado);
    } else {
      setValidacionRFC({ 
        esValido: true, 
        mensaje: '',
        errores: []
      });
    }
  }, [data.rfcReceptor]);

  const handleRFCChange = (rfc: string) => {
    const rfcFormateado = RFCValidator.formatearRFC(rfc);
    onChange({ ...data, rfcReceptor: rfcFormateado });
    
    if (rfcFormateado) {
      const resultado = RFCValidator.validarRFC(rfcFormateado);
      setValidacionRFC(resultado);
    } else {
      setValidacionRFC({ 
        esValido: true, 
        mensaje: '',
        errores: []
      });
    }
  };

  const canContinue = data.rfcReceptor && data.nombreReceptor && validacionRFC.esValido;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Datos del Receptor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rfcReceptor">RFC del Receptor *</Label>
            <div className="space-y-2">
              <Input
                id="rfcReceptor"
                value={data.rfcReceptor || ''}
                onChange={(e) => handleRFCChange(e.target.value)}
                placeholder="Ej: XAXX010101000"
                className={!validacionRFC.esValido ? 'border-red-500' : ''}
                maxLength={13}
              />
              {data.rfcReceptor && (
                <div className="flex items-center gap-2">
                  {validacionRFC.esValido ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      RFC Válido
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      RFC Inválido
                    </Badge>
                  )}
                </div>
              )}
              {!validacionRFC.esValido && validacionRFC.errores && (
                <div className="text-sm text-red-600">
                  {validacionRFC.errores.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreReceptor">Nombre/Razón Social del Receptor *</Label>
            <Input
              id="nombreReceptor"
              value={data.nombreReceptor || ''}
              onChange={(e) => onChange({ ...data, nombreReceptor: e.target.value })}
              placeholder="Nombre completo o razón social"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usoCfdi">Uso del CFDI</Label>
            <Select
              value={data.usoCfdi || 'S01'}
              onValueChange={(value) => onChange({ ...data, usoCfdi: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona uso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S01">S01 - Sin efectos fiscales</SelectItem>
                <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                <SelectItem value="G02">G02 - Devoluciones, descuentos o bonificaciones</SelectItem>
                <SelectItem value="G03">G03 - Gastos en general</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!canContinue}
            className="flex items-center gap-2"
          >
            Continuar a Ubicaciones
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
