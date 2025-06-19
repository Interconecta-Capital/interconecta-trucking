
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Save, Star } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionFrecuente } from '@/types/ubicaciones';

interface UbicacionFormOptimizadoProps {
  ubicacion: UbicacionCompleta;
  onUbicacionChange: (ubicacion: UbicacionCompleta) => void;
}

export function UbicacionFormOptimizado({ ubicacion, onUbicacionChange }: UbicacionFormOptimizadoProps) {
  const [ubicacionesFrecuentes, setUbicacionesFrecuentes] = useState<UbicacionFrecuente[]>([]);

  const handleFieldChange = <K extends keyof UbicacionCompleta>(
    field: K,
    value: UbicacionCompleta[K]
  ) => {
    onUbicacionChange({
      ...ubicacion,
      [field]: value
    });
  };

  const handleDomicilioChange = <K extends keyof UbicacionCompleta['domicilio']>(
    field: K,
    value: UbicacionCompleta['domicilio'][K]
  ) => {
    onUbicacionChange({
      ...ubicacion,
      domicilio: {
        ...ubicacion.domicilio,
        [field]: value
      }
    });
  };

  const loadFromFrecuente = (frecuente: UbicacionFrecuente) => {
    onUbicacionChange({
      ...ubicacion,
      tipo_ubicacion: frecuente.tipo_ubicacion,
      rfc_remitente_destinatario: frecuente.rfc_remitente_destinatario,
      nombre_remitente_destinatario: frecuente.nombre_remitente_destinatario,
      domicilio: {
        ...frecuente.domicilio
      }
    });
  };

  const guardarComoFrecuente = () => {
    const nuevaFrecuente: Omit<UbicacionFrecuente, 'id' | 'uso_count'> = {
      nombre: ubicacion.nombre_remitente_destinatario || 'Ubicación sin nombre',
      nombreUbicacion: ubicacion.nombre_remitente_destinatario || 'Ubicación sin nombre',
      rfcAsociado: ubicacion.rfc_remitente_destinatario || '',
      tipo_ubicacion: ubicacion.tipo_ubicacion || 'Origen',
      rfc_remitente_destinatario: ubicacion.rfc_remitente_destinatario,
      nombre_remitente_destinatario: ubicacion.nombre_remitente_destinatario,
      domicilio: {
        ...ubicacion.domicilio
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Here you would save to your backend/storage
    console.log('Guardando ubicación frecuente:', nuevaFrecuente);
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
              onClick={guardarComoFrecuente}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar como frecuente
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tipo de ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ubicación *</Label>
              <Select
                value={ubicacion.tipo_ubicacion || ''}
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
                value={ubicacion.tipo_estacion || ''}
                onChange={(e) => handleFieldChange('tipo_estacion', e.target.value)}
                placeholder="Ej: 01 - Origen"
              />
            </div>

            <div className="space-y-2">
              <Label>ID Ubicación</Label>
              <Input
                value={ubicacion.id_ubicacion || ''}
                onChange={(e) => handleFieldChange('id_ubicacion', e.target.value)}
                placeholder="ID único de ubicación"
              />
            </div>
          </div>

          {/* RFC y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RFC Remitente/Destinatario</Label>
              <Input
                value={ubicacion.rfc_remitente_destinatario || ''}
                onChange={(e) => handleFieldChange('rfc_remitente_destinatario', e.target.value)}
                placeholder="RFC"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre Remitente/Destinatario</Label>
              <Input
                value={ubicacion.nombre_remitente_destinatario || ''}
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
                  value={ubicacion.domicilio.pais}
                  onValueChange={(value) => handleDomicilioChange('pais', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEX">México</SelectItem>
                    <SelectItem value="USA">Estados Unidos</SelectItem>
                    <SelectItem value="CAN">Canadá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Código Postal *</Label>
                <Input
                  value={ubicacion.domicilio.codigo_postal}
                  onChange={(e) => handleDomicilioChange('codigo_postal', e.target.value)}
                  placeholder="00000"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado *</Label>
                <Input
                  value={ubicacion.domicilio.estado}
                  onChange={(e) => handleDomicilioChange('estado', e.target.value)}
                  placeholder="Estado"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Municipio *</Label>
                <Input
                  value={ubicacion.domicilio.municipio}
                  onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>

              <div className="space-y-2">
                <Label>Colonia *</Label>
                <Input
                  value={ubicacion.domicilio.colonia}
                  onChange={(e) => handleDomicilioChange('colonia', e.target.value)}
                  placeholder="Colonia"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Calle *</Label>
                <Input
                  value={ubicacion.domicilio.calle}
                  onChange={(e) => handleDomicilioChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Exterior</Label>
                <Input
                  value={ubicacion.domicilio.numero_exterior || ''}
                  onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
                  placeholder="No. Ext"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={ubicacion.domicilio.numero_interior || ''}
                  onChange={(e) => handleDomicilioChange('numero_interior', e.target.value)}
                  placeholder="No. Int"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input
                value={ubicacion.domicilio.referencia || ''}
                onChange={(e) => handleDomicilioChange('referencia', e.target.value)}
                placeholder="Referencias adicionales"
              />
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha y Hora de Salida/Llegada</Label>
              <Input
                type="datetime-local"
                value={ubicacion.fecha_hora_salida_llegada || ''}
                onChange={(e) => handleFieldChange('fecha_hora_salida_llegada', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Distancia Recorrida (km)</Label>
              <Input
                type="number"
                value={ubicacion.distancia_recorrida || ''}
                onChange={(e) => handleFieldChange('distancia_recorrida', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
