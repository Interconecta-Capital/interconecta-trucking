
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertTriangle, Navigation } from 'lucide-react';
import { SATValidation } from '@/utils/satValidation';
import { CodigoPostalSelector } from '@/components/geograficos/CodigoPostalSelector';

interface UbicacionFormProps {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  existingUbicaciones?: any[];
}

export function UbicacionForm({ ubicacion, onSave, onCancel, existingUbicaciones = [] }: UbicacionFormProps) {
  const [formData, setFormData] = useState({
    id: ubicacion?.id || crypto.randomUUID(),
    tipo_ubicacion: ubicacion?.tipo_ubicacion || '',
    id_ubicacion: ubicacion?.id_ubicacion || '',
    rfc_remitente_destinatario: ubicacion?.rfc_remitente_destinatario || '',
    nombre_remitente_destinatario: ubicacion?.nombre_remitente_destinatario || '',
    fecha_hora_salida_llegada: ubicacion?.fecha_hora_salida_llegada || '',
    // *** CORRECCIÓN CRÍTICA: Campo obligatorio para destinos ***
    distancia_recorrida: ubicacion?.distancia_recorrida || 0,
    domicilio: {
      pais: ubicacion?.domicilio?.pais || 'MEX',
      codigo_postal: ubicacion?.domicilio?.codigo_postal || '',
      estado: ubicacion?.domicilio?.estado || '',
      municipio: ubicacion?.domicilio?.municipio || '',
      colonia: ubicacion?.domicilio?.colonia || '',
      calle: ubicacion?.domicilio?.calle || '',
      numero_exterior: ubicacion?.domicilio?.numero_exterior || '',
      numero_interior: ubicacion?.domicilio?.numero_interior || '',
      referencia: ubicacion?.domicilio?.referencia || ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar si se requiere distancia recorrida
  const requiereDistancia = formData.tipo_ubicacion === 'Destino' || formData.tipo_ubicacion === 'Punto Intermedio';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo_ubicacion) {
      newErrors.tipo_ubicacion = 'Tipo de ubicación es requerido';
    }

    if (!formData.id_ubicacion) {
      newErrors.id_ubicacion = 'ID de ubicación es requerido';
    }

    if (!formData.domicilio.codigo_postal) {
      newErrors.codigo_postal = 'Código postal es requerido';
    } else {
      const cpValidation = SATValidation.validarCodigoPostal(formData.domicilio.codigo_postal);
      if (!cpValidation.isValid) {
        newErrors.codigo_postal = cpValidation.message || 'Código postal inválido';
      }
    }

    if (!formData.domicilio.calle?.trim()) {
      newErrors.calle = 'Calle es requerida';
    }

    if (!formData.domicilio.numero_exterior?.trim()) {
      newErrors.numero_exterior = 'Número exterior es requerido';
    }

    // *** VALIDACIÓN CRÍTICA: Distancia obligatoria para destinos ***
    if (requiereDistancia && (!formData.distancia_recorrida || formData.distancia_recorrida <= 0)) {
      newErrors.distancia_recorrida = 'La distancia recorrida es obligatoria para ubicaciones de destino';
    }

    if (formData.rfc_remitente_destinatario) {
      const rfcValidation = SATValidation.validarRFC(formData.rfc_remitente_destinatario);
      if (!rfcValidation.isValid) {
        newErrors.rfc = rfcValidation.message || 'RFC inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tipo_ubicacion">Tipo de Ubicación *</Label>
              <Select
                value={formData.tipo_ubicacion}
                onValueChange={(value) => handleFieldChange('tipo_ubicacion', value)}
              >
                <SelectTrigger className={errors.tipo_ubicacion ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Origen">Origen</SelectItem>
                  <SelectItem value="Destino">Destino</SelectItem>
                  <SelectItem value="Punto Intermedio">Punto Intermedio</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_ubicacion && (
                <p className="text-sm text-red-500 mt-1">{errors.tipo_ubicacion}</p>
              )}
            </div>

            <div>
              <Label htmlFor="id_ubicacion">ID de Ubicación *</Label>
              <Input
                id="id_ubicacion"
                value={formData.id_ubicacion}
                onChange={(e) => handleFieldChange('id_ubicacion', e.target.value)}
                placeholder="OR001, DE001, etc."
                className={errors.id_ubicacion ? 'border-red-500' : ''}
              />
              {errors.id_ubicacion && (
                <p className="text-sm text-red-500 mt-1">{errors.id_ubicacion}</p>
              )}
            </div>

            {/* *** CAMPO CRÍTICO: Distancia recorrida obligatoria para destinos *** */}
            {requiereDistancia && (
              <div>
                <Label htmlFor="distancia_recorrida">
                  Distancia Recorrida (km) *
                </Label>
                <Input
                  id="distancia_recorrida"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.distancia_recorrida}
                  onChange={(e) => handleFieldChange('distancia_recorrida', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className={errors.distancia_recorrida ? 'border-red-500' : ''}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Distancia en kilómetros desde el punto de Origen hasta este {formData.tipo_ubicacion}
                </p>
                {errors.distancia_recorrida && (
                  <p className="text-sm text-red-500 mt-1">{errors.distancia_recorrida}</p>
                )}
              </div>
            )}
          </div>

          {/* Alerta de cumplimiento */}
          {requiereDistancia && (
            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                **Normativa 3.1**: La distancia recorrida es obligatoria para ubicaciones de destino y puntos intermedios.
              </AlertDescription>
            </Alert>
          )}

          {/* Información del remitente/destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfc">RFC Remitente/Destinatario</Label>
              <Input
                id="rfc"
                value={formData.rfc_remitente_destinatario}
                onChange={(e) => handleFieldChange('rfc_remitente_destinatario', e.target.value.toUpperCase())}
                placeholder="RFC123456789"
                className={errors.rfc ? 'border-red-500' : ''}
              />
              {errors.rfc && (
                <p className="text-sm text-red-500 mt-1">{errors.rfc}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nombre">Nombre Remitente/Destinatario</Label>
              <Input
                id="nombre"
                value={formData.nombre_remitente_destinatario}
                onChange={(e) => handleFieldChange('nombre_remitente_destinatario', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Domicilio</h3>
            
            <CodigoPostalSelector
              value={formData.domicilio.codigo_postal}
              onPostalDataChange={(data) => {
                handleFieldChange('domicilio.codigo_postal', data.codigoPostal);
                handleFieldChange('domicilio.estado', data.estado);
                handleFieldChange('domicilio.municipio', data.municipio);
                if (data.colonia) {
                  handleFieldChange('domicilio.colonia', data.colonia);
                }
              }}
              error={errors.codigo_postal}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calle">Calle *</Label>
                <Input
                  id="calle"
                  value={formData.domicilio.calle}
                  onChange={(e) => handleFieldChange('domicilio.calle', e.target.value)}
                  placeholder="Nombre de la calle"
                  className={errors.calle ? 'border-red-500' : ''}
                />
                {errors.calle && (
                  <p className="text-sm text-red-500 mt-1">{errors.calle}</p>
                )}
              </div>

              <div>
                <Label htmlFor="numero_exterior">Número Exterior *</Label>
                <Input
                  id="numero_exterior"
                  value={formData.domicilio.numero_exterior}
                  onChange={(e) => handleFieldChange('domicilio.numero_exterior', e.target.value)}
                  placeholder="123"
                  className={errors.numero_exterior ? 'border-red-500' : ''}
                />
                {errors.numero_exterior && (
                  <p className="text-sm text-red-500 mt-1">{errors.numero_exterior}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_interior">Número Interior</Label>
                <Input
                  id="numero_interior"
                  value={formData.domicilio.numero_interior}
                  onChange={(e) => handleFieldChange('domicilio.numero_interior', e.target.value)}
                  placeholder="A, 101, etc."
                />
              </div>

              <div>
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  value={formData.domicilio.colonia}
                  onChange={(e) => handleFieldChange('domicilio.colonia', e.target.value)}
                  placeholder="Nombre de la colonia"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                value={formData.domicilio.referencia}
                onChange={(e) => handleFieldChange('domicilio.referencia', e.target.value)}
                placeholder="Entre qué calles, cerca de..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
