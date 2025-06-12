
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Car, User, Users } from 'lucide-react';

interface WelcomeCardProps {
  show: boolean;
}

export function WelcomeCard({ show }: WelcomeCardProps) {
  if (!show) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>¡Bienvenido a tu Dashboard!</CardTitle>
        <CardDescription>
          Comienza configurando tu sistema para ver estadísticas en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Cartas de Porte</h3>
            <p className="text-sm text-muted-foreground">Crea tu primera carta porte</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <Car className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Vehículos</h3>
            <p className="text-sm text-muted-foreground">Registra tu flota</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Conductores</h3>
            <p className="text-sm text-muted-foreground">Añade tu equipo</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">Socios</h3>
            <p className="text-sm text-muted-foreground">Gestiona clientes y proveedores</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
