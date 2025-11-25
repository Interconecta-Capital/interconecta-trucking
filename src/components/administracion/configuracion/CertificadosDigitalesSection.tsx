
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Upload,
  Trash2,
  Star,
  Edit,
  FlaskConical
} from 'lucide-react';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';
import { CertificadoUploadDialog } from './CertificadoUploadDialog';
import { CertificadoEditDialog, UpdateCertificateData } from './CertificadoEditDialog';
import { TestCertificateService } from '@/services/csd/TestCertificateService';
import { toast } from 'sonner';
import { CertificadoDigital } from '@/types/certificados';

export function CertificadosDigitalesSection() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [certificadoAEditar, setCertificadoAEditar] = useState<CertificadoDigital | null>(null);
  const [cargandoPrueba, setCargandoPrueba] = useState(false);
  
  const { 
    certificados, 
    certificadoActivo,
    isLoading,
    subirCertificado,
    activarCertificado,
    actualizarCertificado,
    eliminarCertificado,
    esCertificadoValido,
    diasHastaVencimiento,
    isActivating,
    isUpdating,
    isDeleting
  } = useCertificadosDigitales();

  const handleActivar = async (certificadoId: string) => {
    try {
      await activarCertificado(certificadoId);
    } catch (error) {
      console.error('Error al activar certificado:', error);
    }
  };

  const handleEditar = (certificado: CertificadoDigital) => {
    setCertificadoAEditar(certificado);
    setShowEditModal(true);
  };

  const handleActualizarCertificado = async (updateData: UpdateCertificateData) => {
    try {
      await actualizarCertificado(updateData);
    } catch (error) {
      console.error('Error al actualizar certificado:', error);
      throw error;
    }
  };

  const handleEliminar = async (certificadoId: string) => {
    if (!confirm('¿Está seguro de eliminar este certificado? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await eliminarCertificado(certificadoId);
    } catch (error) {
      console.error('Error al eliminar certificado:', error);
    }
  };

  const handleCargarCertificadoPrueba = async () => {
    try {
      setCargandoPrueba(true);
      const certPrueba = await TestCertificateService.obtenerCertificadoPruebaSAT();
      
      toast.info('Cargando certificado de prueba SAT...', {
        description: `RFC: ${certPrueba.rfc} - Este certificado solo funciona en modo sandbox`
      });

      await subirCertificado({
        archivoCer: certPrueba.archivoCer,
        archivoKey: certPrueba.archivoKey,
        passwordKey: certPrueba.password,
        nombreCertificado: certPrueba.nombre
      });

    } catch (error) {
      console.error('Error cargando certificado de prueba:', error);
      toast.error('Error al cargar certificado de prueba');
    } finally {
      setCargandoPrueba(false);
    }
  };

  const getBadgeEstado = (certificado: any) => {
    if (!esCertificadoValido(certificado)) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    
    const dias = diasHastaVencimiento(certificado);
    if (certificado.id === certificadoActivo?.id) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>;
    }
    if (dias <= 30) {
      return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Próximo a vencer</Badge>;
    }
    return <Badge variant="outline">Inactivo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Certificados de Sello Digital</h3>
          <p className="text-sm text-muted-foreground">
            Gestione los certificados digitales para el timbrado de documentos fiscales
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCargarCertificadoPrueba}
            variant="outline"
            disabled={cargandoPrueba}
            className="flex items-center gap-2"
          >
            <FlaskConical className="h-4 w-4" />
            {cargandoPrueba ? 'Cargando...' : 'Certificado Prueba SAT'}
          </Button>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Subir Certificado
          </Button>
        </div>
      </div>

      {/* Alertas de certificados próximos a vencer */}
      {certificados.some(cert => {
        const dias = diasHastaVencimiento(cert);
        return esCertificadoValido(cert) && dias <= 30;
      }) && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tiene certificados que vencen pronto. Renueve sus certificados con anticipación para evitar interrupciones.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de certificados */}
      {certificados.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">
              Sin certificados configurados
            </h4>
            <p className="text-muted-foreground text-center mb-4">
              Necesita subir al menos un certificado de sello digital válido para poder generar documentos fiscales.
            </p>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Agregar Primer Certificado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificados.map((certificado) => {
            const esActivo = certificado.id === certificadoActivo?.id;
            const esValido = esCertificadoValido(certificado);
            const dias = diasHastaVencimiento(certificado);

            return (
              <Card key={certificado.id} className={esActivo ? 'border-primary border-2' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {esActivo && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        {certificado.nombre_certificado}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {certificado.rfc_titular}
                      </p>
                    </div>
                    {getBadgeEstado(certificado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Razón Social:</span>
                      <span className="font-medium">{certificado.razon_social || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número de Serie:</span>
                      <span className="font-mono text-xs">{certificado.numero_certificado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vigencia:</span>
                      <span className={esValido ? '' : 'text-destructive font-medium'}>
                        {new Date(certificado.fecha_fin_vigencia).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    {esValido && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Días restantes:</span>
                        <span className={dias <= 30 ? 'text-yellow-600 font-medium' : ''}>
                          {dias} días
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {!esActivo && esValido && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivar(certificado.id)}
                        disabled={isActivating}
                        className="flex-1"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditar(certificado)}
                      disabled={isUpdating}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEliminar(certificado.id)}
                      disabled={isDeleting || esActivo}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Diálogos */}
      <CertificadoUploadDialog
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
      />
      
      {certificadoAEditar && (
        <CertificadoEditDialog
          open={showEditModal}
          onOpenChange={setShowEditModal}
          certificado={certificadoAEditar}
          onUpdate={handleActualizarCertificado}
        />
      )}
    </div>
  );
}
