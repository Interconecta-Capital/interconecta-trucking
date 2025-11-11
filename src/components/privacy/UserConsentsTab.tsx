import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Calendar, Globe, Monitor, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Consent {
  id: string;
  consent_type: string;
  consented_at: string;
  version: string;
  ip_address?: unknown;
  user_agent?: string;
  created_at: string;
  user_id: string;
  metadata?: any;
}

export function UserConsentsTab() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadConsents();
    }
  }, [user?.id]);

  const loadConsents = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id)
        .order('consented_at', { ascending: false });

      if (error) throw error;
      setConsents(data || []);
    } catch (error: any) {
      console.error('Error loading consents:', error);
      toast.error('Error al cargar consentimientos');
    } finally {
      setLoading(false);
    }
  };

  const getConsentLabel = (type: string) => {
    const labels: Record<string, string> = {
      'privacy_policy': 'Política de Privacidad',
      'terms_of_service': 'Términos y Condiciones',
      'data_processing': 'Procesamiento de Datos',
      'marketing': 'Comunicaciones de Marketing'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (consents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay consentimientos registrados
          </h3>
          <p className="text-gray-600">
            Tus consentimientos se registrarán automáticamente cuando aceptes políticas o términos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Historial de Consentimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            Registro de todas las políticas y términos que has aceptado, incluyendo información de auditoría.
          </p>
          
          <div className="space-y-4">
            {consents.map((consent) => (
              <div 
                key={consent.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getConsentLabel(consent.consent_type)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Versión {consent.version}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Aceptado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Aceptación</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(consent.consented_at)}
                      </p>
                    </div>
                  </div>

                  {consent.ip_address && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Dirección IP</p>
                        <p className="text-sm text-gray-900 font-mono">
                          {String(consent.ip_address)}
                        </p>
                      </div>
                    </div>
                  )}

                  {consent.user_agent && (
                    <div className="flex items-start gap-2">
                      <Monitor className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Dispositivo</p>
                        <p className="text-sm text-gray-900 truncate" title={consent.user_agent}>
                          {consent.user_agent.includes('Mobile') ? '📱 Móvil' : '💻 Escritorio'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                ¿Por qué guardamos esta información?
              </h4>
              <p className="text-sm text-blue-800">
                Para cumplir con regulaciones de protección de datos (GDPR, LFPDPPP) y proporcionarte 
                transparencia sobre tus consentimientos. Esta información nos ayuda a verificar que 
                has aceptado nuestras políticas de forma explícita y mantener un registro de auditoría.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
