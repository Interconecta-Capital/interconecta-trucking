
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';
import type { RFCValidationResult } from '@/utils/rfcValidation';

interface DatosEmisorProps {
  data: {
    tipoCreacion?: string;
    tipoCfdi?: string;
    rfcEmisor?: string;
    nombreEmisor?: string;
    transporteInternacional?: string | boolean;
    registroIstmo?: boolean;
    cartaPorteVersion?: string;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export function DatosEmisor({ data, onChange, onNext, onPrev }: DatosEmisorProps) {
  const [validacionRFC, setValidacionRFC] = useState<RFCValidationResult>({ 
    esValido: true, 
    mensaje: '',
    errores: []
  });

  // Validar RFC cuando cambie
  useEffect(() => {
    if (data.rfcEmisor) {
      const resultado = RFCValidator.validarRFC(data.rfcEmisor);
      setValidacionRFC(resultado);
    } else {
      setValidacionRFC({ 
        esValido: true, 
        mensaje: '',
        errores: []
      });
    }
  }, [data.rfcEmisor]);

  const handleRFCChange = (rfc: string) => {
    const rfcFormateado = RFCValidator.formatearRFC(rfc);
    onChange({ ...data, rfcEmisor: rfcFormateado });
    
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

  const canContinue = data.rfcEmisor && data.nombreEmisor && validacionRFC.esValido;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Datos del Emisor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuración básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoCreacion">Tipo de Creación</Label>
            <Select
              value={data.tipoCreacion || 'manual'}
              onValueChange={(value) => onChange({ ...data, tipoCreacion: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="plantilla">Desde Plantilla</SelectItem>
                <SelectItem value="documento">Desde Documento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoCfdi">Tipo de CFDI</Label>
            <Select
              value={data.tipoCfdi || 'Traslado'}
              onValueChange={(value) => onChange({ ...data, tipoCfdi: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Traslado">Traslado</SelectItem>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Datos del emisor */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rfcEmisor">RFC del Emisor *</Label>
            <div className="space-y-2">
              <Input
                id="rfcEmisor"
                value={data.rfcEmisor || ''}
                onChange={(e) => handleRFCChange(e.target.value)}
                placeholder="Ej: XAXX010101000"
                className={!validacionRFC.esValido ? 'border-red-500' : ''}
                maxLength={13}
              />
              {data.rfcEmisor && (
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
            <Label htmlFor="nombreEmisor">Nombre/Razón Social del Emisor *</Label>
            <Input
              id="nombreEmisor"
              value={data.nombreEmisor || ''}
              onChange={(e) => onChange({ ...data, nombreEmisor: e.target.value })}
              placeholder="Nombre completo o razón social"
            />
          </div>
        </div>

        {/* Configuraciones adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transporteInternacional">Transporte Internacional</Label>
            <Select
              value={typeof data.transporteInternacional === 'boolean' 
                ? (data.transporteInternacional ? 'Sí' : 'No')
                : (data.transporteInternacional || 'No')
              }
              onValueChange={(value) => onChange({ ...data, transporteInternacional: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Sí">Sí</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cartaPorteVersion">Versión Carta Porte</Label>
            <Select
              value={data.cartaPorteVersion || '3.1'}
              onValueChange={(value) => onChange({ ...data, cartaPorteVersion: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Versión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3.1">3.1 (Recomendado)</SelectItem>
                <SelectItem value="3.0">3.0</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex justify-between pt-4">
          {onPrev && (
            <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
          )}
          <Button 
            onClick={onNext} 
            disabled={!canContinue}
            className="flex items-center gap-2 ml-auto"
          >
            Continuar a Receptor
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
