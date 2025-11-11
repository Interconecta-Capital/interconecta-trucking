import { useUserConsents } from '@/hooks/useUserConsents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Componente para mostrar el historial de consentimientos del usuario
 * GDPR Art. 13 - Derecho a conocer el tratamiento de datos
 */
export const UserConsentsList = () => {
  const { data: consents, isLoading, error } = useUserConsents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando consentimientos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar consentimientos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!consents || consents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron consentimientos registrados.</p>
            <p className="text-sm mt-2">
              Tus consentimientos se registrarán automáticamente cuando aceptes 
              los términos y políticas de la plataforma.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const consentTypeLabels: Record<string, string> = {
    privacy_policy: 'Política de Privacidad',
    terms_of_service: 'Términos de Servicio'
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Consentimientos
          </CardTitle>
          <CardDescription>
            Registro completo de todos los consentimientos que has otorgado para el 
            tratamiento de tus datos personales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">
                      {consentTypeLabels[consent.consent_type] || consent.consent_type}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      v{consent.version}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Aceptado el{' '}
                    {format(new Date(consent.consented_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                      locale: es
                    })}
                  </p>
                  {consent.ip_address && (
                    <p className="text-xs text-muted-foreground">
                      IP: {consent.ip_address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
            <p className="font-medium mb-1">Cumplimiento normativo:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>GDPR Art. 7 - Condiciones para el consentimiento</li>
              <li>GDPR Art. 13 - Información que deberá facilitarse</li>
              <li>LFPDPPP Art. 8 - Consentimiento del titular</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
