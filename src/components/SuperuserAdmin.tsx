
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Crown, Shield, UserPlus, Key } from 'lucide-react';

export function SuperuserAdmin() {
  const { isSuperuser, convertToSuperuser, createSuperuserAccount } = useSuperuser();
  const [email, setEmail] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleConvertUser = async () => {
    if (!email.trim()) return;
    
    setIsConverting(true);
    await convertToSuperuser(email.trim());
    setIsConverting(false);
    setEmail('');
  };

  const handleCreateSuperuser = async () => {
    setIsCreating(true);
    const createdEmail = await createSuperuserAccount();
    setIsCreating(false);
    
    if (createdEmail) {
      // Show credentials
      alert(`Superusuario creado:\nEmail: ${createdEmail}\nPassword: SuperUser2024!`);
    }
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
                    Crea un usuario de prueba con credenciales predefinidas
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
    </div>
  );
}
