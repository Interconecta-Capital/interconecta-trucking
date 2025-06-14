
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SmartAddressInput } from '@/components/ai/SmartAddressInput';
import { AutocompletedInput } from '@/components/ai/AutocompletedInput';
import { useSmartAutocomplete } from '@/hooks/ai/useSmartAutocomplete';
import { RFCValidator } from '@/utils/rfcValidation';
import { MapPin, User, Save, X, Building } from 'lucide-react';

interface SmartUbicacionFormProps {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SmartUbicacionForm({ 
  ubicacion, 
  onSave, 
  onCancel, 
  isLoading = false 
}: SmartUbicacionFormProps) {
  const [formData, setFormData] = React.useState({
    tipoUbicacion: 'Origen',
    rfcRemitenteDestinatario: '',
    nombreRemitenteDestinatario: '',
    fechaHoraSalidaLlegada: '',
    domicilio: {
      pais: 'MEX',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numExterior: '',
      numInterior: '',
      referencia: ''
    },
    ...ubicacion
  });

  const {
    suggestions: rfcSuggestions,
    loading: rfcLoading,
    getSuggestions: getRFCSuggestions
  } = useSmartAutocomplete({
    tipo: 'direccion', // Usamos direccion para obtener empresas conocidas
    minLength: 3
  });

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddressSelect = (addressData: any) => {
    if (addressData) {
      setFormData(prev => ({
        ...prev,
        domicilio: {
          ...prev.domicilio,
          calle: addressData.street || prev.domicilio.calle,
          colonia: addressData.colonia || prev.domicilio.colonia,
          municipio: addressData.municipio || prev.domicilio.municipio,
          estado: addressData.estado || prev.domicilio.estado,
          codigoPostal: addressData.codigoPostal || prev.domicilio.codigoPostal
        }
      }));
    }
  };

  const handleRFCChange = (value: string) => {
    handleFieldChange('rfcRemitenteDestinatario', value.toUpperCase());
    
    if (value.length >= 3) {
      getRFCSuggestions(value, { 
        tipo: 'empresa',
        buscar_rfc: true 
      });
    }
  };

  const handleRFCSuggestionSelect = (suggestion: any) => {
    const rfcData = suggestion.metadata;
    if (rfcData) {
      setFormData(prev => ({
        ...prev,
        rfcRemitenteDestinatario: rfcData.rfc || suggestion.text,
        nombreRemitenteDestinatario: rfcData.nombre || prev.nombreRemitenteDestinatario
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isFormValid = () => {
    const rfcValidation = RFCValidator.validarRFC(formData.rfcRemitenteDestinatario);
    return (
      formData.rfcRemitenteDestinatario &&
      formData.nombreRemitenteDestinatario &&
      formData.domicilio.codigoPostal &&
      formData.domicilio.calle &&
      formData.domicilio.numExterior &&
      rfcValidation.esValido
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Ubicación */}
          <div className="space-y-2">
            <Label>Tipo de Ubicación</Label>
            <select
              value={formData.tipoUbicacion}
              onChange={(e) => handleFieldChange('tipoUbicacion', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Origen">Origen</option>
              <option value="Destino">Destino</option>
              <option value="Paso Intermedio">Paso Intermedio</option>
            </select>
          </div>

          {/* RFC con Autocompletado Inteligente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              RFC *
            </Label>
            <AutocompletedInput
              value={formData.rfcRemitenteDestinatario}
              onChange={handleRFCChange}
              onSuggestionSelect={handleRFCSuggestionSelect}
              suggestions={rfcSuggestions}
              loading={rfcLoading}
              placeholder="Buscar RFC de empresa..."
              className="uppercase"
              showConfidence={true}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre / Razón Social *
            </Label>
            <Input
              value={formData.nombreRemitenteDestinatario}
              onChange={(e) => handleFieldChange('nombreRemitenteDestinatario', e.target.value)}
              placeholder="Nombre completo o razón social"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <Label>Fecha y Hora de {formData.tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}</Label>
            <Input
              type="datetime-local"
              value={formData.fechaHoraSalidaLlegada}
              onChange={(e) => handleFieldChange('fechaHoraSalidaLlegada', e.target.value)}
            />
          </div>

          {/* Dirección Inteligente */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Domicilio</Label>
            
            <div className="space-y-2">
              <Label>Dirección Completa *</Label>
              <SmartAddressInput
                value={formData.domicilio.calle}
                onChange={(value) => handleFieldChange('domicilio.calle', value)}
                onAddressSelect={handleAddressSelect}
                placeholder="Ingrese calle y número..."
                field="direccion-completa"
                showValidation={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número Exterior *</Label>
                <Input
                  value={formData.domicilio.numExterior}
                  onChange={(e) => handleFieldChange('domicilio.numExterior', e.target.value)}
                  placeholder="Número exterior"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={formData.domicilio.numInterior}
                  onChange={(e) => handleFieldChange('domicilio.numInterior', e.target.value)}
                  placeholder="Número interior (opcional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colonia</Label>
                <Input
                  value={formData.domicilio.colonia}
                  onChange={(e) => handleFieldChange('domicilio.colonia', e.target.value)}
                  placeholder="Colonia"
                />
              </div>

              <div className="space-y-2">
                <Label>Código Postal *</Label>
                <Input
                  value={formData.domicilio.codigoPostal}
                  onChange={(e) => handleFieldChange('domicilio.codigoPostal', e.target.value)}
                  placeholder="CP"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Municipio</Label>
                <Input
                  value={formData.domicilio.municipio}
                  onChange={(e) => handleFieldChange('domicilio.municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={formData.domicilio.estado}
                  onChange={(e) => handleFieldChange('domicilio.estado', e.target.value)}
                  placeholder="Estado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referencias</Label>
              <Input
                value={formData.domicilio.referencia}
                onChange={(e) => handleFieldChange('domicilio.referencia', e.target.value)}
                placeholder="Referencias adicionales (opcional)"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
