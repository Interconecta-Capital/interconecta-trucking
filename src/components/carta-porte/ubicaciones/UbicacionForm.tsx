import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RFCValidator } from '@/utils/rfcValidation';
import { Ubicacion, UbicacionFrecuente } from '@/hooks/useUbicaciones';
import { UbicacionFormHeader } from './UbicacionFormHeader';
import { UbicacionesFrecuentesCard } from './UbicacionesFrecuentesCard';
import { UbicacionBasicInfo } from './UbicacionBasicInfo';
import { UbicacionRFCSection } from './UbicacionRFCSection';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UbicacionFormProps {
  ubicacion?: Ubicacion;
  onSave: (ubicacion: Ubicacion) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes?: UbicacionFrecuente[];
}

export function UbicacionForm({ 
  ubicacion, 
  onSave, 
  onCancel, 
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes = []
}: UbicacionFormProps) {
  const [formData, setFormData] = useState<Ubicacion>({
    idUbicacion: '',
    tipoUbicacion: undefined as any,
    rfcRemitenteDestinatario: '',
    nombreRemitenteDestinatario: '',
    fechaHoraSalidaLlegada: '',
    distanciaRecorrida: 0,
    ordenSecuencia: 1,
    domicilio: {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numExterior: '',
      numInterior: '',
      referencia: '',
    },
  });

  const [rfcValidation, setRfcValidation] = useState<ReturnType<typeof RFCValidator.validarRFC>>({
    esValido: true,
    errores: []
  });

  const [showFrecuentes, setShowFrecuentes] = useState(false);

  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
    }
  }, [ubicacion]);

  const handleTipoChange = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    const newId = generarId(tipo);
    
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId,
    }));
  };

  const handleRFCChange = (rfc: string) => {
    if (rfc.length > 0) {
      const rfcFormateado = RFCValidator.formatearRFC(rfc);
      const validation = RFCValidator.validarRFC(rfcFormateado);
      
      setFormData(prev => ({ 
        ...prev, 
        rfcRemitenteDestinatario: rfcFormateado 
      }));
      setRfcValidation(validation);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        rfcRemitenteDestinatario: rfc 
      }));
      setRfcValidation({ esValido: true, errores: [] });
    }
  };

  const handleLocationUpdate = (locationData: any) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        estado: locationData.estado || '',
        municipio: locationData.municipio || '',
        localidad: locationData.localidad || '',
        colonia: locationData.colonia || '',
      }
    }));
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        if (parent === 'domicilio') {
          return {
            ...prev,
            domicilio: {
              ...prev.domicilio,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFormValid()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleSaveToFavorites = () => {
    if (onSaveToFavorites && formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario) {
      onSaveToFavorites({
        nombreUbicacion: formData.nombreRemitenteDestinatario,
        rfcAsociado: formData.rfcRemitenteDestinatario,
        domicilio: formData.domicilio
      });
    }
  };

  const cargarUbicacionFrecuente = (frecuente: UbicacionFrecuente) => {
    setFormData(prev => ({
      ...prev,
      rfcRemitenteDestinatario: frecuente.rfcAsociado,
      nombreRemitenteDestinatario: frecuente.nombreUbicacion,
      domicilio: frecuente.domicilio
    }));
    setShowFrecuentes(false);
  };

  const isFormValid = () => {
    const hasValidType = formData.tipoUbicacion != null && formData.tipoUbicacion !== undefined;
    const hasValidRFC = formData.rfcRemitenteDestinatario === '' || rfcValidation.esValido;
    const hasValidData = formData.nombreRemitenteDestinatario && 
                        formData.domicilio.codigoPostal &&
                        formData.domicilio.estado &&
                        formData.domicilio.calle;
    
    return hasValidType && hasValidRFC && hasValidData;
  };

  return (
    <Card className="w-full">
      <UbicacionFormHeader
        ubicacion={ubicacion}
        ubicacionesFrecuentes={ubicacionesFrecuentes}
        onToggleFrecuentes={() => setShowFrecuentes(!showFrecuentes)}
      />

      <CardContent>
        {showFrecuentes && (
          <UbicacionesFrecuentesCard
            ubicacionesFrecuentes={ubicacionesFrecuentes}
            onCargarUbicacion={cargarUbicacionFrecuente}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <UbicacionBasicInfo
            formData={formData}
            onTipoChange={handleTipoChange}
            onFechaChange={(fecha) => handleFieldChange('fechaHoraSalidaLlegada', fecha)}
          />

          <UbicacionRFCSection
            rfc={formData.rfcRemitenteDestinatario}
            nombre={formData.nombreRemitenteDestinatario}
            rfcValidation={rfcValidation}
            onRFCChange={handleRFCChange}
            onNombreChange={(nombre) => handleFieldChange('nombreRemitenteDestinatario', nombre)}
            onSaveToFavorites={handleSaveToFavorites}
            canSaveToFavorites={!!(formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario)}
          />

          {/* Domicilio Section con Autocompletado Inteligente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Domicilio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>País *</Label>
                <Select 
                  value={formData.domicilio.pais} 
                  onValueChange={(value) => handleFieldChange('domicilio.pais', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="México">México</SelectItem>
                    <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                    <SelectItem value="Canadá">Canadá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CodigoPostalInput
                value={formData.domicilio.codigoPostal}
                onChange={(cp) => handleFieldChange('domicilio.codigoPostal', cp)}
                onLocationUpdate={handleLocationUpdate}
                coloniaValue={formData.domicilio.colonia}
                onColoniaChange={(colonia) => handleFieldChange('domicilio.colonia', colonia)}
                required
              />
            </div>

            {/* Campos auto-completados (solo lectura si se llenaron automáticamente) */}
            {formData.domicilio.estado && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input
                    value={formData.domicilio.estado}
                    onChange={(e) => handleFieldChange('domicilio.estado', e.target.value)}
                    placeholder="Estado"
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Municipio *</Label>
                  <Input
                    value={formData.domicilio.municipio}
                    onChange={(e) => handleFieldChange('domicilio.municipio', e.target.value)}
                    placeholder="Municipio"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Calle *</Label>
                <Input
                  value={formData.domicilio.calle}
                  onChange={(e) => handleFieldChange('domicilio.calle', e.target.value)}
                  placeholder="Nombre de la calle"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Número Exterior *</Label>
                <Input
                  value={formData.domicilio.numExterior}
                  onChange={(e) => handleFieldChange('domicilio.numExterior', e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={formData.domicilio.numInterior}
                  onChange={(e) => handleFieldChange('domicilio.numInterior', e.target.value)}
                  placeholder="A, B, 1, 2..."
                />
              </div>

              <div className="space-y-2">
                <Label>Referencia</Label>
                <Input
                  value={formData.domicilio.referencia}
                  onChange={(e) => handleFieldChange('domicilio.referencia', e.target.value)}
                  placeholder="Entre calles, cerca de..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Distancia Recorrida (km)</Label>
              <Input
                type="number"
                value={formData.distanciaRecorrida}
                onChange={(e) => handleFieldChange('distanciaRecorrida', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
