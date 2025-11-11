import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Shield, 
  FileText, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Globe,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserConsents } from '@/hooks/useUserConsents';
import { GDPRRights } from '@/components/privacy/GDPRRights';
import { UserConsentsList } from '@/components/privacy/UserConsentsList';
import { toast } from 'sonner';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: consents, isLoading: consentsLoading } = useUserConsents();
  
  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
    timezone: 'America/Mexico_City',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        telefono: user.profile?.telefono || '',
        timezone: user.profile?.timezone || 'America/Mexico_City',
        avatar_url: user.profile?.avatar_url || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        telefono: formData.telefono,
        timezone: formData.timezone,
        avatar_url: formData.avatar_url,
      });
      toast.success('Perfil actualizado exitosamente');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al actualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * GDPR Art. 20 - Derecho de Portabilidad
   */
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('No autenticado. Por favor inicia sesión.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

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
   * GDPR Art. 17 - Derecho al Olvido
   */
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('No autenticado');
        return;
      }

      const { error } = await supabase.rpc('eliminar_datos_usuario' as any, {
        target_user_id: user.id,
      });

      if (error) throw error;

      toast.success('Tu solicitud de eliminación ha sido procesada. Tu cuenta será eliminada en 30 días.', {
        description: 'Puedes cancelar esta solicitud contactando con arrebolcorporation@gmail.com',
        duration: 10000,
      });

      setTimeout(() => {
        supabase.auth.signOut();
      }, 3000);
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      toast.error(`Error al eliminar cuenta: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Datos del usuario con fallbacks mejorados
  const userName = user?.profile?.nombre || 
                   user?.user_metadata?.nombre || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Usuario';
  
  const userCompany = user?.profile?.empresa || 
                      user?.user_metadata?.empresa || 
                      user?.tenant?.nombre_empresa || 
                      '';
  
  const userRFC = user?.profile?.rfc || 
                  user?.user_metadata?.rfc || 
                  user?.tenant?.rfc_empresa || 
                  '';

  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mi Perfil</DialogTitle>
          <DialogDescription>
            Gestiona tu información personal y derechos de privacidad
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-2 py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatar_url || user?.profile?.avatar_url} alt={userName} />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{userName}</h3>
          <p className="text-sm text-muted-foreground">{formData.email}</p>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Datos
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacidad
            </TabsTrigger>
            <TabsTrigger value="consents">
              <FileText className="h-4 w-4 mr-2" />
              Consentimientos
            </TabsTrigger>
          </TabsList>

          {/* TAB: Datos Personales */}
          <TabsContent value="personal" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input value={userName} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  * Definido al crear tu cuenta
                </p>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  * Contacta soporte para cambiar: arrebolcorporation@gmail.com
                </p>
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input value={userCompany} disabled className="bg-muted" placeholder="No especificada" />
              </div>

              <div className="space-y-2">
                <Label>RFC</Label>
                <Input value={userRFC} disabled className="bg-muted" placeholder="No especificado" />
                <p className="text-xs text-muted-foreground">
                  * El RFC no puede ser modificado. Contacta soporte.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="https://ejemplo.com/mi-avatar.jpg"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TAB: Privacidad y Datos */}
          <TabsContent value="privacy" className="space-y-4 mt-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                De acuerdo con el GDPR (UE) y la LFPDPPP (México), tienes control total sobre tus datos personales.
              </AlertDescription>
            </Alert>

            {/* Exportar Datos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Mis Datos
                </CardTitle>
                <CardDescription>
                  GDPR Art. 20 - Derecho de Portabilidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Descarga una copia completa de todos tus datos en formato JSON.
                  Incluye perfil, conductores, vehículos, cartas porte y más.
                </p>
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exportando...' : 'Descargar Mis Datos'}
                </Button>
              </CardContent>
            </Card>

            {/* Eliminar Cuenta */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Eliminar Mi Cuenta
                </CardTitle>
                <CardDescription>
                  GDPR Art. 17 - Derecho al Olvido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Acción irreversible después de 30 días. Todos tus datos serán anonimizados.
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm space-y-2">
                  <p className="font-medium">Qué se eliminará:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                    <li>Datos personales (nombre, RFC, teléfono, email)</li>
                    <li>Conductores, vehículos y socios (anonimizados)</li>
                    <li>Notificaciones y archivos temporales</li>
                  </ul>
                  
                  <p className="font-medium">Qué se conservará (por ley):</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                    <li>Cartas Porte emitidas (SAT: 10 años, anonimizadas)</li>
                    <li>Logs de auditoría (7 años, sin datos personales)</li>
                  </ul>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting} className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Procesando...' : 'Eliminar Mi Cuenta'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Esta acción <strong>eliminará permanentemente</strong> tu cuenta y todos tus datos personales 
                          después de un periodo de gracia de 30 días.
                        </p>
                        <div className="bg-destructive/10 p-3 rounded-md space-y-2 text-sm">
                          <p className="font-semibold text-destructive">Consecuencias:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Perderás acceso a tu cuenta inmediatamente</li>
                            <li>Tus datos serán anonimizados (no se pueden recuperar)</li>
                            <li>Cartas Porte emitidas se conservarán (por ley) pero sin tus datos</li>
                            <li>Tienes 30 días para cancelar esta solicitud</li>
                          </ul>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Para cancelar durante el periodo de gracia, contacta: 
                          <strong> arrebolcorporation@gmail.com</strong>
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sí, Eliminar Mi Cuenta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Para ejercer otros derechos (rectificación, oposición), contáctanos:
                </p>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p><strong>Responsable de Privacidad:</strong></p>
                  <p><strong>Nombre:</strong> Alan Soto</p>
                  <p><strong>Email:</strong> <a href="mailto:arrebolcorporation@gmail.com" className="text-primary hover:underline">arrebolcorporation@gmail.com</a></p>
                  <p><strong>Teléfono:</strong> <a href="tel:+525519686023" className="text-primary hover:underline">+52 55 1968 6023</a></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Consentimientos */}
          <TabsContent value="consents" className="space-y-4 mt-4">
            <UserConsentsList />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
