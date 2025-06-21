
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Shield, 
  FileText, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { DatosFiscalesForm } from './DatosFiscalesForm';
import { CertificadosDigitalesSection } from './CertificadosDigitalesSection';
import { ConfiguracionOperativaForm } from './ConfiguracionOperativaForm';

export function MiEmpresaPanel() {
  const [activeTab, setActiveTab] = useState('datos-fiscales');
  
  const {
    configuracion,
    certificados,
    isLoading,
    validarConfiguracionCompleta,
    tieneCertificadoValido
  } = useConfiguracionEmpresarial();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Cargando configuración...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const configuracionCompleta = validarConfiguracionCompleta();
  const certificadoValido = tieneCertificadoValido();
  const sistemaListo = configuracionCompleta && certificadoValido;

  return (
    <div className="space-y-6">
      {/* Header con estado del sistema */}
      <Card className={`border-2 ${sistemaListo ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            Mi Empresa
            {sistemaListo ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sistema Listo
              </Badge>
            ) : (
              <Badge variant="outline" className="border-yellow-600 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Configuración Pendiente
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estado de Datos Fiscales */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <FileText className={`h-8 w-8 ${configuracionCompleta ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Datos Fiscales</div>
                <div className="text-sm text-gray-600">
                  {configuracionCompleta ? 'Configuración completa' : 'Pendiente de configurar'}
                </div>
              </div>
            </div>

            {/* Estado de Certificados */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <Shield className={`h-8 w-8 ${certificadoValido ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Certificados Digitales</div>
                <div className="text-sm text-gray-600">
                  {certificadoValido ? 'Certificado activo' : 'Sin certificado válido'}
                </div>
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <Settings className={`h-8 w-8 ${sistemaListo ? 'text-green-600' : 'text-orange-600'}`} />
              <div>
                <div className="font-medium">Estado del Sistema</div>
                <div className="text-sm text-gray-600">
                  {sistemaListo ? 'Listo para operar' : 'Configuración incompleta'}
                </div>
              </div>
            </div>
          </div>

          {!sistemaListo && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Complete la configuración de su empresa para poder generar Cartas Porte válidas
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="datos-fiscales" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Datos Fiscales
            {configuracionCompleta && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="certificados" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Certificados
            {certificadoValido && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="operativa" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config. Operativa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos-fiscales" className="space-y-4">
          <DatosFiscalesForm />
        </TabsContent>

        <TabsContent value="certificados" className="space-y-4">
          <CertificadosDigitalesSection />
        </TabsContent>

        <TabsContent value="operativa" className="space-y-4">
          <ConfiguracionOperativaForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
