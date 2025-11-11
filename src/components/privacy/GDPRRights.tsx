import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trash2, FileText, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para gestionar derechos GDPR del usuario
 * Implementa GDPR Art. 15, 17, 20 + LFPDPPP Art. 23, 26, 29
 */
export const GDPRRights = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * GDPR Art. 20 - Derecho de Portabilidad de Datos
   * LFPDPPP Art. 29 - Derecho de Portabilidad
   */
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('No autenticado. Por favor inicia sesión.');
        return;
      }

      // Llamar Edge Function de exportación
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Convertir a JSON y descargar
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mis_datos_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Tus datos se han exportado correctamente');
    } catch (error: any) {
      console.error('Error al exportar datos:', error);
      toast.error(`Error al exportar datos: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * GDPR Art. 17 - Derecho de Supresión ("Derecho al Olvido")
   * LFPDPPP Art. 26 - Derecho de Cancelación
   */
  const handleDeleteAccount = async (password: string) => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        toast.error('No autenticado');
        return;
      }

      // Verificar contraseña antes de proceder
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInError) {
        throw new Error('Contraseña incorrecta');
      }

      // Llamar función SQL de eliminación
      const { data, error } = await supabase.rpc('eliminar_datos_usuario' as any, {
        target_user_id: user.id,
      });

      if (error) throw error;

      toast.success('Tu cuenta ha sido programada para eliminación', {
        description: 'Tienes 30 días para cancelar contactando a arrebolcorporation@gmail.com',
        duration: 10000,
      });

      // Cerrar sesión y redirigir
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Tus Derechos de Privacidad</CardTitle>
          </div>
          <CardDescription>
            De acuerdo con el GDPR (UE) y la LFPDPPP (México), tienes derecho a controlar tus datos personales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Estos derechos están garantizados por el Reglamento General de Protección de Datos (GDPR) y la 
              Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP).
            </AlertDescription>
          </Alert>

          {/* Derecho de Acceso y Portabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar Mis Datos
              </CardTitle>
              <CardDescription>
                GDPR Art. 20 - Derecho de Portabilidad | LFPDPPP Art. 29
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Descarga una copia completa de todos tus datos personales en formato JSON. 
                Esto incluye tu perfil, conductores, vehículos, socios, cartas porte y más.
              </p>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Descargar Mis Datos'}
              </Button>
            </CardContent>
          </Card>

          {/* Derecho de Supresión */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Eliminar Mi Cuenta
              </CardTitle>
              <CardDescription>
                GDPR Art. 17 - Derecho al Olvido | LFPDPPP Art. 26 - Derecho de Cancelación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atención:</strong> Esta acción es irreversible después del periodo de gracia de 30 días.
                  Todos tus datos personales serán anonimizados.
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Qué se eliminará:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Datos personales (nombre, RFC, teléfono, email, dirección)</li>
                  <li>Conductores, vehículos y socios (anonimizados)</li>
                  <li>Notificaciones, borradores y archivos temporales</li>
                  <li>Sesiones activas (cierre de sesión inmediato)</li>
                </ul>
                <p><strong>Qué se conservará (por ley):</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Cartas Porte emitidas (requisito SAT: 10 años, anonimizadas)</li>
                  <li>Logs de auditoría (requisito de seguridad: 7 años, sin PII)</li>
                </ul>
              </div>
              
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full sm:w-auto bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border-red-600 border-2 border-transparent transition-all font-semibold"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Procesando...' : 'Eliminar Mi Cuenta'}
              </Button>

              <DeleteAccountDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteAccount}
                isDeleting={isDeleting}
              />
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Si tienes preguntas sobre tus derechos de privacidad o deseas ejercer cualquier otro derecho 
                (rectificación, oposición, limitación del tratamiento), contáctanos:
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p><strong>Responsable de Privacidad:</strong></p>
                <p><strong>Nombre:</strong> Alan Soto</p>
                <p><strong>Email:</strong> <a href="mailto:arrebolcorporation@gmail.com" className="text-primary hover:underline">arrebolcorporation@gmail.com</a></p>
                <p><strong>Teléfono:</strong> <a href="tel:+525519686023" className="text-primary hover:underline">+52 55 1968 6023</a></p>
                <p className="text-xs mt-2">
                  Tiempo de respuesta: Inmediato (automatizado) para exportación y eliminación. 
                  Máximo 20 días hábiles para otras solicitudes.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
