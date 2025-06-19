import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CartaPorteTabContent } from './CartaPorteTabContent';
import { useCartaPorteMappers } from '@/hooks/carta-porte/useCartaPorteMappers';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta } from '@/types/cartaPorte';

interface OptimizedCartaPorteFormProps {
  currentCartaPorteId?: string;
  onDataChange?: (data: any) => void;
}

export function OptimizedCartaPorteForm({ currentCartaPorteId, onDataChange }: OptimizedCartaPorteFormProps) {
  const [activeTab, setActiveTab] = useState('configuracion');
  
  const {
    cartaPorteData,
    cachedFormData,
    updateFormData,
    saveToDatabase,
    isLoading
  } = useCartaPorteMappers(currentCartaPorteId);

  // Estado por defecto para autotransporte con todos los campos requeridos
  const defaultAutotransporte = useMemo((): AutotransporteCompleto => ({
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    peso_bruto_vehicular: 0,
    capacidad_carga: 0, // Campo requerido
    remolques: []
  }), []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleAutotransporteChange = useCallback((data: AutotransporteCompleto) => {
    updateFormData('autotransporte', data);
    onDataChange?.(data);
  }, [updateFormData, onDataChange]);

  const handleFigurasChange = useCallback((data: FiguraCompleta[]) => {
    updateFormData('figuras', data);
    onDataChange?.(data);
  }, [updateFormData, onDataChange]);

  const handleXMLGenerated = useCallback((xml: string) => {
    console.log('XML generado:', xml);
  }, []);

  const handleTimbrado = useCallback((datos: any) => {
    console.log('Timbrado:', datos);
  }, []);

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 6;

    if (cartaPorteData.rfc_emisor && cartaPorteData.rfc_receptor) completed++;
    if (cachedFormData.ubicaciones?.length >= 2) completed++;
    if (cachedFormData.mercancias?.length > 0) completed++;
    if (cachedFormData.autotransporte?.placa_vm) completed++;
    if (cachedFormData.figuras?.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Carta Porte</CardTitle>
            <Badge variant="outline">
              {getCompletionPercentage()}% Completo
            </Badge>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="ubicaciones">Ubicaciones</TabsTrigger>
          <TabsTrigger value="mercancias">Mercancías</TabsTrigger>
          <TabsTrigger value="autotransporte">Autotransporte</TabsTrigger>
          <TabsTrigger value="figuras">Figuras</TabsTrigger>
          <TabsTrigger value="xml">XML/Timbrado</TabsTrigger>
        </TabsList>

        <CartaPorteTabContent
          cartaPorteData={cartaPorteData}
          cachedFormData={{
            ...cachedFormData,
            autotransporte: cachedFormData.autotransporte || defaultAutotransporte
          }}
          updateFormData={updateFormData}
          handleTabChange={handleTabChange}
          handleAutotransporteChange={handleAutotransporteChange}
          handleFigurasChange={handleFigurasChange}
          handleXMLGenerated={handleXMLGenerated}
          handleTimbrado={handleTimbrado}
          currentCartaPorteId={currentCartaPorteId}
        />
      </Tabs>
    </div>
  );
}
