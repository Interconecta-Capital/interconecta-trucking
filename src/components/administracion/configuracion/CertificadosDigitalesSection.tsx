
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Upload
} from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';

export function CertificadosDigitalesSection() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { certificados, activarCertificado } = useConfiguracionEmpresarial();

  return (
    <div className="space-y-6">
      {/* Header con acción */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Certificados de Sello Digital</h3>
          <p className="text-sm text-gray-600">
            Gestione los certificados digitales para el timbrado de documentos fiscales
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Subir Certificado
        </Button>
      </div>

      {/* Lista de certificados */}
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Sin certificados configurados
          </h4>
          <p className="text-gray-600 text-center mb-4">
            Necesita subir al menos un certificado de sello digital válido para poder generar documentos fiscales.
          </p>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Primer Certificado
          </Button>
        </CardContent>
      </Card>

      {/* Mensaje temporal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Subir Certificado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Funcionalidad de certificados en desarrollo. Próximamente podrá cargar sus certificados CSD.
              </p>
              <Button onClick={() => setShowUploadModal(false)}>
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
