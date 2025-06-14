
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedAutocompleteInput } from '@/components/ai/EnhancedAutocompleteInput';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useUbicacionForm } from '@/hooks/useUbicacionForm';
import { UbicacionFrecuente } from '@/hooks/useUbicaciones';
import { UbicacionFormHeader } from './UbicacionFormHeader';
import { UbicacionesFrecuentesCard } from './UbicacionesFrecuentesCard';
import { UbicacionBasicInfo } from './UbicacionBasicInfo';
import { Save, X } from 'lucide-react';

interface SmartUbicacionFormProps {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes?: UbicacionFrecuente[];
}

export function SmartUbicacionForm({ 
  ubicacion, 
  onSave, 
  onCancel, 
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes = []
}: SmartUbicacionFormProps) {
  const { context, addUserPattern } = useAIContext();
  
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
      // Learn from user patterns
      addUserPattern('rfc', formData.rfcRemitenteDestinatario);
      addUserPattern('nombre_empresa', formData.nombreRemitenteDestinatario);
      addUserPattern('direccion', `${formData.domicilio.calle} ${formData.domicilio.numExterior}, ${formData.domicilio.colonia}, ${formData.domicilio.municipio}, ${formData.domicilio.estado}`);
      
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

          {/* Enhanced RFC Input */}
          <div className="space-y-4">
            <EnhancedAutocompleteInput
              value={formData.rfcRemitenteDestinatario}
              onChange={(value) => {
                handleRFCChange(value);
                addUserPattern('rfc', value);
              }}
              type="driver"
              label="RFC del Remitente/Destinatario"
              placeholder="Ingrese RFC..."
              context={context}
              formName="ubicacion"
              fieldName="rfc"
              showValidation={true}
              showHelp={true}
            />

            <EnhancedAutocompleteInput
              value={formData.nombreRemitenteDestinatario}
              onChange={(value) => {
                handleFieldChange('nombreRemitenteDestinatario', value);
                addUserPattern('nombre_empresa', value);
              }}
              type="driver"
              label="Nombre del Remitente/Destinatario"
              placeholder="Ingrese nombre de la empresa..."
              context={context}
              formName="ubicacion"
              fieldName="nombre"
              showValidation={true}
              showHelp={true}
            />
          </div>

          {/* Enhanced Address Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Domicilio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedAutocompleteInput
                value={formData.domicilio.calle}
                onChange={(value) => handleFieldChange('domicilio.calle', value)}
                type="address"
                label="Calle"
                placeholder="Nombre de la calle..."
                context={{
                  ...context,
                  addressComponent: 'street',
                  postalCode: formData.domicilio.codigoPostal
                }}
                formName="ubicacion"
                fieldName="calle"
                showValidation={true}
              />

              <EnhancedAutocompleteInput
                value={formData.domicilio.numExterior}
                onChange={(value) => handleFieldChange('domicilio.numExterior', value)}
                type="address"
                label="Número Exterior"
                placeholder="Número..."
                context={context}
                formName="ubicacion"
                fieldName="numExterior"
              />

              <EnhancedAutocompleteInput
                value={formData.domicilio.colonia}
                onChange={(value) => handleFieldChange('domicilio.colonia', value)}
                type="address"
                label="Colonia"
                placeholder="Nombre de la colonia..."
                context={{
                  ...context,
                  addressComponent: 'neighborhood',
                  postalCode: formData.domicilio.codigoPostal
                }}
                formName="ubicacion"
                fieldName="colonia"
                showValidation={true}
              />

              <EnhancedAutocompleteInput
                value={formData.domicilio.municipio}
                onChange={(value) => handleFieldChange('domicilio.municipio', value)}
                type="address"
                label="Municipio"
                placeholder="Nombre del municipio..."
                context={{
                  ...context,
                  addressComponent: 'city',
                  state: formData.domicilio.estado
                }}
                formName="ubicacion"
                fieldName="municipio"
                showValidation={true}
              />

              <EnhancedAutocompleteInput
                value={formData.domicilio.estado}
                onChange={(value) => handleFieldChange('domicilio.estado', value)}
                type="address"
                label="Estado"
                placeholder="Nombre del estado..."
                context={{
                  ...context,
                  addressComponent: 'state'
                }}
                formName="ubicacion"
                fieldName="estado"
                showValidation={true}
              />

              <EnhancedAutocompleteInput
                value={formData.domicilio.codigoPostal}
                onChange={(value) => handleFieldChange('domicilio.codigoPostal', value)}
                type="address"
                label="Código Postal"
                placeholder="00000"
                context={context}
                formName="ubicacion"
                fieldName="codigoPostal"
                showValidation={true}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              {canSaveToFavorites && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveToFavorites}
                >
                  Guardar en Favoritos
                </Button>
              )}
              
              <Button type="submit" disabled={!isFormValid()}>
                <Save className="h-4 w-4 mr-2" />
                {ubicacion ? 'Actualizar' : 'Guardar'} Ubicación
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
