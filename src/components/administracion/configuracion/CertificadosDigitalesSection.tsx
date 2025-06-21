
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
import { CertificadoUploadModal } from './CertificadoUploadModal';

export function CertificadosDigitalesSection() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { certificados, activarCertificado } = useConfiguracionEmpresarial();

  const getEstadoCertificado = (cert: any) => {
    const diasParaVencer = cert.dias_para_vencer || 0;
    
    if (!cert.es_valido) {
      return { estado: 'invalido', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
    
    if (diasParaVencer <= 0) {
      return { estado: 'vencido', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
    
    if (diasParaVencer <= 30) {
      return { estado: 'por_vencer', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
    
    return { estado: 'valido', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      {certificados.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {certificados.map((cert) => {
            const { estado, color, icon: IconComponent } = getEstadoCertificado(cert);
            
            return (
              <Card key={cert.id} className={cert.es_activo ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <Shield className="h-5 w-5" />
                      {cert.nombre_certificado}
                      {cert.es_activo && (
                        <Badge variant="default" className="bg-blue-600">
                          Activo
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge className={color}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {estado === 'valido' && 'Válido'}
                      {estado === 'por_vencer' && 'Por vencer'}
                      {estado === 'vencido' && 'Vencido'}
                      {estado === 'invalido' && 'Inválido'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">RFC Titular:</span>
                      <div className="text-gray-600">{cert.rfc_titular}</div>
                    </div>
                    <div>
                      <span className="font-medium">Número de Serie:</span>
                      <div className="text-gray-600">{cert.numero_serie}</div>
                    </div>
                    <div>
                      <span className="font-medium">Válido desde:</span>
                      <div className="text-gray-600">{formatearFecha(cert.fecha_inicio)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Vence el:</span>
                      <div className="text-gray-600">{formatearFecha(cert.fecha_vencimiento)}</div>
                    </div>
                  </div>

                  {cert.razon_social_titular && (
                    <div className="text-sm">
                      <span className="font-medium">Razón Social:</span>
                      <div className="text-gray-600">{cert.razon_social_titular}</div>
                    </div>
                  )}

                  {cert.dias_para_vencer !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">Días para vencer:</span>
                      <div className={`${cert.dias_para_vencer <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                        {cert.dias_para_vencer > 0 ? `${cert.dias_para_vencer} días` : 'Vencido'}
                      </div>
                    </div>
                  )}

                  {!cert.es_activo && cert.es_valido && cert.dias_para_vencer! > 0 && (
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => activarCertificado(cert.id!)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Activar Certificado
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de subida */}
      <CertificadoUploadModal 
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
      />
    </div>
  );
}
