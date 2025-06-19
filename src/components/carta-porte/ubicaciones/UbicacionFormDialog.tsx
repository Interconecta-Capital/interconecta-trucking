
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { AlertTriangle, MapPin, Save, X } from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';

interface UbicacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubicacion: UbicacionCompleta | null;
  onSave: (ubicacion: UbicacionCompleta) => void;
  existingUbicaciones: UbicacionCompleta[];
}

export function UbicacionFormDialog({
  open,
  onOpenChange,
  ubicacion,
  onSave,
  existingUbicaciones
}: UbicacionFormDialogProps) {
  const [formData, setFormData] = useState<UbicacionCompleta>({
    id: '',
    id_ubicacion: '',
    tipo_ubicacion: 'Origen',
    rfc_remitente_destinatario: '',
    nombre_remitente_destinatario: '',
    fecha_hora_salida_llegada: '',
    distancia_recorrida: 0,
    domicilio: {
      pais: 'MEX',
      codigo_postal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      referencia: ''
    }
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
    } else {
      // Generar nuevo ID y resetear formulario
      const newId = `UBI_${Date.now()}`;
      setFormData({
        id: newId,
        id_ubicacion: newId,
        tipo_ubicacion: 'Origen',
        rfc_remitente_destinatario: '',
        nombre_remitente_destinatario: '',
        fecha_hora_salida_llegada: '',
        distancia_recorrida: 0,
        domicilio: {
          pais: 'MEX',
          codigo_postal: '',
          estado: '',
          municipio: '',
          colonia: '',
          calle: '',
          numero_exterior: '',
          numero_interior: '',
          referencia: ''
        }
      });
    }
    setErrors([]);
  }, [ubicacion, open]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('domicilio.')) {
      const domicilioField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        domicilio: {
          ...prev.domicilio,
          [domicilioField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Validaciones básicas
    if (!formData.tipo_ubicacion) {
      newErrors.push('Tipo de ubicación es obligatorio');
    }

    if (!formData.nombre_remitente_destinatario?.trim()) {
      newErrors.push('Nombre del remitente/destinatario es obligatorio');
    }

    if (!formData.domicilio.codigo_postal?.trim()) {
      newErrors.push('Código postal es obligatorio');
    }

    if (!formData.domicilio.estado?.trim()) {
      newErrors.push('Estado es obligatorio');
    }

    if (!formData.domicilio.municipio?.trim()) {
      newErrors.push('Municipio es obligatorio');
    }

    if (!formData.domicilio.colonia?.trim()) {
      newErrors.push('Colonia es obligatoria');
    }

    if (!formData.domicilio.calle?.trim()) {
      newErrors.push('Calle es obligatoria');
    }

    if (!formData.domicilio.numero_exterior?.trim()) {
      newErrors.push('Número exterior es obligatorio');
    }

    // Validar RFC si se proporciona
    if (formData.rfc_remitente_destinatario?.trim()) {
      const rfcValidation = RFCValidator.validarRFC(formData.rfc_remitente_destinatario);
      if (!rfcValidation.esValido) {
        newErrors.push(`RFC inválido: ${rfcValidation.mensaje}`);
      }
    }

    // Validar que no haya múltiples orígenes/destinos
    const existingTipos = existingUbicaciones
      .filter(u => u.id_ubicacion !== formData.id_ubicacion)
      .map(u => u.tipo_ubicacion);

    if (formData.tipo_ubicacion === 'Origen' && existingTipos.includes('Origen')) {
      newErrors.push('Ya existe una ubicación de origen');
    }

    if (formData.tipo_ubicacion === 'Destino' && existingTipos.includes('Destino')) {
      newErrors.push('Ya existe una ubicación de destino');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {ubicacion ? 'Editar Ubicación' : 'Agregar Nueva Ubicación'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Errores */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-800">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_ubicacion">Tipo de Ubicación *</Label>
              <Select
                value={formData.tipo_ubicacion}
                onValueChange={(value) => handleInputChange('tipo_ubicacion', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Origen">Origen</SelectItem>
                  <SelectItem value="Destino">Destino</SelectItem>
                  <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_remitente_destinatario">Nombre Remitente/Destinatario *</Label>
              <Input
                id="nombre_remitente_destinatario"
                value={formData.nombre_remitente_destinatario || ''}
                onChange={(e) => handleInputChange('nombre_remitente_destinatario', e.target.value)}
                placeholder="Nombre de la empresa o persona"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc_remitente_destinatario">RFC (opcional)</Label>
              <Input
                id="rfc_remitente_destinatario"
                value={formData.rfc_remitente_destinatario || ''}
                onChange={(e) => handleInputChange('rfc_remitente_destinatario', e.target.value.toUpperCase())}
                placeholder="XAXX010101000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_hora_salida_llegada">Fecha y Hora (opcional)</Label>
              <Input
                id="fecha_hora_salida_llegada"
                type="datetime-local"
                value={formData.fecha_hora_salida_llegada || ''}
                onChange={(e) => handleInputChange('fecha_hora_salida_llegada', e.target.value)}
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Domicilio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo_postal">Código Postal *</Label>
                <Input
                  id="codigo_postal"
                  value={formData.domicilio.codigo_postal}
                  onChange={(e) => handleInputChange('domicilio.codigo_postal', e.target.value)}
                  placeholder="00000"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={formData.domicilio.estado}
                  onChange={(e) => handleInputChange('domicilio.estado', e.target.value)}
                  placeholder="Estado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">Municipio *</Label>
                <Input
                  id="municipio"
                  value={formData.domicilio.municipio}
                  onChange={(e) => handleInputChange('domicilio.municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colonia">Colonia *</Label>
                <Input
                  id="colonia"
                  value={formData.domicilio.colonia}
                  onChange={(e) => handleInputChange('domicilio.colonia', e.target.value)}
                  placeholder="Colonia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calle">Calle *</Label>
                <Input
                  id="calle"
                  value={formData.domicilio.calle}
                  onChange={(e) => handleInputChange('domicilio.calle', e.target.value)}
                  placeholder="Nombre de la calle"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_exterior">Número Exterior *</Label>
                <Input
                  id="numero_exterior"
                  value={formData.domicilio.numero_exterior}
                  onChange={(e) => handleInputChange('domicilio.numero_exterior', e.target.value)}
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_interior">Número Interior</Label>
                <Input
                  id="numero_interior"
                  value={formData.domicilio.numero_interior || ''}
                  onChange={(e) => handleInputChange('domicilio.numero_interior', e.target.value)}
                  placeholder="A, B, 1, 2..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia</Label>
                <Input
                  id="referencia"
                  value={formData.domicilio.referencia || ''}
                  onChange={(e) => handleInputChange('domicilio.referencia', e.target.value)}
                  placeholder="Entre calles, cerca de..."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
