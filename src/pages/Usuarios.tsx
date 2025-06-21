
import { ProtectedContent } from '@/components/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Usuarios() {
  return (
    <ProtectedContent requiredFeature="users">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              Esta funcionalidad estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              La gestión de usuarios se encuentra en desarrollo.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
