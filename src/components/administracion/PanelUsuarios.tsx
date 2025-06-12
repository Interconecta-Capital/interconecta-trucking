
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Settings, Shield } from 'lucide-react';

export function PanelUsuarios() {
  // Mock data - en producción vendría de la API
  const usuarios = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@empresa.com',
      rol: 'admin',
      estado: 'activo',
      ultimoAcceso: '2024-06-12T10:00:00Z'
    },
    {
      id: '2',
      nombre: 'María García',
      email: 'maria@empresa.com',
      rol: 'usuario',
      estado: 'activo',
      ultimoAcceso: '2024-06-11T15:30:00Z'
    }
  ];

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      case 'usuario':
        return <Badge className="bg-blue-100 text-blue-800">Usuario</Badge>;
      default:
        return <Badge variant="secondary">{rol}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </span>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {usuarios.map((usuario) => (
              <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{usuario.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRolBadge(usuario.rol)}
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Último acceso: {new Date(usuario.ultimoAcceso).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles y Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Acceso completo al sistema</li>
                  <li>• Gestión de usuarios</li>
                  <li>• Configuración avanzada</li>
                  <li>• Acceso a logs del sistema</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Acceso a funciones básicas</li>
                  <li>• Creación de cartas porte</li>
                  <li>• Gestión de vehículos</li>
                  <li>• Reportes básicos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
