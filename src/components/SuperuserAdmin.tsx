
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Crown, Shield, UserPlus, Key, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function SuperuserAdmin() {
  const { isSuperuser, convertToSuperuser, createSuperuserAccount } = useSuperuser();
  const [email, setEmail] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{email: string; password: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleConvertUser = async () => {
    if (!email.trim()) return;
    
    setIsConverting(true);
    await convertToSuperuser(email.trim());
    setIsConverting(false);
    setEmail('');
  };

  const handleCreateSuperuser = async () => {
    setIsCreating(true);
    const result = await createSuperuserAccount();
    setIsCreating(false);
    
    if (result && typeof result === 'object' && 'email' in result) {
      setCredentials(result);
      setShowCredentials(true);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  if (!isSuperuser) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Solo los superusuarios pueden acceder a esta función.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Administración de Superusuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Estás logueado como superusuario.</strong> Tienes acceso completo a todas las funciones del sistema sin restricciones de suscripción.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Convert Existing User */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Convertir Usuario Existente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email del usuario</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                  />
                </div>
                <Button 
                  onClick={handleConvertUser}
                  disabled={!email.trim() || isConverting}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isConverting ? 'Convirtiendo...' : 'Convertir a Superusuario'}
                </Button>
              </CardContent>
            </Card>

            {/* Create Test Superuser */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Crear Superusuario de Prueba
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline">superuser@trucking.dev</Badge>
                  <p className="text-sm text-muted-foreground">
                    Crea un usuario de prueba con credenciales seguras
                  </p>
                </div>
                <Button 
                  onClick={handleCreateSuperuser}
                  disabled={isCreating}
                  className="w-full"
                  variant="outline"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creando...' : 'Crear Usuario de Prueba'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Superuser Privileges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privilegios de Superusuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Acceso Completo:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Sin límites en cartas de porte</li>
                    <li>• Sin límites en conductores</li>
                    <li>• Sin límites en vehículos</li>
                    <li>• Sin límites en socios</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Funciones Premium:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Cancelación de CFDI</li>
                    <li>• Generación de XML</li>
                    <li>• Timbrado automático</li>
                    <li>• Tracking avanzado</li>
                    <li>• Panel de administración</li>
                    <li>• Funciones Enterprise</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Secure Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Credenciales de Superusuario
            </DialogTitle>
          </DialogHeader>
          
          {credentials && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>¡IMPORTANTE!</strong> Guarda estas credenciales de forma segura. 
                  No se mostrarán nuevamente por razones de seguridad.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex gap-2">
                    <Input value={credentials.email} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(credentials.email, 'Email')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password} 
                        readOnly 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(credentials.password, 'Contraseña')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setShowCredentials(false);
                  setCredentials(null);
                }}
                className="w-full"
              >
                Entendido, he guardado las credenciales
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
