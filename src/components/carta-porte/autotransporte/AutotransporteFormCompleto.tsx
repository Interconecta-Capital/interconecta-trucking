import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Truck, Save, Star, Ruler, FileText } from 'lucide-react';
import { AIAssistantButton } from '../mercancias/AIAssistantButton';
import { CatalogosSATExtendido } from '@/services/catalogosSATExtendido';
import { AutotransporteCompleto, Remolque } from '@/types/cartaPorte';
import { VehiculosGuardados } from './VehiculosGuardados';
import { RemolquesList } from './RemolquesList';
import { VehiculoBasicInfo } from './VehiculoBasicInfo';
import { VehiculoSpecifications } from './VehiculoSpecifications';
import { VehiculoDimensions } from './VehiculoDimensions';
import { VehiculoPermits } from './VehiculoPermits';
import { VehiculoInsurance } from './VehiculoInsurance';
import { VehiculoSaveModal } from './VehiculoSaveModal';
import { useToast } from '@/hooks/use-toast';

interface AutotransporteFormCompletoProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
}

export function AutotransporteFormCompleto({ data, onChange }: AutotransporteFormCompletoProps) {
  const [showVehiculosGuardados, setShowVehiculosGuardados] = useState(false);
  const [showGuardarModal, setShowGuardarModal] = useState(false);
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [vinValidation, setVinValidation] = useState<{ valido: boolean; mensaje?: string }>({ valido: true });
  
  const { toast } = useToast();

  const handleFieldChange = <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleDimensionesChange = (dimension: 'largo' | 'ancho' | 'alto', value: number) => {
    const nuevasDimensiones = {
      largo: 0,
      ancho: 0,
      alto: 0,
      ...data.dimensiones,
      [dimension]: value
    };
    handleFieldChange('dimensiones', nuevasDimensiones);
  };

  const handleVINChange = (vin: string) => {
    const validation = CatalogosSATExtendido.validarVIN(vin);
    setVinValidation(validation);
    handleFieldChange('numero_serie_vin', vin);
  };

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      const updates: Partial<AutotransporteCompleto> = {};
      
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'dimensiones' && typeof value === 'object') {
          updates.dimensiones = value as { largo: number; ancho: number; alto: number };
        } else if (typeof value === 'string' || typeof value === 'number') {
          (updates as any)[key] = value;
        }
      });
      
      onChange({ ...data, ...updates });
    }
  };

  const handleSaveVehiculo = () => {
    if (nombrePerfil.trim()) {
      // Save vehicle logic here
      toast({
        title: "Éxito",
        description: "Vehículo guardado correctamente",
      });
      setShowGuardarModal(false);
      setNombrePerfil('');
    }
  };

  // Fix remolques conversion to ensure compatibility
  const convertedRemolques: Remolque[] = (data.remolques || []).map(remolque => ({
    id: remolque.id,
    placa: remolque.placa,
    subtipo_rem: remolque.subtipo_rem || remolque.subtipo_remolque || '',
    subtipo_remolque: remolque.subtipo_remolque || remolque.subtipo_rem || ''
  }));

  const handleRemolquesChange = (newRemolques: Remolque[]) => {
    // Convert back to ensure both properties are set
    const convertedBack = newRemolques.map(remolque => ({
      ...remolque,
      subtipo_rem: remolque.subtipo_rem || remolque.subtipo_remolque || '',
      subtipo_remolque: remolque.subtipo_remolque || remolque.subtipo_rem || ''
    }));
    handleFieldChange('remolques', convertedBack);
  };

  const isVehiculoCompleto = data.placa_vm && data.anio_modelo_vm && data.config_vehicular;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Información Completa del Autotransporte</span>
            </CardTitle>
            
            <div className="flex space-x-2">
              <AIAssistantButton 
                context="autotransporte"
                onSuggestionApply={handleAISuggestion}
              />
              {isVehiculoCompleto && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuardarModal(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Vehículo
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información Básica del Vehículo */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Información Básica del Vehículo
            </h4>
            
            <VehiculoBasicInfo
              data={data}
              onFieldChange={handleFieldChange}
              vinValidation={vinValidation}
              onVINChange={handleVINChange}
            />
          </div>

          <Separator />

          {/* Especificaciones Técnicas */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Especificaciones Técnicas
            </h4>

            <VehiculoSpecifications
              data={data}
              onFieldChange={handleFieldChange}
            />
          </div>

          <Separator />

          {/* Dimensiones del Vehículo */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dimensiones del Vehículo (metros)
            </h4>

            <VehiculoDimensions
              data={data}
              onDimensionesChange={handleDimensionesChange}
            />
          </div>

          <Separator />

          {/* Permisos SCT */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Permisos y Documentación SCT
            </h4>

            <VehiculoPermits
              data={data}
              onFieldChange={handleFieldChange}
            />
          </div>

          <Separator />

          {/* Seguros */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información de Seguros
            </h4>

            <VehiculoInsurance
              data={data}
              onFieldChange={handleFieldChange}
            />
          </div>

          <Separator />

          {/* Remolques */}
          <RemolquesList
            remolques={convertedRemolques}
            onChange={handleRemolquesChange}
          />
        </CardContent>
      </Card>

      <VehiculoSaveModal
        showModal={showGuardarModal}
        nombrePerfil={nombrePerfil}
        onNombreChange={setNombrePerfil}
        onSave={handleSaveVehiculo}
        onClose={() => {
          setShowGuardarModal(false);
          setNombrePerfil('');
        }}
      />
    </div>
  );
}
