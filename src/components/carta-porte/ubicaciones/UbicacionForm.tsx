
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UbicacionFrecuente } from '@/hooks/useUbicaciones';
import { useUbicacionForm } from '@/hooks/useUbicacionForm';
import { UbicacionFormHeader } from './UbicacionFormHeader';
import { UbicacionesFrecuentesCard } from './UbicacionesFrecuentesCard';
import { UbicacionBasicInfo } from './UbicacionBasicInfo';
import { UbicacionRFCSection } from './UbicacionRFCSection';
import { UbicacionDomicilioFormOptimizado } from './UbicacionDomicilioFormOptimizado';
import { UbicacionFormActions } from './UbicacionFormActions';

interface UbicacionFormProps {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
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
  const {
    formData,
    rfcValidation,
    showFrecuentes,
    setShowFrecuentes,
    handleTipoChange,
    handleRFCChange,
    handleLocationUpdate,
    handleFieldChange,
    cargarUbicacionFrecuente,
    isFormValid
  } = useUbicacionForm(ubicacion, generarId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  // Fix the boolean conversion issue
  const canSaveToFavorites = Boolean(
    formData.rfcRemitenteDestinatario && 
    formData.rfcRemitenteDestinatario.trim() !== '' &&
    formData.nombreRemitenteDestinatario && 
    formData.nombreRemitenteDestinatario.trim() !== ''
  );

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
            canSaveToFavorites={canSaveToFavorites}
          />

          <UbicacionDomicilioFormOptimizado
            formData={formData}
            onFieldChange={handleFieldChange}
            onLocationUpdate={handleLocationUpdate}
          />

          <UbicacionFormActions
            ubicacion={ubicacion}
            isFormValid={isFormValid()}
            onCancel={onCancel}
          />
        </form>
      </CardContent>
    </Card>
  );
}
