
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileX, CheckCircle, Code, FileImage, ShieldCheck } from 'lucide-react';

import { CartaPorteData } from '@/types/cartaPorte';
import { useCartaPorteXMLManager } from '@/hooks/xml/useCartaPorteXMLManager';

import { XMLGenerationPanel } from './XMLGenerationPanel';
import { TimbradoPanel } from './TimbradoPanel';
import { FiscalPDFPanel } from './sections/FiscalPDFPanel';
import { ProfessionalPDFSection } from '../pdf/ProfessionalPDFSection';

interface CartaPorteXMLSectionProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string;
}

export function CartaPorteXMLSection({ cartaPorteData, cartaPorteId }: CartaPorteXMLSectionProps) {
  console.log('🔍 [CartaPorteXMLSection] Renderizando con:', { 
    tieneCartaPorteData: !!cartaPorteData,
    cartaPorteId,
    ubicacionesCount: cartaPorteData?.ubicaciones?.length || 0,
    mercanciasCount: cartaPorteData?.mercancias?.length || 0
  });

  const {
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    generarXML,
    timbrarCartaPorte,
    descargarXML,
    limpiarDatos,
    validarConexionPAC
  } = useCartaPorteXMLManager();

  const [activeTab, setActiveTab] = useState('xml');

  useEffect(() => {
    console.log('🔄 [CartaPorteXMLSection] Estado actualizado:', {
      xmlGenerado: !!xmlGenerado,
      xmlTimbrado: !!xmlTimbrado,
      datosTimbre: !!datosTimbre,
      activeTab
    });
  }, [xmlGenerado, xmlTimbrado, datosTimbre, activeTab]);

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case 'xml':
        return xmlGenerado ? 'complete' : 'pending';
      case 'timbrado':
        return xmlTimbrado && datosTimbre ? 'complete' : xmlGenerado ? 'ready' : 'pending';
      case 'pdf-fiscal':
        return xmlTimbrado && datosTimbre ? 'ready' : 'pending';
      case 'pdf-profesional':
        return 'ready';
      default:
        return 'pending';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">✓</Badge>;
      case 'ready':
        return <Badge variant="outline" className="text-blue-600 ml-2">Listo</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500 ml-2">Pendiente</Badge>;
    }
  };

  // Auto-cambiar tab cuando se complete el timbrado
  useEffect(() => {
    if (xmlTimbrado && datosTimbre && activeTab === 'timbrado') {
      setTimeout(() => setActiveTab('pdf-fiscal'), 1000);
    }
  }, [xmlTimbrado, datosTimbre, activeTab]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          XML y Representación Impresa
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="xml" className="flex items-center">
              <FileX className="h-4 w-4 mr-1" />
              XML
              {getStatusBadge(getTabStatus('xml'))}
            </TabsTrigger>
            
            <TabsTrigger value="timbrado" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Timbrado
              {getStatusBadge(getTabStatus('timbrado'))}
            </TabsTrigger>
            
            <TabsTrigger value="pdf-fiscal" className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1" />
              PDF Fiscal
              {getStatusBadge(getTabStatus('pdf-fiscal'))}
            </TabsTrigger>
            
            <TabsTrigger value="pdf-profesional" className="flex items-center">
              <FileImage className="h-4 w-4 mr-1" />
              PDF Profesional
              {getStatusBadge(getTabStatus('pdf-profesional'))}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xml" className="mt-6">
            <XMLGenerationPanel
              cartaPorteData={cartaPorteData}
              cartaPorteId={cartaPorteId}
              xmlGenerado={xmlGenerado}
            />
          </TabsContent>

          <TabsContent value="timbrado" className="mt-6">
            <TimbradoPanel
              xmlContent={xmlGenerado || ''}
              cartaPorteId={cartaPorteId || ''}
              rfcEmisor={cartaPorteData.rfcEmisor || ''}
              onTimbradoComplete={(response) => {
                console.log('Timbrado completado:', response);
              }}
            />
          </TabsContent>

          <TabsContent value="pdf-fiscal" className="mt-6">
            <FiscalPDFPanel
              cartaPorteData={cartaPorteData}
              datosTimbre={datosTimbre}
              xmlTimbrado={xmlTimbrado}
            />
          </TabsContent>

          <TabsContent value="pdf-profesional" className="mt-6">
            <ProfessionalPDFSection
              cartaPorteData={cartaPorteData}
              datosTimbre={datosTimbre}
              xmlTimbrado={xmlTimbrado}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
