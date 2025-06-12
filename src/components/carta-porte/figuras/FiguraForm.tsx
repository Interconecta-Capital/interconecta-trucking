
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { useEstados, useFigurasTransporte } from '@/hooks/useCatalogos';
import { RFCValidator } from '@/utils/rfcValidation';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';

interface FiguraFormProps {
  figura?: FiguraTransporte;
  onSave: (figura: FiguraTransporte) => void;
  onCancel: () => void;
}

const TIPOS_FIGURA = [
  { clave: '01', descripcion: 'Operador' },
  { clave: '02', descripcion: 'Propietario' },
  { clave: '03', descripcion: 'Arrendador' },
  { clave: '04', descripcion: 'Notificado' }
];

export function FiguraForm({ figura, onSave, onCancel }: FiguraFormProps) {
  const [formData, setFormData] = useState<FiguraTransporte>({
    tipo_figura: '',
    rfc_figura: '',
    nombre_figura: '',
    num_licencia: '',
    residencia_fiscal_figura: '',
    num_reg_id_trib_figura: '',
    domicilio: {
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      localidad: '',
      municipio: '',
      estado: '',
      pais: 'MEX',
      codigo_postal: '',
    },
  });

  const [rfcValidation, setRfcValidation] = useState<ReturnType<typeof RFCValidator.validarRFC>>({
    esValido: true,
    errores: []
  });

  const { data: estados = [] } = useEstados();

  useEffect(() => {
    if (figura) {
      setFormData(figura);
    }
  }, [figura]);

  const handleTipoFiguraChange = (value: string) => {
    if (value) {
      setFormData(prev => ({ ...prev, tipo_figura: value }));
    }
  };

  const handleRFCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, rfc_figura: rfc }));
    
    if (rfc.length > 0) {
      const validation = RFCValidator.validarRFC(rfc);
      setRfcValidation(validation);
    } else {
      setRfcValidation({ esValido: true, errores: [] });
    }
  };

  const handleDomicilioChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio!,
        [field]: value
      }
    }));
  };

  const handleCodigoPostalChange = (codigoPostal: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio!,
        codigo_postal: codigoPostal
      }
    }));
  };

  const handleInfoChange = (info: any) => {
    if (info.estado) {
      handleDomicilioChange('estado', info.estado);
    }
    if (info.municipio) {
      handleDomicilioChange('municipio', info.municipio);
    }
    if (info.localidad) {
      handleDomicilioChange('localidad', info.localidad);
    }
  };

  const handleColoniaChange = (colonia: string) => {
    handleDomicilioChange('colonia', colonia);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSave(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.tipo_figura &&
      formData.rfc_figura &&
      formData.nombre_figura &&
      formData.domicilio?.codigo_postal &&
      formData.domicilio?.calle &&
      formData.domicilio?.numero_exterior &&
      (formData.rfc_figura === '' || rfcValidation.esValido)
    );
  };

  const tipoSeleccionado = TIPOS_FIGURA.find(t => t.clave === formData.tipo_figura);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{figura ? 'Editar' : 'Agregar'} Figura del Transporte</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Figura *</Label>
              <Select 
                value={formData.tipo_figura} 
                onValueChange={handleTipoFiguraChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo de figura..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_FIGURA.map((tipo) => (
                    <SelectItem key={tipo.clave} value={tipo.clave}>
                      {tipo.clave} - {tipo.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tipoSeleccionado && (
                <Badge variant="secondary" className="mt-1">
                  {tipoSeleccionado.descripcion}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>RFC *</Label>
              <div className="relative">
                <Input
                  value={formData.rfc_figura}
                  onChange={handleRFCChange}
                  placeholder="RFC de la figura"
                  className={
                    formData.rfc_figura && !rfcValidation.esValido ? 'border-red-500' : 
                    formData.rfc_figura && rfcValidation.esValido ? 'border-green-500' : ''
                  }
                />
                {formData.rfc_figura && rfcValidation.esValido && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              
              {formData.rfc_figura && !rfcValidation.esValido && rfcValidation.errores.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {rfcValidation.errores[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre/Razón Social *</Label>
              <Input
                value={formData.nombre_figura}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_figura: e.target.value }))}
                placeholder="Nombre completo o razón social"
              />
            </div>

            <div className="space-y-2">
              <Label>Número de Licencia</Label>
              <Input
                value={formData.num_licencia || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, num_licencia: e.target.value }))}
                placeholder="Número de licencia (solo para operadores)"
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Domicilio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>País</Label>
                <Select 
                  value={formData.domicilio?.pais || 'MEX'} 
                  onValueChange={(value) => handleDomicilioChange('pais', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEX">México</SelectItem>
                    <SelectItem value="USA">Estados Unidos</SelectItem>
                    <SelectItem value="CAN">Canadá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CodigoPostalInput
                value={formData.domicilio?.codigo_postal || ''}
                onValueChange={handleCodigoPostalChange}
                onInfoChange={handleInfoChange}
                coloniaValue={formData.domicilio?.colonia}
                onColoniaChange={handleColoniaChange}
                required
              />

              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select 
                  value={formData.domicilio?.estado || ''} 
                  onValueChange={(value) => handleDomicilioChange('estado', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.clave} value={estado.clave}>
                        {estado.clave} - {estado.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Calle *</Label>
                <Input
                  value={formData.domicilio?.calle || ''}
                  onChange={(e) => handleDomicilioChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Municipio</Label>
                <Input
                  value={formData.domicilio?.municipio || ''}
                  onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número Exterior *</Label>
                <Input
                  value={formData.domicilio?.numero_exterior || ''}
                  onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
                  placeholder="123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={formData.domicilio?.numero_interior || ''}
                  onChange={(e) => handleDomicilioChange('numero_interior', e.target.value)}
                  placeholder="A"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              {figura ? 'Actualizar' : 'Agregar'} Figura
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
