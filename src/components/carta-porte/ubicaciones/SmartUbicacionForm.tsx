import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Save, Star } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionFrecuente } from '@/types/ubicaciones';

interface SmartUbicacionFormProps {
  ubicacion?: UbicacionCompleta;
  onSave: (ubicacion: UbicacionCompleta) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'uso_count'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes: UbicacionFrecuente[];
}

export function SmartUbicacionForm({
  ubicacion,
  onSave,
  onCancel,
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes
}: SmartUbicacionFormProps) {
  const [formData, setFormData] = useState<UbicacionCompleta>(() => {
    if (ubicacion) return ubicacion;
    
    return {
      id: crypto.randomUUID(),
      tipo_estacion: '01',
      id_ubicacion: generarId('Origen'),
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
    };
  });

  const handleFieldChange = <K extends keyof UbicacionCompleta>(
    field: K,
    value: UbicacionCompleta[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDomicilioChange = <K extends keyof UbicacionCompleta['domicilio']>(
    field: K,
    value: UbicacionCompleta['domicilio'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        [field]: value
      }
    }));
  };

  const handleSaveToFavorites = () => {
    if (onSaveToFavorites) {
      onSaveToFavorites({
        nombre: formData.nombre_remitente_destinatario || 'Ubicación sin nombre',
        tipo_ubicacion: formData.tipo_ubicacion || 'Origen',
        rfc_remitente_destinatario: formData.rfc_remitente_destinatario,
        nombre_remitente_destinatario: formData.nombre_remitente_destinatario,
        domicilio: {
          ...formData.domicilio
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const loadFromFrecuente = (frecuente: UbicacionFrecuente) => {
    setFormData(prev => ({
      ...prev,
      tipo_ubicacion: frecuente.tipo_ubicacion,
      rfc_remitente_destinatario: frecuente.rfc_remitente_destinatario,
      nombre_remitente_destinatario: frecuente.nombre_remitente_destinatario,
      domicilio: {
        ...frecuente.domicilio
      }
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Ubicaciones frecuentes */}
      {ubicacionesFrecuentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Ubicaciones Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ubicacionesFrecuentes.map((frecuente) => (
                <Button
                  key={frecuente.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadFromFrecuente(frecuente)}
                  className="justify-start"
                >
                  <MapPin className="h-3 w-3 mr-2" />
                  {frecuente.nombre_remitente_destinatario || frecuente.nombre}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Información de la Ubicación</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveToFavorites}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar como frecuente
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tipo de ubicación y datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ubicación *</Label>
              <Select
                value={formData.tipo_ubicacion || ''}
                onValueChange={(value: 'Origen' | 'Destino' | 'Paso Intermedio') => 
                  handleFieldChange('tipo_ubicacion', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Origen">Origen</SelectItem>
                  <SelectItem value="Destino">Destino</SelectItem>
                  <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Estación</Label>
              <Input
                value={formData.tipo_estacion || ''}
                onChange={(e) => handleFieldChange('tipo_estacion', e.target.value)}
                placeholder="Ej: 01"
              />
            </div>

            <div className="space-y-2">
              <Label>ID Ubicación</Label>
              <Input
                value={formData.id_ubicacion || ''}
                onChange={(e) => handleFieldChange('id_ubicacion', e.target.value)}
                placeholder="ID único"
              />
            </div>
          </div>

          {/* RFC y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RFC Remitente/Destinatario</Label>
              <Input
                value={formData.rfc_remitente_destinatario || ''}
                onChange={(e) => handleFieldChange('rfc_remitente_destinatario', e.target.value)}
                placeholder="RFC"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre Remitente/Destinatario</Label>
              <Input
                value={formData.nombre_remitente_destinatario || ''}
                onChange={(e) => handleFieldChange('nombre_remitente_destinatario', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-4">
            <h4 className="font-medium">Domicilio</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>País *</Label>
                <Select
                  value={formData.domicilio.pais}
                  onValueChange={(value) => handleDomicilioChange('pais', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEX">México</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Código Postal *</Label>
                <Input
                  value={formData.domicilio.codigo_postal}
                  onChange={(e) => handleDomicilioChange('codigo_postal', e.target.value)}
                  placeholder="00000"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado *</Label>
                <Input
                  value={formData.domicilio.estado}
                  onChange={(e) => handleDomicilioChange('estado', e.target.value)}
                  placeholder="Estado"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Municipio *</Label>
                <Input
                  value={formData.domicilio.municipio}
                  onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>

              <div className="space-y-2">
                <Label>Colonia *</Label>
                <Input
                  value={formData.domicilio.colonia}
                  onChange={(e) => handleDomicilioChange('colonia', e.target.value)}
                  placeholder="Colonia"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Calle *</Label>
                <Input
                  value={formData.domicilio.calle}
                  onChange={(e) => handleDomicilioChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Exterior</Label>
                <Input
                  value={formData.domicilio.numero_exterior || ''}
                  onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
                  placeholder="No. Ext"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={formData.domicilio.numero_interior || ''}
                  onChange={(e) => handleDomicilioChange('numero_interior', e.target.value)}
                  placeholder="No. Int"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input
                value={formData.domicilio.referencia || ''}
                onChange={(e) => handleDomicilioChange('referencia', e.target.value)}
                placeholder="Referencias adicionales"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Guardar Ubicación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
