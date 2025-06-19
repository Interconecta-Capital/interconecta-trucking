
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Upload, List, CheckCircle, AlertTriangle } from 'lucide-react';
import { CSDUploadForm } from './CSDUploadForm';
import { CSDListView } from './CSDListView';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';

export function CSDManagementPanel() {
  const [activeTab, setActiveTab] = useState('list');
  
  const {
    certificados,
    certificadoActivo,
    isLoading,
    loadingActive,
    isUploading,
    isActivating,
    isDeleting,
    subirCertificado,
    activarCertificado,
    eliminarCertificado,
    esCertificadoValido,
    diasHastaVencimiento
  } = useCertificadosDigitales();

  const handleUploadSuccess = () => {
    setActiveTab('list');
  };

  const handleUpload = async (data: any) => {
    await subirCertificado(data);
    handleUploadSuccess();
  };

  const certificadosValidos = certificados.filter(cert => esCertificadoValido(cert));
  const certificadosVencidos = certificados.filter(cert => !esCertificadoValido(cert));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Cargando certificados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen del estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Certificados Digitales (CSD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Certificado activo */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <CheckCircle className={`h-8 w-8 ${certificadoActivo ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Certificado Activo</div>
                {certificadoActivo ? (
                  <div className="text-sm text-gray-600">
                    {certificadoActivo.nombre_certificado}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Ninguno configurado</div>
                )}
              </div>
            </div>

            {/* Total de certificados */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium">Total Certificados</div>
                <div className="text-sm text-gray-600">
                  {certificados.length} registrados
                </div>
              </div>
            </div>

            {/* Certificados por vencer */}
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <div className="font-medium">Por Vencer</div>
                <div className="text-sm text-gray-600">
                  {certificados.filter(cert => {
                    const days = diasHastaVencimiento(cert);
                    return days <= 90 && days > 0;
                  }).length} en 90 días
                </div>
              </div>
            </div>
          </div>

          {/* Alerta si no hay certificado activo */}
          {!certificadoActivo && certificados.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  No tienes un certificado activo configurado. Activa uno para poder generar XML firmado.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Mis Certificados
            {certificados.length > 0 && (
              <Badge variant="secondary">{certificados.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Subir Certificado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <CSDListView
            certificados={certificados}
            onActivate={activarCertificado}
            onDelete={eliminarCertificado}
            isActivating={isActivating}
            isDeleting={isDeleting}
            getDaysUntilExpiration={diasHastaVencimiento}
            isCertificateValid={esCertificadoValido}
          />
        </TabsContent>

        <TabsContent value="upload">
          <CSDUploadForm
            onSubmit={handleUpload}
            isLoading={isUploading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
