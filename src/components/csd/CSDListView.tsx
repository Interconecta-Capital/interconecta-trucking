
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, AlertTriangle, Calendar, Shield } from 'lucide-react';
import { CertificadoDigital } from '@/types/certificados';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CSDListViewProps {
  certificados: CertificadoDigital[];
  onActivate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isActivating: boolean;
  isDeleting: boolean;
  getDaysUntilExpiration: (certificate: CertificadoDigital) => number;
  isCertificateValid: (certificate: CertificadoDigital) => boolean;
}

export function CSDListView({
  certificados,
  onActivate,
  onDelete,
  isActivating,
  isDeleting,
  getDaysUntilExpiration,
  isCertificateValid
}: CSDListViewProps) {

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getExpirationBadge = (certificate: CertificadoDigital) => {
    const daysUntilExpiration = getDaysUntilExpiration(certificate);
    const isValid = isCertificateValid(certificate);

    if (!isValid) {
      return <Badge variant="destructive">Vencido</Badge>;
    }

    if (daysUntilExpiration <= 30) {
      return <Badge variant="destructive">Vence en {daysUntilExpiration} días</Badge>;
    }

    if (daysUntilExpiration <= 90) {
      return <Badge variant="secondary">Vence en {daysUntilExpiration} días</Badge>;
    }

    return <Badge variant="default">Vigente</Badge>;
  };

  if (certificados.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay certificados registrados
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Sube tu primer certificado digital para comenzar a generar XML firmado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {certificados.map((certificado) => (
        <Card key={certificado.id} className={
          certificado.activo ? 'border-green-500 bg-green-50' : ''
        }>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {certificado.nombre_certificado}
                  {certificado.activo && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>RFC: {certificado.rfc_titular}</span>
                  <span>Serie: {certificado.numero_certificado}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getExpirationBadge(certificado)}
                {certificado.validado && (
                  <Badge variant="default">
                    <Shield className="h-3 w-3 mr-1" />
                    Validado
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Información del certificado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Razón Social:</span>
                  <p className="text-gray-600">{certificado.razon_social || 'No especificada'}</p>
                </div>
                <div>
                  <span className="font-medium">Vigencia:</span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatDate(certificado.fecha_inicio_vigencia)} - {formatDate(certificado.fecha_fin_vigencia)}
                  </div>
                </div>
              </div>

              {/* Advertencias */}
              {getDaysUntilExpiration(certificado) <= 30 && isCertificateValid(certificado) && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Este certificado vencerá pronto. Considera renovarlo.
                  </span>
                </div>
              )}

              {!isCertificateValid(certificado) && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    Este certificado ha vencido y no puede utilizarse.
                  </span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-2">
                {!certificado.activo && isCertificateValid(certificado) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActivate(certificado.id)}
                    disabled={isActivating}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isActivating ? 'Activando...' : 'Activar'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(certificado.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
