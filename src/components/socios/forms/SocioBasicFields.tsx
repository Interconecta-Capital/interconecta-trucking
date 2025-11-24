
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';
import { ValidationIndicator } from '@/components/forms/ValidationIndicator';

interface SocioBasicFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function SocioBasicFields({ formData, onFieldChange, errors }: SocioBasicFieldsProps) {
  const [rfcValidationStatus, setRfcValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [rfcValidationMessage, setRfcValidationMessage] = useState<string>('');

  useEffect(() => {
    if (formData.rfc && formData.rfc.length >= 12) {
      setRfcValidationStatus('validating');
      const validation = RFCValidator.validarRFC(formData.rfc);
      setTimeout(() => {
        if (validation.esValido) {
          setRfcValidationStatus('valid');
          setRfcValidationMessage('');
        } else {
          setRfcValidationStatus('invalid');
          setRfcValidationMessage(validation.errores[0] || 'RFC inválido');
        }
      }, 300);
    } else {
      setRfcValidationStatus('idle');
      setRfcValidationMessage('');
    }
  }, [formData.rfc]);

  const handleRfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    onFieldChange('rfc', rfc);
  };

  const tiposPersona = [
    { value: 'fisica', label: 'Persona Física' },
    { value: 'moral', label: 'Persona Moral' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nombre_razon_social">Nombre / Razón Social *</Label>
          <Input
            id="nombre_razon_social"
            value={formData.nombre_razon_social || ''}
            onChange={(e) => onFieldChange('nombre_razon_social', e.target.value)}
            placeholder="Nombre completo o razón social"
            className={errors?.nombre_razon_social ? 'border-red-500' : ''}
          />
          {errors?.nombre_razon_social && <p className="text-sm text-red-500 mt-1">{errors.nombre_razon_social}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rfc">RFC *</Label>
            <Input
              id="rfc"
              value={formData.rfc || ''}
              onChange={handleRfcChange}
              placeholder="XAXX010101000"
              maxLength={13}
              className="uppercase"
            />
            <ValidationIndicator 
              status={rfcValidationStatus} 
              message={rfcValidationMessage || errors?.rfc}
            />
          </div>

          <div>
            <Label htmlFor="curp">
              CURP {formData.tipo_persona === 'fisica' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="curp"
              value={formData.curp || ''}
              onChange={(e) => onFieldChange('curp', e.target.value.toUpperCase())}
              placeholder="CURP (18 caracteres)"
              maxLength={18}
              className={`uppercase ${formData.tipo_persona === 'fisica' && !formData.curp ? 'border-destructive' : ''}`}
              required={formData.tipo_persona === 'fisica'}
            />
            {formData.tipo_persona === 'fisica' && !formData.curp && (
              <p className="text-xs text-destructive mt-1">
                ⚠️ El CURP es obligatorio para personas físicas
              </p>
            )}
            {formData.tipo_persona === 'moral' && (
              <p className="text-xs text-muted-foreground mt-1">
                Opcional para personas morales
              </p>
            )}
            {errors?.curp && <p className="text-sm text-destructive mt-1">{errors.curp}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo_persona">Tipo de Persona *</Label>
            <Select
              value={formData.tipo_persona || ''} 
              onValueChange={(value) => onFieldChange('tipo_persona', value)}
            >
              <SelectTrigger className={errors?.tipo_persona ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {tiposPersona.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.tipo_persona && <p className="text-sm text-red-500 mt-1">{errors.tipo_persona}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono || ''}
              onChange={(e) => onFieldChange('telefono', e.target.value)}
              placeholder="Número de teléfono"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
