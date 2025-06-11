
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RFCValidator } from '@/utils/rfcValidation';
import { Ubicacion, UbicacionFrecuente } from '@/hooks/useUbicaciones';
import { UbicacionFormHeader } from './UbicacionFormHeader';
import { UbicacionesFrecuentesCard } from './UbicacionesFrecuentesCard';
import { UbicacionBasicInfo } from './UbicacionBasicInfo';
import { UbicacionRFCSection } from './UbicacionRFCSection';
import { UbicacionDomicilioSection } from './UbicacionDomicilioSection';

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
    tipoUbicacion: 'Origen',
    rfcRemitenteDestinatario: '',
    nombreRemitenteDestinatario: '',
    fechaHoraSalidaLlegada: '',
    distanciaRecorrida: 0,
    ordenSecuencia: 1,
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
    const rfcFormateado = RFCValidator.formatearRFC(rfc);
    const validation = RFCValidator.validarRFC(rfcFormateado);
    
    setFormData(prev => ({ 
      ...prev, 
      rfcRemitenteDestinatario: rfcFormateado 
    }));
    setRfcValidation(validation);
  };

  const handleNombreChange = (nombre: string) => {
    setFormData(prev => ({ 
      ...prev, 
      nombreRemitenteDestinatario: nombre 
    }));
  };

  const handleFechaChange = (fecha: string) => {
    setFormData(prev => ({ 
      ...prev, 
      fechaHoraSalidaLlegada: fecha 
    }));
  };

  const handleDomicilioChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        [field]: value
      }
    }));
  };

  const handleDistanciaChange = (distancia: number) => {
    setFormData(prev => ({ 
      ...prev, 
      distanciaRecorrida: distancia 
    }));
  };

  const handleCodigoPostalChange = (codigoPostal: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        codigoPostal,
      },
    }));
  };

  const handleInfoChange = (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        ...info,
      },
    }));
  };

  const handleColoniaChange = (colonia: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        colonia,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSave(formData);
    }
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
    return formData.tipoUbicacion && 
           rfcValidation.esValido &&
           formData.rfcRemitenteDestinatario && 
           formData.nombreRemitenteDestinatario &&
           formData.domicilio.codigoPostal &&
           formData.domicilio.estado &&
           formData.domicilio.calle;
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
            onFechaChange={handleFechaChange}
          />

          <UbicacionRFCSection
            rfc={formData.rfcRemitenteDestinatario}
            nombre={formData.nombreRemitenteDestinatario}
            rfcValidation={rfcValidation}
            onRFCChange={handleRFCChange}
            onNombreChange={handleNombreChange}
            onSaveToFavorites={handleSaveToFavorites}
            canSaveToFavorites={!!(formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario)}
          />

          <UbicacionDomicilioSection
            domicilio={formData.domicilio}
            distanciaRecorrida={formData.distanciaRecorrida || 0}
            onDomicilioChange={handleDomicilioChange}
            onDistanciaChange={handleDistanciaChange}
            onCodigoPostalChange={handleCodigoPostalChange}
            onInfoChange={handleInfoChange}
            onColoniaChange={handleColoniaChange}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
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
