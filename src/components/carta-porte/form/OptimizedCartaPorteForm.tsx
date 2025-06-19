
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartaPorteUnified } from '@/hooks/carta-porte/useCartaPorteUnified';
import { ConfiguracionSection } from './sections/ConfiguracionSection';
import { UbicacionesSection } from './sections/UbicacionesSection';
import { MercanciasSection } from './sections/MercanciasSection';
import { AutotransporteSection } from './sections/AutotransporteSection';
import { FigurasSection } from './sections/FigurasSection';
import { XMLSection } from './sections/XMLSection';
import { Save } from 'lucide-react';

interface OptimizedCartaPorteFormProps {
  currentCartaPorteId?: string;
  onDataChange?: (data: any) => void;
}

export function OptimizedCartaPorteForm({ currentCartaPorteId, onDataChange }: OptimizedCartaPorteFormProps) {
  const [activeTab, setActiveTab] = useState('configuracion');
  
  const {
    data,
    currentStep,
    isDirty,
    isLoading,
    error,
    updateField,
    updateAutotransporte,
    updateUbicaciones,
    updateMercancias,
    updateFiguras,
    setCurrentStep,
    saveData,
    resetForm,
    validateData,
    getCompletionPercentage
  } = useCartaPorteUnified(currentCartaPorteId);

  const handleSave = useCallback(async () => {
    try {
      await saveData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  }, [saveData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Carta Porte</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {getCompletionPercentage()}% Completo
              </Badge>
              {isDirty && (
                <Button onClick={handleSave} size="sm" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              )}
            </div>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="ubicaciones">Ubicaciones</TabsTrigger>
          <TabsTrigger value="mercancias">Mercancías</TabsTrigger>
          <TabsTrigger value="autotransporte">Autotransporte</TabsTrigger>
          <TabsTrigger value="figuras">Figuras</TabsTrigger>
          <TabsTrigger value="xml">XML/Timbrado</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracion">
          <ConfiguracionSection
            data={data}
            onChange={updateField}
          />
        </TabsContent>

        <TabsContent value="ubicaciones">
          <UbicacionesSection
            ubicaciones={data.ubicaciones || []}
            onChange={updateUbicaciones}
          />
        </TabsContent>

        <TabsContent value="mercancias">
          <MercanciasSection
            mercancias={data.mercancias || []}
            onChange={updateMercancias}
          />
        </TabsContent>

        <TabsContent value="autotransporte">
          <AutotransporteSection
            autotransporte={data.autotransporte}
            onChange={updateAutotransporte}
          />
        </TabsContent>

        <TabsContent value="figuras">
          <FigurasSection
            figuras={data.figuras || []}
            onChange={updateFiguras}
          />
        </TabsContent>

        <TabsContent value="xml">
          <XMLSection
            data={data}
            onSave={handleSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
